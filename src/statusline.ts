import { sanitizePlainText, truncateColumns, visibleLen } from "./ansi";
import { Config } from "./config";
import {
  NormalizedQuota,
  NormalizedQuotaBucket,
  NormalizedQuotaGroup,
  normalizeQuota,
  OfficialQuotaBucket
} from "./quota";

const colorReset = "\x1b[0m";
const colorBlue = "\x1b[34m";
const colorGreen = "\x1b[32m";
const colorYellow = "\x1b[33m";
const colorCyan = "\x1b[36m";
const colorMagenta = "\x1b[35m";
const colorRed = "\x1b[31m";
const colorOrange = "\x1b[38;5;208m";
const colorMuted = "\x1b[90m";

export interface Payload {
  cwd?: string;
  session_id?: string;
  conversation_id?: string;
  conversation_title?: string;
  version?: string;
  transcript_path?: string;
  email?: string;
  model?: {
    id?: string;
    display_name?: string;
  };
  context_window?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
    context_window_size?: number;
    used_percentage?: number;
    remaining_percentage?: number;
    current_usage?: unknown;
  };
  quota?: Record<string, OfficialQuotaBucket>;
  agent_state?: string;
  cycle_mode?: unknown;
  plan_tier?: string;
  terminal_width?: number;
  vcs?: {
    type?: string;
    branch?: string;
    root?: string;
  };
  workspace?: {
    current_dir?: string;
    project_dir?: string;
  };
  cost?: {
    total_usd?: number;
    subagent_usd?: number;
    estimated?: boolean;
  };
}

export interface RenderOptions {
  config: Config;
  gitBranch?: string;
  now?: Date;
}

const titleColumns = 24;
const modelMaxColumns = 18;
const cwdMaxColumns = 32;
const branchMaxColumns = 40;
const stateMaxColumns = 20;

export function shortModelName(display: string): string {
  let short = sanitizePlainText(display, 64);
  short = short.split("Gemini").join("");
  short = short.split("Claude").join("");
  short = short.split("Thinking").join("");
  short = short.split("(").join("");
  short = short.split(")").join("");
  short = short.split("Medium").join("Med");
  short = short.trim().split(/\s+/).filter(Boolean).join(" ");
  if (visibleLen(short) > modelMaxColumns) {
    short = `${truncateColumns(short, modelMaxColumns - 3)}...`;
  }
  return short;
}

export function formatCost(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) {
    return "$0.00";
  }
  if (usd >= 0.01) {
    return `$${usd.toFixed(2)}`;
  }
  if (usd >= 0.001) {
    return `$${usd.toFixed(3)}`;
  }
  return "<$0.001";
}

function baseName(rawPath: unknown): string {
  if (typeof rawPath !== "string") return "";
  const parts = rawPath.split(/[/\\]+/).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "";
}

function renderTitle(raw: unknown, config: Config): string {
  if (!config.showTitle) return "";
  const clipped = sanitizePlainText(raw, titleColumns);
  if (clipped === "") return "";
  return colorize(clipped, colorMuted, config.color);
}

function renderCost(cost: Payload["cost"], config: Config): string {
  const usd = cost?.total_usd;
  if (!config.showCost || typeof usd !== "number" || !Number.isFinite(usd) || usd < 0) return "";
  return colorize(`${cost?.estimated === true ? "~" : ""}${formatCost(usd)}`, colorCyan, config.color);
}

/**
 * Pure status-line renderer. Reads only validated payload fields and static/CLI config.
 */
