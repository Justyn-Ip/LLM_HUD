# Codex Quota Companion

Codex CLI's built-in footer shows remaining quota percentages. It does not show the quota reset times. The companion shows each available Codex quota window with its remaining percentage, reset countdown, and absolute reset date and time in the computer's local timezone.

## Desktop widget on Windows

Build the project, then double-click `codex/widget.cmd`. The panel opens near the top-right of the desktop above the wallpaper. Normal app windows can cover it. Right-click **Codex quota** in the notification area to **Hide**, **Show**, or **Exit**. If you do not see its icon, check under the taskbar's hidden icons arrow.

To change the panel's position or size, choose **Move or resize** from the tray menu. Drag the title bar or a window edge, then choose **Pin to desktop**. The widget saves its size and position for the next launch. It brings the panel back into view if a monitor was disconnected or the old size no longer fits. If Explorer's desktop window is unavailable, the panel opens as a small floating window and you can retry **Pin to desktop** from the tray.

The widget renders as a compact dark rounded card with a **Codex Quota** header, an **Updated** timestamp in the top-right corner showing when Codex last recorded quota, and a custom system tray icon. Each quota window (**5 Hour** and **Weekly**) displays its label, remaining percentage, a color-coded progress bar (green above 50%, amber at 20–50%, red below 20%), and reset time below. The widget reads the latest quota snapshot from recent local sessions and checks for a newer snapshot once per minute. Usage can stay unchanged while Codex is idle.

The widget needs Node.js 18 or newer on `PATH`. It reads the session directory under `CODEX_HOME` or, by default, under `~/.codex`. It does not launch Codex, sign in, or access credentials. If it shows `Codex quota unavailable. Check Codex login.`, use your normal Codex session to complete a turn so Codex can record quota.

## Terminal companion

To show the companion in a terminal pane instead:

```sh
npm ci
npm run build
node dist/codex-hud.js
```

On Windows PowerShell, use:

```powershell
npm.cmd ci
npm.cmd run build
node .\dist\codex-hud.js
```

The terminal companion refreshes once per minute. Press `Ctrl+C` to stop it. It checks existing CLI authentication and does not start an interactive login flow.

If it prints `Codex quota unavailable`, check `codex login status`. Sign in with `codex login` if needed.

## Data source

The terminal companion starts `codex app-server --stdio` and calls its `account/rateLimits/read` method. Codex app-server uses the existing Codex login. The desktop widget instead reads only quota events from local Codex session files and displays no transcript content.

The app-server protocol is experimental. This implementation follows the protocol schema exposed by Codex CLI 0.170.0. Older or future versions can return `Codex quota unavailable` if the method or account data is unavailable.

The companion labels 300-minute and 10,080-minute windows as `5h` and `Weekly`. It labels other window durations from the server metadata. It omits windows with invalid usage percentages and reports missing reset times without estimating them.
