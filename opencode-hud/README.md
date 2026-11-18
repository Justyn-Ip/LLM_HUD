# opencode-hud

A small OpenCode TUI plugin that shows the OpenCode Go/Zen quota in the footer.

```
Go 5h ██░░░ 40% used 2h14m │ Wk █░░░░ 12% used 3d4h │ Mo ███░░ 62% used 18d
```

The line shrinks as the terminal narrows. It drops reset times first, then the
bars, then the window labels:

```
Go 5h ██░░░ 40% │ Wk █░░░░ 12% │ Mo ███░░ 62%
Go 5h 40% │ Wk 12% │ Mo 62%
Go 40/12/62%
```

## What it reads

1. `client.experimental.usage.limits()` for users signed in to OpenCode
   Console. This returns the Go 5-hour, weekly and monthly meters and any
   monthly Console budget.
2. When Console is not signed in, the active `opencode-go` credential from the
   local OpenCode credential store, sent to
   `https://opencode.ai/zen/go/v1/usage`.

The second path is the one that works with a Go API key alone. The plugin never
writes the key anywhere. It keeps only the last sanitized snapshot in memory and
refreshes once a minute and after each completed step.

## Zen

Zen is pay-as-you-go, so it has no 5-hour or weekly window. If the workspace has
a monthly Console budget, the footer shows it instead:

```
Zen Mo █░░░░ 21% used $12.40/$60 18d
```

## Install

Copy the plugin into the OpenCode plugin directory:

```sh
node opencode-hud/sync.mjs
```

Or from this directory:

```sh
npm run sync
```

Then restart the OpenCode TUI. The footer shows the HUD on the home screen and
in a session.

## Development

The pure quota and rendering logic is in `quota.ts`; the TUI wiring is in
`tui.tsx`. The root test suite builds and tests `quota.ts`:

```sh
npm run test:opencode-hud
```

Type-check the plugin wiring separately:

```sh
cd opencode-hud
npm install
npm run typecheck
```