export function render(payload: Payload, opts: RenderOptions): string {
  const config = opts.config;
  const width =
    typeof payload.terminal_width === "number" && Number.isFinite(payload.terminal_width) && payload.terminal_width > 0
      ? Math.trunc(payload.terminal_width)
      : 80;

  const rawModel = payload.model?.display_name || payload.model?.id || "Gemini";
  const modelDisplay = sanitizePlainText(rawModel, 64) || "Gemini";
  const modelSegment =
    renderModelSegment(shortModelName(modelDisplay), typeof payload.plan_tier === "string" ? payload.plan_tier : "", config) +
    renderMode(payload.cycle_mode, config);

  const ctxPct = contextPercent(payload.context_window);
  const stateLabel = state(sanitizePlainText(payload.agent_state ?? "", stateMaxColumns));
  const branch = config.showGitBranch
    ? sanitizePlainText(opts.gitBranch ?? payload.vcs?.branch ?? "", branchMaxColumns)
    : "";
  const now = opts.now ?? new Date();
  const quota = normalizeQuota(payload.quota, modelDisplay, now, {
    locale: config.locale,
    timeZone: config.timeZone
  });

  if (config.multiline) {
    return renderMultiline(payload, config, width, modelSegment, ctxPct, quota, branch, stateLabel);
  }
  return renderSingleLine(payload, config, width, modelSegment, ctxPct, quota, branch, stateLabel);
}

function renderHeaderLine(
  payload: Payload,
  config: Config,
  width: number,
  modelSegment: string,
  branch: string,
  stateLabel: string
): string {
  const dirName = config.showCWD ? sanitizePlainText(baseName(payload.cwd), cwdMaxColumns) : "";
  const line1Parts = [colorize(modelSegment, colorBlue, config.color)];
  if (dirName !== "") {
    line1Parts.push(colorize(`${withIcon(config, " ", "")}${dirName}`, colorYellow, config.color));
  }
  if (branch !== "") {
    line1Parts.push(colorize(renderGitSegment(branch, config), colorMagenta, config.color));
  }
  const stateText = config.showAgentState ? colorize(stateLabel, stateColor(stateLabel), config.color) : "";
  const titleText = renderTitle(payload.conversation_title, config);
  const costText = renderCost(payload.cost, config);

  // Drop title first, then cost, then dir, then branch, then state.
  let line1 = joinHeader(...line1Parts, titleText, stateText, costText);
  if (visibleLen(line1) > width) {
    line1 = joinHeader(...line1Parts, stateText, costText);
  }
  if (visibleLen(line1) > width) {
    line1 = joinHeader(...line1Parts, stateText);
  }
  if (visibleLen(line1) > width) {
    const git = branch !== "" ? colorize(renderGitSegment(branch, config), colorMagenta, config.color) : "";
    line1 = joinHeader(colorize(modelSegment, colorBlue, config.color), git, stateText);
  }
  if (visibleLen(line1) > width) {
    line1 = joinHeader(colorize(modelSegment, colorBlue, config.color), stateText);
  }
  if (visibleLen(line1) > width) {
    line1 = colorize(modelSegment, colorBlue, config.color);
  }
  return fit(line1, width);
}

function renderMultiline(
  payload: Payload,
  config: Config,
  width: number,
  modelSegment: string,
  ctxPct: number,
  quota: NormalizedQuota,
  branch: string,
  stateLabel: string
): string {
  const line1 = renderHeaderLine(payload, config, width, modelSegment, branch, stateLabel);

  if (quota.groups.length > 1 || quota.buckets.length > 1) {
    const ctxLine = fitContextLine(payload.context_window, config, ctxPct, width);
    const groupLabelWidth = Math.min(14, Math.max(...quota.groups.map(g => visibleLen(g.groupLabel))));
    const quotaLines = renderUniformQuotaGroupLines(quota.groups, config, width, groupLabelWidth);
    return [line1, ctxLine, ...quotaLines].join("\n");
  }

  const line2 = fitSingleQuotaLine2(payload.context_window, config, ctxPct, quota, width);
  return `${line1}\n${line2}`;
}

