# Quota Payload Compatibility Report

## Diagnostic Gate Status

**Status:** `PASS` — Live interactive `agy` `1.5.11` confirmed `payload.quota` delivery via `/statusline D:\Codebase\LLM_HUD\hooks\status-line.cmd`.

When `payload.quota` is present, the strictly passive renderer displays **all** valid quota buckets with their group/window names, remaining percentages, reset countdowns, and OS-locale/timezone absolute reset timestamps. When `payload.quota` is absent or malformed, it renders `Quota N/A` without invoking `/usage`, probing loopback servers, or reading credentials.

## Environment & Version

- **Installed CLI:** `agy` version `1.5.11` (`C:\Users\Justyn\AppData\Local\agy\bin\agy.EXE`)
- **Platform:** Windows (`win32`), Node.js `v24.22.1`
- **Upstream Base:** `https://github.com/franksde/agy-hud` @ `624e7183d2d84015ff3bef4a0c3e396cdb0e3283`

## Findings

### 1. Live Interactive Verification (`agy` 1.5.11)

- Wired `/statusline D:\Codebase\LLM_HUD\hooks\status-line.cmd` in an interactive `agy` `1.5.11` terminal session on Windows.
- Confirmed `agy` populates `payload.quota` on status-line redraws (`gemini-argon-wtu-weekly` observed when running on an Argon model, and all account buckets rendered cleanly once model-based filtering was removed).
- Confirmed multi-bucket output displays all 5 account buckets (`Gemini 5h`, `Gemini Weekly`, `Argon Weekly`, `Claude/GPT 5h`, `Claude/GPT Weekly`) with remaining percentage, countdown, and absolute reset date/time.

### 2. Non-Invasive CLI & Binary Inspection (`agy` 1.5.11)

1. **`agy -p "/usage" --output-format json`** succeeded (exit code `0`) and confirmed the 5 account quota buckets:
   - `Gemini Models`: `gemini-5h`, `gemini-weekly`
   - `Claude and GPT models`: `3p-5h`, `3p-weekly`
   - `Gemini 4 Argon`: `gemini-argon-wtu-weekly`
2. **Binary struct-tag inspection of `agy.EXE` (`1.5.11`):**
   - `third_party/jetski/cli/types/statusline_external.go` and `third_party/jetski/cli/store/statusline_data_builder.go` define `StatusLineData` (`quota`, `vcs.branch`, `terminal_width`, `cycle_mode`, `conversation_title`, `cost`) and `StatusLineQuotaBucket` (`remaining_fraction`, `reset_time`, `reset_in_seconds`).
3. **Upstream Sanitized Fixtures (`testdata/`):**
   - `testdata/statusline_payload_1.3.5.json` (`version: "1.3.5"`, 4 buckets) and `testdata/statusline_payload_1.4.5.json` (`version: "1.4.5"`, 5 buckets) confirm consistent schema across CLI releases.

### 3. Non-Interactive Print Mode Note

- Non-interactive print mode (`agy -p`) and headless `ConPTY` probes did not trigger `StatusLineRunner` in `1.5.11`; live status-line verification requires an interactive `agy` terminal session.
