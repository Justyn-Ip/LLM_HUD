export type WindowID = "rolling" | "weekly" | "monthly";

export type Tone = "base" | "muted" | "success" | "warning" | "error";

export type ErrorKind = "no_credential" | "not_subscribed" | "auth" | "http" | "invalid" | "network";

export interface QuotaWindow {
  id: WindowID;
  label: string;
  /** Used percentage, 0..100. */
  percent: number;
  limited: boolean;
  resetsAt: number;
}

export interface QuotaBudget {
  label: string;
  /** Used percentage, 0..100. */
  percent: number;
  spent: number;
  limit: number;
  resetsAt: number;
}

export interface Snapshot {
  source: "go" | "budget" | "none";
  windows: QuotaWindow[];
  budget?: QuotaBudget;
  fetchedAt: number;
  error?: ErrorKind;
}

export interface HudPart {
  text: string;
  tone: Tone;
}

const windowOrder: WindowID[] = ["rolling", "weekly", "monthly"];
const windowLabels: Record<WindowID, string> = {
  rolling: "5h",
  weekly: "Wk",
  monthly: "Mo",
};
const staleAfterMs = 5 * 60_000;
const barCells = 5;

export function emptySnapshot(error?: ErrorKind, now = Date.now()): Snapshot {
  return { source: "none", windows: [], fetchedAt: now, ...(error ? { error } : {}) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampPercent(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function validPercent(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

/**
 * Read `GET /zen/go/v1/usage`. The response carries one meter per window:
 * `status` is `ok` or `rate-limited`, `percent` is usage, and `resetsAt` is ISO.
 */
export function normalizeGoUsage(raw: unknown, now = Date.now()): Snapshot | null {
  if (!isRecord(raw)) return null;
  const usage = raw.usage;
  if (!isRecord(usage)) return null;

  const windows: QuotaWindow[] = [];
  for (const id of windowOrder) {
    const meter = usage[id];
    if (!isRecord(meter)) return null;
    if (meter.status !== "ok" && meter.status !== "rate-limited") return null;
    if (!validPercent(meter.percent)) return null;
    if (typeof meter.resetsAt !== "string") return null;
    const resetsAt = Date.parse(meter.resetsAt);
    if (!Number.isFinite(resetsAt)) return null;

    const limited = meter.status === "rate-limited";
    windows.push({
      id,
      label: windowLabels[id],
      percent: limited ? 100 : clampPercent(meter.percent),
      limited,
      resetsAt,
    });
  }

  return { source: "go", windows, fetchedAt: now };
}

/**
 * Read `client.experimental.usage.limits()`. Go meters use epoch milliseconds
 * and a `limited` flag. Console budgets are monthly spend limits.
 */
export function normalizeLimits(data: unknown, now = Date.now()): Snapshot | null {
  if (!isRecord(data)) return null;

  const go = data.go;
  if (isRecord(go)) {
    const windows: QuotaWindow[] = [];
    let valid = true;
    for (const id of windowOrder) {
      const meter = go[id];
      if (!isRecord(meter) || !validPercent(meter.percent)) {
        valid = false;
        break;
      }
      if (typeof meter.resetsAt !== "number" || !Number.isFinite(meter.resetsAt)) {
        valid = false;
        break;
      }
      const limited = meter.limited === true;
      windows.push({
        id,
        label: windowLabels[id],
        percent: limited ? 100 : clampPercent(meter.percent),
        limited,
        resetsAt: meter.resetsAt,
      });
    }
    if (valid) return { source: "go", windows, fetchedAt: now };
  }

  const budget = selectBudget(data.budgets, now);
  if (budget) return { source: "budget", windows: [], budget, fetchedAt: now };
  return null;
}

/** Choose one monthly Console budget: the picked one, else an all-model one, else the first. */
export function selectBudget(raw: unknown, now = Date.now()): QuotaBudget | null {
  if (!Array.isArray(raw)) return null;
  const budgets = raw.filter(isRecord).filter(budget => {
    return (
      typeof budget.limit === "number" &&
      Number.isFinite(budget.limit) &&
      budget.limit > 0 &&
      typeof budget.spent === "number" &&
      Number.isFinite(budget.spent) &&
      budget.spent >= 0 &&
      typeof budget.resetsAt === "number" &&
      Number.isFinite(budget.resetsAt)
    );
  });
  if (budgets.length === 0) return null;

  const chosen = budgets.find(budget => budget.picked === true) ?? budgets.find(budget => budget.coverage === "all") ?? budgets[0];
  const limit = chosen.limit as number;
  const spent = chosen.spent as number;
  const shared = chosen.shared === true || chosen.scope === "combined";

  return {
    label: shared ? "Zen Mo shared" : "Zen Mo",
    percent: clampPercent((spent / limit) * 100),
    spent,
    limit,
    resetsAt: chosen.resetsAt as number,
  };
}

/** A compact countdown: `2h14m`, `3d4h`, `18d`, `<1m`, or `due`. */
export function formatCountdown(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "due";
  if (ms < 60_000) return "<1m";
  const totalMinutes = Math.ceil(ms / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return hours > 0 ? `${days}d${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h${String(minutes).padStart(2, "0")}m` : `${hours}h`;
  return `${minutes}m`;
}

/** Dollars with cents only when they carry information. */
export function formatMoney(usd: number): string {
  if (!Number.isFinite(usd) || usd < 0) return "$0";
  if (usd > 0 && usd < 0.01) return "<$0.01";
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
  if (Number.isInteger(usd)) return `$${usd}`;
  return `$${usd.toFixed(2)}`;
}

/** A continuous used bar. */
export function bar(percent: number, cells = barCells): string {
  const width = Math.max(1, Math.trunc(cells));
  const pct = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const filled = Math.max(0, Math.min(width, Math.trunc((pct / 100) * width + 0.5)));
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
}

function toneFor(percent: number): Tone {
  if (percent >= 90) return "error";
  if (percent >= 50) return "warning";
  return "success";
}

function percentText(window: QuotaWindow): string {
  return `${window.percent}%${window.limited ? "!" : ""}`;
}

function joinGroups(groups: HudPart[][], separator = " │ "): HudPart[] {
  const joined: HudPart[] = [];
  for (const group of groups) {
    if (joined.length > 0) joined.push({ text: separator, tone: "muted" });
    joined.push(...group);
  }
  return joined;
}

function goWindowParts(
  window: QuotaWindow,
  now: number,
  withBar: boolean,
  withReset: boolean,
  withUsedWord: boolean,
): HudPart[] {
  const parts: HudPart[] = [
    { text: `${window.label} `, tone: "muted" },
    { text: withBar ? `${bar(window.percent)} ` : "", tone: toneFor(window.percent) },
    { text: `${percentText(window)}${withUsedWord ? " used" : ""}`, tone: toneFor(window.percent) },
  ];
  if (withReset) {
    parts.push({ text: ` ${formatCountdown(window.resetsAt - now)}`, tone: "muted" });
  }
  return parts;
}

function renderGo(windows: QuotaWindow[], width: number, now: number, stale: boolean): HudPart[] {
  const prefix: HudPart = { text: stale ? "Go~" : "Go", tone: stale ? "muted" : "base" };
  const percents = windows.map(window => window.percent).join("/");

  const tiers: HudPart[][] = [
    [
      prefix,
      { text: " ", tone: "muted" },
      ...joinGroups(windows.map(window => goWindowParts(window, now, true, true, true))),
    ],
    [
      prefix,
      { text: " ", tone: "muted" },
      ...joinGroups(windows.map(window => goWindowParts(window, now, true, false, false))),
    ],
    [
      prefix,
      { text: " ", tone: "muted" },
      ...joinGroups(windows.map(window => goWindowParts(window, now, false, false, false))),
    ],
    [prefix, { text: ` ${percents}%`, tone: "base" }],
    [{ text: `${percents}%`, tone: "base" }],
    [{ text: `${windows[0].percent}%`, tone: toneFor(windows[0].percent) }],
  ];

  for (const parts of tiers) {
    if (partsLength(parts) <= width) return parts;
  }
  return tiers[tiers.length - 1];
}

function renderBudget(budget: QuotaBudget, width: number, now: number, stale: boolean): HudPart[] {
  const prefix: HudPart = { text: stale ? "Zen~" : "Zen", tone: stale ? "muted" : "base" };
  const label: HudPart = { text: ` ${budget.label.replace(/^Zen /, "")}`, tone: "muted" };
  const pct = `${budget.percent}%`;
  const money = `${formatMoney(budget.spent)}/${formatMoney(budget.limit)}`;
  const reset = formatCountdown(budget.resetsAt - now);

  const tiers: HudPart[][] = [
    [prefix, label, { text: ` ${bar(budget.percent)} ${pct} used ${money} ${reset}`, tone: toneFor(budget.percent) }],
    [prefix, label, { text: ` ${pct} ${money}`, tone: toneFor(budget.percent) }],
    [{ text: `${prefix.text} ${pct}`, tone: toneFor(budget.percent) }],
  ];

  for (const parts of tiers) {
    if (partsLength(parts) <= width) return parts;
  }
  return tiers[tiers.length - 1];
}

function errorParts(error: ErrorKind | undefined): HudPart[] {
  switch (error) {
    case "auth":
      return [{ text: "Go auth err", tone: "error" }];
    case "network":
    case "http":
    case "invalid":
      return [{ text: "Go n/a", tone: "muted" }];
    case "no_credential":
    case "not_subscribed":
    case undefined:
      return [{ text: "Go/Zen —", tone: "muted" }];
  }
}

function partsLength(parts: HudPart[]): number {
  return parts.reduce((total, part) => total + part.text.length, 0);
}

/**
 * Render a width-aware HUD. The caller maps `tone` to a terminal color.
 * This function is pure so the same snapshot always produces the same line.
 */
export function renderHud(snapshot: Snapshot, width: number, now = Date.now()): HudPart[] {
  const usableWidth = Number.isFinite(width) && width > 0 ? Math.trunc(width) : 80;
  const stale = snapshot.error !== undefined || (snapshot.fetchedAt > 0 && now - snapshot.fetchedAt > staleAfterMs);

  if (Array.isArray(snapshot.windows) && snapshot.windows.length > 0) {
    return renderGo(snapshot.windows, usableWidth, now, stale);
  }
  if (snapshot.budget) {
    return renderBudget(snapshot.budget, usableWidth, now, stale);
  }
  return errorParts(snapshot.error);
}
