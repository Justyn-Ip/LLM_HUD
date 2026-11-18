import { Plugin } from "@opencode/plugin/tui"
import { For, createSignal } from "solid-js"

import {
  emptySnapshot,
  normalizeGoUsage,
  normalizeLimits,
  renderHud,
  type ErrorKind,
  type HudPart,
  type Snapshot,
  type Tone,
} from "./quota.ts"

type HudColor = any

type HudTheme = {
  text: {
    base: HudColor
    muted: HudColor
    feedback: {
      success: { base: HudColor }
      warning: { base: HudColor }
      error: { base: HudColor }
    }
  }
}

type Credential = {
  key: string
  orgID?: string
}

type GoUsageResult =
  | { kind: "ok"; snapshot: Snapshot }
  | { kind: "not_subscribed" | "auth" | "http" | "invalid" | "network" }

const goUsageURL = process.env.OPENCODE_HUD_USAGE_URL || "https://opencode.ai/zen/go/v1/usage"
const refreshIntervalMs = 60_000
const limitsTimeoutMs = 2_500
const requestTimeoutMs = 10_000

function colorFor(tone: Tone, theme: HudTheme): HudColor {
  switch (tone) {
    case "muted":
      return theme.text.muted
    case "success":
      return theme.text.feedback.success.base
    case "warning":
      return theme.text.feedback.warning.base
    case "error":
      return theme.text.feedback.error.base
    default:
      return theme.text.base
  }
}

function Hud(props: { snapshot: Snapshot; width: number; theme: HudTheme }) {
  const parts = () => renderHud(props.snapshot, props.width)
  return (
    <text fg={props.theme.text.base}>
      <For each={parts()}>
        {(part: HudPart) => <span style={{ fg: colorFor(part.tone, props.theme) }}>{part.text}</span>}
      </For>
    </text>
  )
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms)
    promise.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function fetchLimits(context: any, now: number): Promise<Snapshot | null> {
  const usage = context.client?.experimental?.usage
  if (!usage || typeof usage.limits !== "function") return null
  const input = context.location ? { location: context.location } : undefined
  const response = await usage.limits(input)
  return normalizeLimits(response?.data, now)
}

async function resolveCredential(context: any): Promise<Credential | null> {
  const envKey = process.env.OPENCODE_GO_API_KEY || process.env.OPENCODE_API_KEY
  if (envKey) return { key: envKey }

  const credentials = context.client?.credential
  if (!credentials || typeof credentials.list !== "function") return null
  let list: unknown
  try {
    list = await credentials.list()
  } catch {
    return null
  }
  if (!Array.isArray(list)) return null

  const active = list.filter(
    (entry: any) => entry?.integrationID === "opencode-go" && entry?.active === true,
  )
  const keyed = active.find((entry: any) => entry?.value?.type === "key" && typeof entry.value.key === "string")
  const oauth = active.find((entry: any) => entry?.value?.type === "oauth" && typeof entry.value.access === "string")
  const chosen = keyed ?? oauth
  if (!chosen) return null

  const value = chosen.value
  const key = value.type === "key" ? value.key : value.access
  const orgID = typeof value.metadata?.orgID === "string" ? value.metadata.orgID : undefined
  return { key, ...(orgID ? { orgID } : {}) }
}

async function fetchGoUsage(credential: Credential, now: number): Promise<GoUsageResult> {
  try {
    const response = await fetch(goUsageURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${credential.key}`,
        Accept: "application/json",
        ...(credential.orgID ? { "x-opencode-org-id": credential.orgID } : {}),
      },
      signal: AbortSignal.timeout(requestTimeoutMs),
    })
    if (response.status === 403) return { kind: "not_subscribed" }
    if (response.status === 401) return { kind: "auth" }
    if (!response.ok) return { kind: "http" }

    const json = await response.json()
    const snapshot = normalizeGoUsage(json, now)
    return snapshot ? { kind: "ok", snapshot } : { kind: "invalid" }
  } catch {
    return { kind: "network" }
  }
}

async function refreshSnapshot(
  context: any,
  current: () => Snapshot,
  set: (value: Snapshot | ((previous: Snapshot) => Snapshot)) => void,
): Promise<void> {
  const now = Date.now()
  const previous = current()

  const limits = await withTimeout(fetchLimits(context, now), limitsTimeoutMs).catch(() => null)
  if (limits) {
    set(limits)
    return
  }

  const credential = await resolveCredential(context)
  if (!credential) {
    set(
      previous.windows.length > 0 || previous.budget
        ? { ...previous, error: "no_credential", fetchedAt: now }
        : emptySnapshot("no_credential", now),
    )
    return
  }

  const result = await fetchGoUsage(credential, now)
  if (result.kind === "ok") {
    set(result.snapshot)
    return
  }

  const error: ErrorKind = result.kind
  set(
    previous.windows.length > 0 || previous.budget
      ? { ...previous, error, fetchedAt: now }
      : emptySnapshot(error, now),
  )
}

export default Plugin.define({
  id: "opencode.hud",
  setup(context) {
    const [snapshot, setSnapshot] = createSignal<Snapshot>(emptySnapshot())
    let disposed = false
    let inflight: Promise<void> | undefined

    const update = (value: Snapshot | ((previous: Snapshot) => Snapshot)) => {
      if (!disposed) setSnapshot(value)
    }

    const refresh = () => {
      if (disposed) return Promise.resolve()
      if (inflight) return inflight
      inflight = refreshSnapshot(context, snapshot, update)
        .catch(() => {
          if (disposed) return
          const previous = snapshot()
          setSnapshot(
            previous.windows.length > 0 || previous.budget
              ? { ...previous, error: "network", fetchedAt: Date.now() }
              : emptySnapshot("network"),
          )
        })
        .finally(() => {
          inflight = undefined
        })
      return inflight
    }

    void refresh()
    const timer = setInterval(() => void refresh(), refreshIntervalMs)
    const off =
      typeof context.data?.on === "function"
        ? context.data.on("session.execution.succeeded", () => void refresh())
        : () => {}

    const widthFor = (reserve: number) => Math.max(20, context.renderer.width - reserve)
    const home = context.ui.slot({
      append: "home.footer.status",
      render: () => <Hud snapshot={snapshot()} width={widthFor(24)} theme={context.theme} />,
    })
    const prompt = context.ui.slot({
      append: "prompt.footer.status",
      render: () => <Hud snapshot={snapshot()} width={widthFor(33)} theme={context.theme} />,
    })

    return () => {
      disposed = true
      clearInterval(timer)
      off()
      home()
      prompt()
    }
  },
})