function fitContextLine(ctxWindow: Payload["context_window"], config: Config, ctxPct: number, width: number): string {
  const candidates = [
    `Context ${config.showProgressBar ? `${progressBar(ctxPct, 10, config.color)} ` : ""}${contextValue(config, ctxWindow, ctxPct)}`,
    `Context ${contextValue(config, ctxWindow, ctxPct)}`,
    `Ctx ${formatInt(ctxPct)}%`,
    `${formatInt(ctxPct)}%`
  ];
  for (const candidate of candidates) {
    if (visibleLen(candidate) <= width) return candidate;
  }
  return fit(`${formatInt(ctxPct)}%`, width);
}

function fitSingleQuotaLine2(
  ctxWindow: Payload["context_window"],
  config: Config,
  ctxPct: number,
  quota: NormalizedQuota,
  width: number
): string {
  const ctxFull = `Context ${config.showProgressBar ? `${progressBar(ctxPct, 10, config.color)} ` : ""}${contextValue(config, ctxWindow, ctxPct)}`;
  const ctxNoBar = `Context ${contextValue(config, ctxWindow, ctxPct)}`;
  const ctxPctOnly = `Context ${formatInt(ctxPct)}%`;
  const ctxTiny = `Ctx ${formatInt(ctxPct)}%`;

  if (!quota.hasQuota || quota.buckets.length === 0) {
    const naText = colorize("Quota N/A", colorMuted, config.color);
    const candidates = [
      joinHeader(ctxFull, naText),
      joinHeader(ctxNoBar, naText),
      joinHeader(ctxPctOnly, naText),
      join(ctxTiny, "Quota N/A"),
      join(ctxTiny, "Q N/A"),
      `${formatInt(ctxPct)}%`
    ];
    for (const c of candidates) {
      if (visibleLen(c) <= width) return c;
    }
    return fit(`${formatInt(ctxPct)}%`, width);
  }

  const bucket = quota.buckets[0];
  const qFull = formatSingleBucket(bucket, config, { dateMode: "full", prefix: "Quota: " });
  const qShortDate = formatSingleBucket(bucket, config, { dateMode: "short", prefix: "Quota: " });
  const qCountdownOnly = formatSingleBucket(bucket, config, { dateMode: "none", prefix: "Quota: " });
  const qPctOnly = `Quota: ${bucket.label}: ${quotaAmountText(bucket, config)}`;
  const qCompact = `${bucket.label}: ${quotaAmountText(bucket, config)}`;
  const qTiny = `${bucket.label}: ${quotaCompactPct(bucket, config)}`;

  const candidates = [
    joinHeader(ctxFull, qFull),
    joinHeader(ctxNoBar, qFull),
    joinHeader(ctxPctOnly, qFull),
    joinHeader(ctxPctOnly, qShortDate),
    joinHeader(ctxPctOnly, qCountdownOnly),
    joinHeader(ctxTiny, qCountdownOnly),
    join(ctxTiny, qPctOnly),
    join(ctxTiny, qCompact),
    join(ctxTiny, qTiny),
    `${formatInt(ctxPct)}%`
  ];
  for (const c of candidates) {
    if (visibleLen(c) <= width) return c;
  }
  return fit(`${formatInt(ctxPct)}%`, width);
}

interface GroupWindowFormatOptions {
  includeLeftWord: boolean;
  dateMode: "full" | "short" | "none" | "omit";
  pastDueShort: boolean;
}

function formatGroupWindow(
  win: NormalizedQuotaBucket,
  config: Config,
  opts: GroupWindowFormatOptions
): string {
  const labelPart = win.windowLabel !== "" ? `${win.windowLabel}: ` : "";
  const pctPart =
    config.usageValue === "percent"
      ? `${formatInt(win.usedPct)}%${opts.includeLeftWord ? " used" : ""}`
      : `${formatInt(win.remainingPct)}%${opts.includeLeftWord ? " left" : ""}`;

  let resetPart = "";
  if (opts.dateMode !== "omit") {
    if (win.resetPastDue) {
      resetPart = opts.pastDueShort ? " (Reset due)" : " (Reset due / awaiting update)";
    } else if (win.resetAt !== null) {
      if (opts.dateMode === "full") {
        resetPart = ` (${win.countdownText}, ${win.absoluteText})`;
      } else if (opts.dateMode === "short") {
        resetPart = ` (${win.countdownText}, ${win.shortAbsoluteText})`;
      } else {
        resetPart = ` (${win.countdownText})`;
      }
    }
  }
  return `${labelPart}${pctPart}${resetPart}`;
}

