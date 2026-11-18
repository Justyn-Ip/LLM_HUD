# Security Review — AGY HUD Passive Fork

## Upstream Attribution & Pinned Revision

- **Upstream Repository:** `https://github.com/franksde/agy-hud`
- **Pinned Commit SHA:** `624e7183d2d84015ff3bef4a0c3e396cdb0e3283` (v0.1.17)
- **License:** MIT (`LICENSE`, `THIRD_PARTY_NOTICES.md`)
- **Fork Version:** `0.2.0-passive`

## Upstream Inventory & Removals

### Upstream Active Capabilities Removed

| Upstream Component | Previous Behavior | Action in Passive Fork |
|---|---|---|
| `src/quotaProbe.ts` | Spawned `ps`/`lsof`, probed local loopback HTTP/HTTPS ports, read CSRF tokens from process args, wrote `.server.json` hints | **Deleted** from source and bundle |
| `src/usageCommand.ts` | Spawned `agy -p /usage --output-format json`, managed scratch dirs and `taskkill /T` | **Deleted** from source and bundle |
| `src/gitinfo.ts` | Traversed filesystem up to 8 parent dirs reading `.git/HEAD` and `gitdir:` files | **Deleted** from source and bundle; uses sanitized `payload.vcs.branch` only |
| `src/main.ts` | Read/wrote `~/.cache/agy-hud/*` (`quota_cache.json`, `.lock`, `.statusline.json`, `.auth-rejected.json`), read `config.json`, spawned detached background `node` refreshes | **Refactored** to bounded stdin (`1 MiB`, configurable timeout) -> pure render -> stdout |
| `src/config.ts` | Imported `node:fs` and read config files from env/XDG/plugin/home paths | **Refactored** to static build-time defaults + safe non-secret CLI flags |
| `src/doctor.ts` | Read user `settings.json`, scanned font directories, spawned `fc-list` and `agy plugin list --json` | **Replaced** with strictly passive runtime self-check (no `fs`, no `child_process`, no `os`) |

### Retained Production Dependencies

Pinned in `package-lock.json` (MIT-licensed, pure in-memory string/Unicode utilities):
- `emoji-regex` (`^10.6.0`)
- `strip-ansi` (`^6.0.1`)
- `string-width` (`^4.2.3`)

No new runtime dependencies were added, and `package.json` defines zero npm lifecycle (`preinstall`/`install`/`postinstall`) scripts.

### Production Entry Points & Hooks

- `src/main.ts` -> bundled to `dist/agy-hud.js` (`esbuild --platform=node --target=node18 --format=cjs`)
- `hooks/status-line.cmd` (Windows `cmd.exe` launcher, CRLF line endings)
- `hooks/status-line.sh` (POSIX `sh` launcher)

## Threat Model

| Threat | Mitigation |
|---|---|
| **Untrusted stdin payload / terminal escape injection** | `sanitizePlainText` strips ANSI CSI/OSC sequences (`strip-ansi`), C0/C1 control characters (`\p{Cc}`), and non-shaping format/bidi override characters (`\p{Cf}` except ZWJ/ZWNJ/tags) across model names, `cwd`, `vcs.branch`, `agent_state`, `conversation_title`, and quota bucket IDs; enforces max column widths (`model` 18, `title` 24, `cwd` 32, `bucket` 32, `branch` 40, `state` 20); `plan_tier` and `cycle_mode` use strict allowlists. |
| **Memory / CPU DoS via oversized or malformed stdin** | `readStdinBounded` caps input at `1 MiB` (`1048576` bytes), rejects invalid UTF-8 via `TextDecoder("utf-8", { fatal: true })`, accepts only top-level plain JSON objects, and enforces a configurable timeout (`1000 ms` default, `50..10000 ms` range). |
| **Secret / raw payload leakage** | Error/fallback paths return static `agy-hud` or generic flag errors without echoing stdin bytes, emails, session/conversation IDs, transcript paths, or environment variables. |
| **Windows `cmd.exe` current-directory `node.exe` hijacking** | `hooks/status-line.cmd` never invokes bare `node`/`more`/`where`; resolves `node.exe` strictly via `%~$PATH:i`, normalizes with `%%~ff`, rejects any match in `%CD%\node.exe` (even if `.` is in `PATH`), and falls back only to `%ProgramFiles%\nodejs\node.exe` or `%LocalAppData%\Programs\nodejs\node.exe`, then executes `"%~dp0..\dist\agy-hud.js" statusline`. |
| **Cross-pane Herdr contention / side effects** | Zero shared caches, locks, temp files, or background processes; verified with 20 concurrent simulated invocations. |
| **Quota miscalculation / ambiguous time assumptions** | `remaining_fraction` must be finite in `[0, 1]` (`100 * remaining_fraction`, never inverted); ambiguous local `reset_time` strings without explicit `Z` or `±HH:MM` offset are rejected; `reset_in_seconds` fallback is visibly marked `~ ... (estimated)`; past-due resets render `Reset due / awaiting update`. |

## Forbidden-API & Bundle Verification

1. **Static Source & Bundle Audit (`npm run lint` -> `scripts/audit.js`, plus `test/security_audit.test.ts`):**
   - Verified zero imports/requires of `fs`, `node:fs`, `fs/promises`, `child_process`, `http`, `https`, `http2`, `net`, `tls`, `dgram`, `dns`, `os`, `worker_threads`, `vm` across all 6 files in `src/` and across the generated `dist/agy-hud.js`.
   - Verified zero `fetch()`, `XMLHttpRequest`, hard-coded `Asia/Hong_Kong` / `UTC+08:00` / `en-HK`, or credential-store APIs (`SecKeychain`, `CredRead`, `dpapi`, `keytar`).
2. **Runtime Blocked-API Test (`test/main.test.ts`):**
   - Preloaded a `Module._load` hook that throws on any `fs`, `child_process`, `http`, `https`, `net`, `tls`, `dgram`, `dns` load and stubs `globalThis.fetch` to throw; executed `dist/agy-hud.js statusline` and confirmed valid HUD output with exit code `0`.
3. **Windows `.cmd` Hijack Test (`test/hook.test.ts`):**
   - Placed a decoy `node.exe` (copy of `whoami.exe`) and decoy `node.bat` / `node.cmd` in a temporary working directory; executed `hooks/status-line.cmd` with both default `PATH` and `.;<tempCwd>;` prepended to `PATH`; verified the decoy scripts never ran and the real bundle rendered HUD output cleanly.
4. **Bundle Checksum (`dist/agy-hud.js`):**
   - Size: `70.8 kb`
   - SHA-256: `edf7de705ac7203d83bf9902ccabd5c56239ee02695a49d3f287844302a49e53` (recorded in `dist/agy-hud.js.sha256`).

## Residual Risks

- **Passive-by-design is not an OS sandbox:** Node.js runs with the invoking user's OS privileges. Security relies on auditing the small, dependency-light bundle (`70.8 kb`) and verifying its SHA-256 checksum before deployment.
- **System `PATH` trust:** While `hooks/status-line.cmd` blocks current-working-directory `node.exe`/`node.bat` hijacking, an attacker who controls directories already listed in the user's system `PATH` could still supply a trojan `node.exe`. Users in untrusted environments can wire `/statusline` directly to an explicit full path to `node.exe` (using 8.3 short paths if the path contains spaces).
- **Terminal font rendering:** Private Use Area Nerd Font icons still depend on the user's terminal font; pass `--no-icons` if boxes appear.
