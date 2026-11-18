# Windows Installation, Verification, Herdr Validation & Rollback

## Upstream Attribution

- **Upstream:** `https://github.com/franksde/agy-hud` (MIT License)
- **Pinned Base SHA:** `624e7183d2d84015ff3bef4a0c3e396cdb0e3283` (`0.1.17`)
- **Passive Fork Version:** `0.2.0-passive`

## Build & Checksum Verification (From Pinned Lockfile)

```powershell
npm ci
npm test
```

`npm test` runs in order:
1. `npm run typecheck` (checks both the agy and Codex TypeScript projects)
2. `npm run build` (builds `dist/agy-hud.js` and the separate `dist/codex-hud.js` companion)
3. `npm run build:test` (cleans both build directories and compiles both test projects)
4. `npm run lint` (`node scripts/audit.js` — verifies source/bundle passive invariants and prints SHA-256)
5. Runs the agy tests and the isolated Codex companion tests

Verify the bundle SHA-256 matches `dist/agy-hud.js.sha256`:

```powershell
(Get-FileHash -LiteralPath .\dist\agy-hud.js -Algorithm SHA256).Hash.ToLower()
Get-Content .\dist\agy-hud.js.sha256
```

## Windows Installation (`agy` Standalone)

1. Stage or keep the audited plugin directory (`plugin.json`, `hooks/status-line.cmd`, `hooks/status-line.sh`, `dist/agy-hud.js`, `LICENSE`, `THIRD_PARTY_NOTICES.md`).
2. Back up your current `settings.json` before changing `statusLine`:

```powershell
Copy-Item "$env:USERPROFILE\.gemini\antigravity-cli\settings.json" "$env:USERPROFILE\.gemini\antigravity-cli\settings.json.bak"
```

3. Inside an interactive `agy` session, wire `/statusline` without quotes (Antigravity escapes quotes to `\"` on Windows; use 8.3 short names if any segment contains spaces):

```text
/statusline D:\Codebase\LLM_HUD\hooks\status-line.cmd
```

Or wire directly to Node + bundle (no `.cmd` wrapper):

```text
/statusline C:\PROGRA~1\nodejs\node.exe D:\Codebase\LLM_HUD\dist\agy-hud.js statusline
```

## Verification

1. Passive self-check:

```powershell
node .\dist\agy-hud.js version
node .\dist\agy-hud.js doctor --json
```

2. Smoke test with sample stdin payloads:

Wide (120 columns, single bucket):
```powershell
'{"model":{"display_name":"Gemini 3.5 Flash (Medium)"},"context_window":{"used_percentage":24},"agent_state":"idle","plan_tier":"Google AI Pro","vcs":{"branch":"main"},"cwd":"agy-hud","terminal_width":120,"quota":{"gemini-5h":{"remaining_fraction":0.72,"reset_time":"2026-11-20T18:00:00Z"}}}' | node .\dist\agy-hud.js statusline --no-color --no-icons --locale=en-US --time-zone=Asia/Hong_Kong
```
Observed output:
```text
3.5 Flash Med | Pro │ agy-hud │ main │ Idle
Context ██░░░░░░░░ 24% │ Quota: Gemini 5h: 72% left (2d 4h 10m, 21-Nov-2026 2:00 AM)
```

Wide (120 columns, all 5 account buckets grouped horizontally uniformly without bars, aligned Weekly column):
```text
4 Argon Med | Pro | Auto │ agy-hud │ main │ Idle
Context ██░░░░░░░░ 24%
 Gemini     │ 5h: 79% left (2h 56m, 19-Nov-2026 12:49 AM)  │ Weekly: 86% left (6d 10h 18m, 25-Nov-2026 8:11 AM)
 Argon      │                                              │ Weekly: 98% left (6d 21h 53m, 25-Nov-2026 7:46 PM)
 Claude/GPT │ 5h: 100% left (3h 01m, 19-Nov-2026 12:53 AM) │ Weekly: 100% left (6d 22h 01m, 25-Nov-2026 7:53 PM)
```