interface GroupTierSpec {
  padded: boolean;
  sep: string;
  opts: GroupWindowFormatOptions;
}

const groupTiers: GroupTierSpec[] = [
  {
    padded: true,
    sep: " │ ",
    opts: { includeLeftWord: true, dateMode: "full", pastDueShort: false }
  },
  {
    padded: true,
    sep: " │ ",
    opts: { includeLeftWord: true, dateMode: "short", pastDueShort: false }
  },
  {
    padded: true,
    sep: " │ ",
    opts: { includeLeftWord: false, dateMode: "short", pastDueShort: true }
  },
  {
    padded: true,
    sep: " │ ",
    opts: { includeLeftWord: true, dateMode: "none", pastDueShort: true }
  },
  {
    padded: false,
    sep: " | ",
    opts: { includeLeftWord: true, dateMode: "none", pastDueShort: true }
  },
  {
    padded: false,
    sep: " | ",
    opts: { includeLeftWord: false, dateMode: "none", pastDueShort: true }
  },
  {
    padded: false,
    sep: " | ",
    opts: { includeLeftWord: false, dateMode: "omit", pastDueShort: true }
  }
];

function renderGroupLinesAtTier(
  groups: NormalizedQuotaGroup[],
  config: Config,
  groupLabelWidth: number,
  tier: GroupTierSpec
): string[] {
  if (tier.padded) {
    const has5h = groups.some(g => g.windows.some(w => w.windowLabel === "5h"));
    const hasSecondary = groups.some(g => g.windows.some(w => w.windowLabel !== "5h"));
    if (has5h && hasSecondary) {
      const rows = groups.map(group => {
        const win5h = group.windows.find(w => w.windowLabel === "5h");
        const otherWins = group.windows.filter(w => w.windowLabel !== "5h");
        return {
          group,
          col5hText: win5h ? formatGroupWindow(win5h, config, tier.opts) : "",
          otherTexts: otherWins.map(w => formatGroupWindow(w, config, tier.opts))
        };
      });
      const col5hWidth = Math.max(0, ...rows.map(r => visibleLen(r.col5hText)));
      if (col5hWidth > 0) {
        return rows.map(row => {
          const header = ` ${padRightColumns(row.group.groupLabel, groupLabelWidth)} │ `;
          const col5hCell = padRightColumns(row.col5hText, col5hWidth);
          return `${header}${col5hCell}${row.otherTexts.length > 0 ? tier.sep + row.otherTexts.join(tier.sep) : ""}`;
        });
      }
    }
  }
  return groups.map(group => {
    const header = tier.padded
      ? ` ${padRightColumns(group.groupLabel, groupLabelWidth)} │ `
      : `${group.groupLabel}: `;
    const body = group.windows.map(win => formatGroupWindow(win, config, tier.opts)).join(tier.sep);
    return `${header}${body}`;
  });
}

function renderUniformQuotaGroupLines(
  groups: NormalizedQuotaGroup[],
  config: Config,
  width: number,
  groupLabelWidth: number
): string[] {
  for (const tier of groupTiers) {
    const rendered = renderGroupLinesAtTier(groups, config, groupLabelWidth, tier);
    if (rendered.every(line => visibleLen(line) <= width)) {
      return rendered;
    }
  }
  const fallbackTier = groupTiers[groupTiers.length - 1];
  return renderGroupLinesAtTier(groups, config, groupLabelWidth, fallbackTier).map(line => fit(line, width));
}

