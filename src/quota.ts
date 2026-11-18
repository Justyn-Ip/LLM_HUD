import { sanitizePlainText } from "./ansi";

export interface OfficialQuotaBucket {
  remaining_fraction?: unknown;
  reset_time?: unknown;
  reset_in_seconds?: unknown;
}

export interface NormalizedQuotaBucket {
  id: string;
  label: string;
  groupId: string;
  groupLabel: string;
  windowLabel: string;
  remainingPct: number;
  usedPct: number;
  resetAt: Date | null;
  resetEstimated: boolean;
  resetPastDue: boolean;
  countdownText: string;
  absoluteText: string;
  shortAbsoluteText: string;
  clockSkewDetected: boolean;
}

export interface NormalizedQuotaGroup {
  groupId: string;
  groupLabel: string;
  windows: NormalizedQuotaBucket[];
}

export interface NormalizedQuota {
  hasQuota: boolean;
  buckets: NormalizedQuotaBucket[];
  groups: NormalizedQuotaGroup[];
}

export interface TimeFormatOptions {
  locale?: string;
  timeZone?: string;
  compact?: boolean;
  estimated?: boolean;
}

export const maxBucketIdColumns = 32;
export const clockSkewToleranceSeconds = 120;

const isoTzPattern =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)$/i;

interface BucketMeta {
  groupId: string;
  groupLabel: string;
  windowLabel: string;
  label: string;
}

const knownBucketMeta = new Map<string, BucketMeta>([
  ["gemini-5h", { groupId: "gemini", groupLabel: "Gemini", windowLabel: "5h", label: "Gemini 5h" }],
  ["gemini-weekly", { groupId: "gemini", groupLabel: "Gemini", windowLabel: "Weekly", label: "Gemini Weekly" }],
  ["gemini-argon-wtu-5h", { groupId: "argon", groupLabel: "Argon", windowLabel: "5h", label: "Argon 5h" }],
  ["argon-5h", { groupId: "argon", groupLabel: "Argon", windowLabel: "5h", label: "Argon 5h" }],
  ["gemini-argon-wtu-weekly", { groupId: "argon", groupLabel: "Argon", windowLabel: "Weekly", label: "Argon Weekly" }],
  ["3p-5h", { groupId: "3p", groupLabel: "Claude/GPT", windowLabel: "5h", label: "Claude/GPT 5h" }],
  ["3p-weekly", { groupId: "3p", groupLabel: "Claude/GPT", windowLabel: "Weekly", label: "Claude/GPT Weekly" }]
]);

const knownGroupOrder = ["gemini", "argon", "3p"];

function resolveBucketMeta(key: string): BucketMeta | null {
  const safeId = sanitizePlainText(key, maxBucketIdColumns);
  if (safeId === "" || safeId === "__proto__" || safeId === "constructor" || safeId === "prototype") {
    return null;
  }
  const known = knownBucketMeta.get(key);
  if (known) {
    return known;
  }
  const suffixMatch = safeId.match(/^(.+?)-(5h|weekly)$/i);
  if (suffixMatch) {
    const prefix = sanitizePlainText(suffixMatch[1], maxBucketIdColumns);
    if (prefix !== "") {
      const windowLabel = suffixMatch[2].toLowerCase() === "5h" ? "5h" : "Weekly";
      return {
        groupId: `custom:${prefix.toLowerCase()}`,
        groupLabel: prefix,
        windowLabel,
        label: sanitizePlainText(`${prefix} ${windowLabel}`, maxBucketIdColumns)
      };
    }
  }
  return {
    groupId: `custom:${safeId}`,
    groupLabel: safeId,
    windowLabel: "",
    label: safeId
  };
}

function windowSortRank(windowLabel: string): number {
  if (windowLabel === "5h") return 0;
  if (windowLabel === "Weekly") return 1;
  return 2;
}

/**
 * Parse a timestamp only when an explicit timezone (`Z` or `±HH:MM` / `±HHMM`) is present.
 * Ambiguous local timestamps without a timezone offset are rejected.
 */