Medium (80 columns, uniform countdown tier, aligned Weekly column):
```text
4 Argon Med | Pro | Auto │ agy-hud │ main │ Idle
Context ██░░░░░░░░ 24%
 Gemini     │ 5h: 79% left (2h 56m)  │ Weekly: 86% left (6d 10h 18m)
 Argon      │                        │ Weekly: 98% left (6d 21h 53m)
 Claude/GPT │ 5h: 100% left (3h 01m) │ Weekly: 100% left (6d 22h 01m)
```

Compact (60 columns):
```text
4 Argon Med | Pro | Auto │ agy-hud │ main │ Idle
Context ██░░░░░░░░ 24%
Gemini: 5h: 79% (2h 59m) | Weekly: 86% (6d 10h 21m)
Argon: Weekly: 98% (6d 21h 55m)
Claude/GPT: 5h: 100% (3h 03m) | Weekly: 100% (6d 22h 03m)
```

Narrow (40 columns):
```text
4 Argon Med | Pro | Auto │ main │ Idle
Context ██░░░░░░░░ 24%
Gemini: 5h: 79% | Weekly: 86%
Argon: Weekly: 98%
Claude/GPT: 5h: 100% | Weekly: 100%
```

Missing / invalid quota (`Quota N/A`):
```text
3.5 Flash Med | Pro │ Idle
Context ██░░░░░░░░ 24% │ Quota N/A
```

## Herdr Multi-Pane Validation Notes

- Every invocation of `dist/agy-hud.js` is stateless (`stdin -> pure transform -> stdout -> exit`), creating zero lock files, zero cache files, zero `.server.json` hints, and zero child `agy` processes.
- Multiple concurrent `agy` panes running in Herdr cannot trigger duplicate `/usage` runs, cross-pane cache contention, or terminal window flashes.
- Validated in `test/main.test.ts` with 20 concurrent simulated `runCli` invocations across mixed models, branches, and terminal widths (`Promise.all`), plus blocked `fs`/`child_process`/`http`/`https`/`net`/`tls`/`fetch` runtime enforcement.

## Rollback Instructions

1. Clear the custom status line inside `agy`:
```text
/statusline delete
```
2. Or restore your backed-up `settings.json`:
```powershell
Copy-Item -Force "$env:USERPROFILE\.gemini\antigravity-cli\settings.json.bak" "$env:USERPROFILE\.gemini\antigravity-cli\settings.json"
```
3. To revert the repository to upstream `0.1.17` (`624e7183d2d84015ff3bef4a0c3e396cdb0e3283`):
```powershell
git checkout 624e7183d2d84015ff3bef4a0c3e396cdb0e3283
```

## Concise Changelog (vs Upstream `0.1.17` @ `624e718`)

- **Strictly Passive Runtime:** Removed `src/quotaProbe.ts`, `src/usageCommand.ts`, `src/gitinfo.ts`, all `fs` config/cache/lock/state reads and writes, all loopback HTTP/HTTPS probes, all `/usage` subprocess spawns, and `agy plugin list` / `fc-list` execution.
- **Bounded & Validated Stdin:** Enforced 1 MiB stdin byte cap, configurable timeout (`--stdin-timeout-ms`), strict UTF-8 validation, top-level plain JSON object check, and secret-free fallback (`agy-hud`).
- **Accurate Quota & Time Display:** Enforced `remaining_fraction` in `[0, 1]` (`100 * remaining_fraction`, never inverted), timezone-aware `reset_time` validation (rejecting ambiguous local timestamps), `Xd Yh Zm` / `<1m` countdown rounded up to next minute, runtime OS locale/timezone via `Intl.DateTimeFormat(undefined, options)` (no hard-coded HK/24h defaults), `~ ... (estimated)` marking for `reset_in_seconds` fallback, `Reset due / awaiting update` for past-due resets, and `Quota N/A` when missing/malformed.
- **Input Sanitization & Width Degradation:** Stripped ANSI/OSC/control/bidi chars and enforced max column lengths on model names, branches, bucket IDs, cwd, and `agent_state`; preserved graceful width degradation across `40`/`60`/`80`/`120` columns.
- **Hardened Windows Launcher & Audit:** Guarded `hooks/status-line.cmd` against `.` / `%CD%\node.exe` hijacking; added `scripts/audit.js` and security/compatibility test suites.