function renderSingleLine(
  payload: Payload,
  config: Config,
  width: number,
  modelSegment: string,
  ctxPct: number,
  quota: NormalizedQuota,
  branch: string,
  stateLabel: string
): string {
  const coloredBadge = colorize(modelSegment, colorBlue, config.color);
  const ctx = `Ctx ${contextValue(config, payload.context_window, ctxPct)}`;
  const ctxSimple = `Ctx ${formatInt(ctxPct)}%`;
  const tokens = config.contextValue === "percent" ? colorize(tokenDetail(payload.context_window), colorMuted, config.color) : "";
  const bar = config.showProgressBar ? progressBar(ctxPct, 10, config.color) : "";
  const branchText = branch !== "" ? colorize(renderGitSegment(branch, config), colorMagenta, config.color) : "";
  const stateText = config.showAgentState ? colorize(stateLabel, stateColor(stateLabel), config.color) : "";
  const costText = renderCost(payload.cost, config);
  const titleText = renderTitle(payload.conversation_title, config);

  const qFull = singleLineQuotaText(quota, config, "full");
  const qShort = singleLineQuotaText(quota, config, "short");
  const qCountdown = singleLineQuotaText(quota, config, "none");
  const qCompact = singleLineQuotaText(quota, config, "pct-only");

  const levels = [
    [coloredBadge, ctx, tokens, bar, qFull, branchText, titleText, stateText, costText],
    [coloredBadge, ctx, tokens, bar, qFull, titleText, stateText, costText],
    [coloredBadge, ctx, tokens, bar, qFull, stateText, costText],
    [coloredBadge, ctx, bar, qFull, stateText],
    [coloredBadge, ctx, qFull, stateText],
    [coloredBadge, ctxSimple, qShort, stateText],
    [coloredBadge, ctxSimple, qCountdown, stateText],
    [coloredBadge, ctxSimple, qCompact, stateText],
    [coloredBadge, ctxSimple, stateText],
    [ctxSimple, qCompact, stateText],
    [ctxSimple, stateText],
    [`${formatInt(ctxPct)}%`, stateLabel]
  ];
  for (const parts of levels) {
    const line = join(...parts);
    if (visibleLen(line) <= width) {
      return line;
    }
  }
  return fit(`${formatInt(ctxPct)}% ${stateLabel}`, width);
}

function singleLineQuotaText(
  quota: NormalizedQuota,
  config: Config,
  mode: "full" | "short" | "none" | "pct-only"
): string {
  if (!quota.hasQuota || quota.buckets.length === 0) {
    return colorize(mode === "pct-only" ? "Q N/A" : "Quota N/A", colorMuted, config.color);
  }
  if (quota.groups.length === 1 && quota.buckets.length === 1) {
    const b = quota.buckets[0];
    if (mode === "pct-only") return `Quota: ${b.label}: ${quotaAmountText(b, config)}`;
    return formatSingleBucket(b, config, { dateMode: mode, prefix: "Quota: " });
  }
  if (mode === "pct-only") {
    return `Quota ${quota.groups
      .map(
        g =>
          `${g.groupLabel}: ${g.windows
            .map(w => `${w.windowLabel ? `${w.windowLabel}: ` : ""}${quotaCompactPct(w, config)}`)
            .join(" / ")}`
      )
      .join(" | ")}`;
  }
  return `Quota ${quota.groups
    .map(g => {
      const windows = g.windows
        .map(w =>
          formatGroupWindow(w, config, {
            includeLeftWord: true,
            dateMode: mode,
            pastDueShort: true
          })
        )
        .join(" / ");
      return `${g.groupLabel}: ${windows}`;
    })
    .join(" | ")}`;
}