export function parseTimezoneAwareTimestamp(raw: unknown): Date | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const match = trimmed.match(isoTzPattern);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] !== undefined ? Number(match[6]) : 0;
  const fracRaw = match[7] ?? "";
  const tzRaw = match[8];

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    return null;
  }

  // Verify calendar validity (e.g., reject Feb 30 or Apr 31).
  const baseUtc = Date.UTC(year, month - 1, day, hour, minute, second, 0);
  const check = new Date(baseUtc);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute ||
    check.getUTCSeconds() !== second
  ) {
    return null;
  }

  let offsetMinutes = 0;
  if (tzRaw.toUpperCase() !== "Z") {
    const sign = tzRaw[0] === "-" ? -1 : 1;
    const digits = tzRaw.slice(1).replace(":", "");
    const tzHours = Number(digits.slice(0, 2));
    const tzMinutes = Number(digits.slice(2, 4));
    offsetMinutes = sign * (tzHours * 60 + tzMinutes);
  }

  const ms = fracRaw === "" ? 0 : Math.trunc(Number(`0.${fracRaw.slice(0, 3)}`) * 1000);
  const epochMs = baseUtc - offsetMinutes * 60_000 + ms;
  return Number.isFinite(epochMs) ? new Date(epochMs) : null;
}

/**
 * Format a positive remaining duration as `Xd Yh ZZm`, `Xh YYm`, `Xm`, or `<1m`.
 * Positive durations >= 1 minute are rounded up to the next whole minute.
 */
