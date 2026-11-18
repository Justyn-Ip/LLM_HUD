# Security Policy

Please do not report secrets, raw Antigravity payloads, cookies, tokens, emails, session IDs, transcript paths, or local absolute paths in public issues.

`agy-hud` (`0.2.0-passive`, forked from `franksde/agy-hud` @ `624e7183d2d84015ff3bef4a0c3e396cdb0e3283`) is **strictly passive**:

- `agy-hud statusline` reads a single bounded (`1 MiB`) JSON object from `stdin`, sanitizes untrusted fields, formats via pure functions, writes HUD text to `stdout`, and exits.
- It makes **zero network requests**, **zero subprocess calls**, and **zero filesystem reads or writes**.
- It never invokes `agy -p /usage`, probes loopback servers, reads `.git/HEAD`, reads config/cache files, or accesses credential stores.
- `agy-hud doctor` performs only a passive in-memory runtime check (Node version, OS locale/timezone, and terminal icon probe).
- `hooks/status-line.cmd` resolves `node.exe` via `%~$PATH:i` (rejecting `%CD%\node.exe` even if `.` is on `PATH`) or standard system directories and executes only the local `dist/agy-hud.js` bundle.

See [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md) and [docs/QUOTA_PAYLOAD_COMPATIBILITY.md](docs/QUOTA_PAYLOAD_COMPATIBILITY.md) for the full audit, threat model, and compatibility report.

## Optional Codex Companion

`dist/codex-hud.js` is a separate companion process. In terminal mode it starts `codex app-server --stdio` and asks Codex for account rate limits once per minute; the Windows desktop widget (`codex/widget.ps1`) reads only quota events from local Codex session files under `CODEX_HOME` or `~/.codex`. Neither accesses credentials, and neither is imported by `agy-hud statusline`.

## Optional OpenCode TUI Plugin (opencode-hud)

`opencode-hud/` is a separate OpenCode TUI plugin that runs only inside OpenCode TUI. It queries `client.experimental.usage.limits()` or `https://opencode.ai/zen/go/v1/usage` in memory using OpenCode's active credential without writing keys to disk, and is never imported by `dist/agy-hud.js`.