function formatSingleBucket(
  bucket: NormalizedQuotaBucket,
  config: Config,
  opts: { dateMode: "full" | "short" | "none"; prefix: string }
): string {
  const amount = quotaAmountText(bucket, config);
  const reset = formatBucketResetPart(bucket, opts.dateMode);
  return `${opts.prefix}${bucket.label}: ${amount}${reset ? ` (${reset})` : ""}`;
}

function formatBucketResetPart(
  bucket: NormalizedQuotaBucket,
  dateMode: "full" | "short" | "none"
): string {
  if (bucket.resetPastDue) {
    return dateMode === "short" ? "Reset due" : bucket.absoluteText;
  }
  if (bucket.resetAt === null) {
    return "";
  }
  if (dateMode === "full") {
    return `${bucket.countdownText}, ${bucket.absoluteText}`;
  }
  if (dateMode === "short") {
    return `${bucket.countdownText}, ${bucket.shortAbsoluteText}`;
  }
  return bucket.countdownText;
}

function quotaAmountText(bucket: NormalizedQuotaBucket, config: Config): string {
  if (config.usageValue === "percent") {
    return `${formatInt(bucket.usedPct)}% used`;
  }
  return `${formatInt(bucket.remainingPct)}% left`;
}

function quotaCompactPct(bucket: NormalizedQuotaBucket, config: Config): string {
  if (config.usageValue === "percent") {
    return `${formatInt(bucket.usedPct)}% used`;
  }
  return `${formatInt(bucket.remainingPct)}%`;
}

function renderModelSegment(shortModel: string, rawPlan: string, config: Config): string {
  const trimmed = rawPlan.trim();
  const knownTier = trimmed.match(/^(?:Google AI\s+)?(Pro|Ultra|Free)$/i);
  const plan = knownTier ? title(knownTier[1]) : "Plan ?";
  if (config.showModel && shortModel !== "") {
    return `${withIcon(config, " ", "")}${shortModel} | ${renderPlan(plan, config)}`;
  }
  if (plan === "Pro") {
    return `${withIcon(config, " ", "")}${renderPlan(plan, config)} Tier`;
  }
  return `${withIcon(config, " ", "")}${plan}`;
}

const modeLabels = new Map<string, [string, string]>([
  ["plan", ["Plan", colorCyan]],
  ["accept-edits", ["Accept Edits", colorYellow]],
  ["auto", ["Auto", colorOrange]]
]);

function renderMode(raw: unknown, config: Config): string {
  if (!config.showMode || typeof raw !== "string") return "";
  const mode = raw.toLowerCase();
  if (mode === "" || mode === "default") return "";
  const known = modeLabels.get(mode);
  if (known) return ` | ${colorize(known[0], known[1], config.color)}`;
  if (!/^[a-z][a-z0-9-]{0,23}$/.test(mode)) return "";
  const label = mode.split("-").filter(Boolean).map(title).join(" ");
  return ` | ${colorize(label, colorYellow, config.color)}`;
}

function renderPlan(plan: string, config: Config): string {
  if (plan === "Pro") {
    return `${withIcon(config, " ", "")}Pro`;
  }
  return plan;
}

function renderGitSegment(branch: string, config: Config): string {
  return `${withIcon(config, " ", "")}${branch}`;
}

function withIcon(config: Config, icon: string, fallback: string): string {
  return config.showIcons ? icon : fallback;
}

function contextValue(config: Config, ctx: Payload["context_window"], pct: number): string {
  const tokens = tokenDetail(ctx);
  switch (config.contextValue) {
    case "tokens":
      if (tokens !== "") {
        return tokens.replace(/^\(/, "").replace(/\)$/, "");
      }
      break;
    case "both":
      if (tokens !== "") {
        return `${formatInt(pct)}% ${tokens}`;
      }
      break;
  }
  return `${formatInt(pct)}%`;
}