export function formatResetCountdown(diffMs: number): string {
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return "";
  }
  if (diffMs < 60_000) {
    return "<1m";
  }
  let totalMinutes = Math.ceil(diffMs / 60_000);
  const days = Math.trunc(totalMinutes / (24 * 60));
  totalMinutes -= days * 24 * 60;
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${pad2(minutes)}m`;
  }
  if (hours > 0) {
    return `${hours}h ${pad2(minutes)}m`;
  }
  return `${minutes}m`;
}

/**
 * Format an absolute reset date/time using the host OS locale and timezone by default.
 * Always creates a fresh Intl.DateTimeFormat so OS locale/timezone changes apply on subsequent runs.
 */
export function formatAbsoluteResetTime(date: Date, opts: TimeFormatOptions = {}): string {
  if (Number.isNaN(date.getTime())) return "";
  const formatOpts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  };
  if (opts.timeZone) {
    formatOpts.timeZone = opts.timeZone;
  }
  const formatter = new Intl.DateTimeFormat(opts.locale || undefined, formatOpts);
  const parts = formatter.formatToParts(date);

  const day = parts.find(p => p.type === "day")?.value ?? "";
  const month = parts.find(p => p.type === "month")?.value ?? "";
  const year = parts.find(p => p.type === "year")?.value ?? "";

  const isTimePart = (type: Intl.DateTimeFormatPartTypes) =>
    type === "hour" || type === "minute" || type === "dayPeriod";
  const firstTimeIdx = parts.findIndex(p => isTimePart(p.type));
  let lastTimeIdx = -1;
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (isTimePart(parts[i].type)) {
      lastTimeIdx = i;
      break;
    }
  }
  const timeStr =
    firstTimeIdx !== -1 && lastTimeIdx >= firstTimeIdx
      ? parts
          .slice(firstTimeIdx, lastTimeIdx + 1)
          .map(p => p.value)
          .join("")
          .trim()
      : "";

  let formatted: string;
  if (day !== "" && month !== "" && year !== "" && timeStr !== "") {
    const dateStr = opts.compact ? `${day}-${month}` : `${day}-${month}-${year}`;
    formatted = `${dateStr} ${timeStr}`;
  } else {
    formatted = formatter.format(date);
  }
  formatted = formatted.replace(/[\u00A0\u202F]/g, " ");

  if (opts.estimated) {
    return opts.compact ? `~${formatted}` : `~${formatted} (estimated)`;
  }
  return formatted;
}

/**
 * Normalize official `payload.quota` buckets using pure validation and calculations.
 * Returns all valid buckets grouped by model family regardless of active model.
 * Never synthesizes quota from token counts or falls back to disk/network sources.
 */
export function normalizeQuota(
  rawQuota: unknown,
  _modelDisplay: string,
  now: Date = new Date(),
  timeOpts: { locale?: string; timeZone?: string } = {}
): NormalizedQuota {
  if (!rawQuota || typeof rawQuota !== "object" || Array.isArray(rawQuota)) {
    return { hasQuota: false, buckets: [], groups: [] };
  }

  const record = rawQuota as Record<string, unknown>;
  const groupMap = new Map<string, NormalizedQuotaGroup>();

  for (const key of Object.keys(record)) {
    const meta = resolveBucketMeta(key);
    if (!meta) continue;
    const safeId = sanitizePlainText(key, maxBucketIdColumns);

    const rawBucket = record[key];
    if (!rawBucket || typeof rawBucket !== "object" || Array.isArray(rawBucket)) {
      continue;
    }
    const bucket = rawBucket as OfficialQuotaBucket;
    const fraction = bucket.remaining_fraction;
    if (typeof fraction !== "number" || !Number.isFinite(fraction) || fraction < 0 || fraction > 1) {
      continue;
    }

    const remainingPct = Math.round(100 * fraction);
    const usedPct = 100 - remainingPct;

    const absReset = parseTimezoneAwareTimestamp(bucket.reset_time);
    const relSeconds =
      typeof bucket.reset_in_seconds === "number" &&
      Number.isFinite(bucket.reset_in_seconds) &&
      bucket.reset_in_seconds >= 0
        ? bucket.reset_in_seconds
        : null;

    let resetAt: Date | null = null;
    let resetEstimated = false;
    let clockSkewDetected = false;

    if (absReset !== null) {
      resetAt = absReset;
      if (relSeconds !== null) {
        const expectedMs = now.getTime() + relSeconds * 1000;
        if (Math.abs(absReset.getTime() - expectedMs) > clockSkewToleranceSeconds * 1000) {
          clockSkewDetected = true;
        }
      }
    } else if (relSeconds !== null) {
      resetAt = new Date(now.getTime() + relSeconds * 1000);
      resetEstimated = true;
    }

    let resetPastDue = false;
    let countdownText = "";
    let absoluteText = "";
    let shortAbsoluteText = "";

    if (resetAt !== null) {
      const diffMs = resetAt.getTime() - now.getTime();
      if (diffMs <= 0) {
        resetPastDue = true;
        absoluteText = "Reset due / awaiting update";
        shortAbsoluteText = "Reset due";
      } else {
        countdownText = formatResetCountdown(diffMs);
        absoluteText = formatAbsoluteResetTime(resetAt, {
          locale: timeOpts.locale,
          timeZone: timeOpts.timeZone,
          compact: false,
          estimated: resetEstimated
        });
        shortAbsoluteText = formatAbsoluteResetTime(resetAt, {
          locale: timeOpts.locale,
          timeZone: timeOpts.timeZone,
          compact: true,
          estimated: resetEstimated
        });
      }
    }

    const normalizedBucket: NormalizedQuotaBucket = {
      id: safeId,
      label: meta.label,
      groupId: meta.groupId,
      groupLabel: meta.groupLabel,
      windowLabel: meta.windowLabel,
      remainingPct,
      usedPct,
      resetAt,
      resetEstimated,
      resetPastDue,
      countdownText,
      absoluteText,
      shortAbsoluteText,
      clockSkewDetected
    };

    let group = groupMap.get(meta.groupId);
    if (!group) {
      group = {
        groupId: meta.groupId,
        groupLabel: meta.groupLabel,
        windows: []
      };
      groupMap.set(meta.groupId, group);
    }
    group.windows.push(normalizedBucket);
  }

  const orderedGroups: NormalizedQuotaGroup[] = [];
  for (const id of knownGroupOrder) {
    const group = groupMap.get(id);
    if (group) {
      group.windows.sort((a, b) => windowSortRank(a.windowLabel) - windowSortRank(b.windowLabel));
      orderedGroups.push(group);
      groupMap.delete(id);
    }
  }
  for (const group of groupMap.values()) {
    group.windows.sort((a, b) => windowSortRank(a.windowLabel) - windowSortRank(b.windowLabel));
    orderedGroups.push(group);
  }

  const buckets = orderedGroups.flatMap(g => g.windows);

  return {
    hasQuota: buckets.length > 0,
    buckets,
    groups: orderedGroups
  };
}

function pad2(n: number): string {
  return n < 10 ? `0${Math.trunc(n)}` : `${Math.trunc(n)}`;
}