function contextPercent(ctx: Payload["context_window"]): number {
  const inputTokens = ctx?.total_input_tokens ?? 0;
  const windowSize = ctx?.context_window_size ?? 0;
  if (Number.isFinite(inputTokens) && Number.isFinite(windowSize) && inputTokens > 0 && windowSize > 0) {
    return clampInt(Math.trunc((inputTokens / windowSize) * 100 + 0.5));
  }

  const upstream = ctx?.used_percentage ?? 0;
  if (!Number.isFinite(upstream)) {
    return 0;
  }
  return clampInt(Math.trunc(upstream + 0.5));
}

function tokenDetail(ctx: Payload["context_window"]): string {
  const total = ctx?.total_input_tokens;
  const windowSize = ctx?.context_window_size ?? 0;
  if (typeof total !== "number" || !Number.isFinite(total) || total <= 0 || !Number.isFinite(windowSize) || windowSize <= 0) {
    return "";
  }
  return `(${formatTokens(total)}/${formatTokens(windowSize)})`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) {
    if (n % 1_000_000 === 0) {
      return `${formatInt(n / 1_000_000)}M`;
    }
    return `${Number((n / 1_000_000).toFixed(1))}M`;
  }
  if (n >= 1000) {
    return `${formatInt((n + 500) / 1000)}k`;
  }
  return formatInt(n);
}

function progressBar(pct: number, width: number, color: boolean): string {
  return progressBarWithColor(pct, pct, width, color);
}

function progressBarWithColor(fillPct: number, colorPct: number, width: number, color: boolean): string {
  fillPct = clampInt(fillPct);
  colorPct = clampInt(colorPct);
  let filled = Math.trunc((fillPct / 100) * width + 0.5);
  if (filled < 0) filled = 0;
  if (filled > width) filled = width;
  const bar = `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
  if (!color) {
    return bar;
  }
  return colorize(bar, percentageColor(colorPct), true);
}

function percentageColor(pct: number): string {
  if (pct >= 90) return colorRed;
  if (pct >= 75) return colorOrange;
  if (pct >= 50) return colorYellow;
  return colorGreen;
}

function state(raw: string): string {
  switch (raw.toLowerCase()) {
    case "":
    case "idle":
      return "Idle";
    case "thinking":
      return "Thinking";
    case "authenticating":
      return "Auth";
    default:
      return title(raw);
  }
}

function stateColor(label: string): string {
  switch (label) {
    case "Idle":
      return colorGreen;
    case "Thinking":
      return colorYellow;
    case "Auth":
      return colorCyan;
    default:
      return colorCyan;
  }
}

function colorize(input: string, colorCode: string, enabled: boolean): string {
  if (!enabled || input === "") {
    return input;
  }
  return `${colorCode}${input}${colorReset}`;
}

function join(...parts: string[]): string {
  return parts.filter(part => part !== "").join("  ");
}

function joinHeader(...parts: string[]): string {
  return parts.filter(part => part !== "").join(" │ ");
}

function fit(input: string, width: number): string {
  if (width <= 0 || visibleLen(input) <= width) {
    return input;
  }
  return truncateColumns(input, width);
}

function padRightColumns(input: string, targetCols: number): string {
  const len = visibleLen(input);
  if (len >= targetCols) return input;
  return `${input}${" ".repeat(targetCols - len)}`;
}

function clampInt(n: number): number {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function formatInt(n: number): string {
  return Math.trunc(n).toString(10);
}

function title(raw: string): string {
  const fields = raw.trim().split(/\s+/).filter(Boolean);
  for (let i = 0; i < fields.length; i++) {
    const runes = Array.from(fields[i].toLowerCase());
    if (runes.length > 0 && runes[0] >= "a" && runes[0] <= "z") {
      runes[0] = runes[0].toUpperCase();
    }
    fields[i] = runes.join("");
  }
  if (fields.length === 0) {
    return "Active";
  }
  return fields.join(" ");
}
