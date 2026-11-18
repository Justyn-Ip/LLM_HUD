import { formatAbsoluteResetTime, formatResetCountdown } from "../../src/quota";

export interface CodexRateLimitWindow {
  usedPercent?: unknown;
  resetsAt?: unknown;
  windowDurationMins?: unknown;
}

export interface CodexRateLimitSnapshot {
  primary?: CodexRateLimitWindow | null;
  secondary?: CodexRateLimitWindow | null;
}

export interface CodexRateLimitsResponse {
  rateLimits?: CodexRateLimitSnapshot | null;
  rateLimitsByLimitId?: Record<string, CodexRateLimitSnapshot> | null;
}

export interface CodexQuotaFormatOptions {
  locale?: string;
  timeZone?: string;
}

export interface CodexQuotaWindowSnapshot {
  text: string;
  label: string;
  remainingPercent: number;
  resetCountdown: string;
  resetAbsolute: string;
  resetText: string;
}

export const codexQuotaUnavailableMessage = "Codex quota unavailable. Check Codex login.";

interface DisplayWindow {
  label: string;
  remainingPercent: number;
  resetAt: Date | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function durationLabel(value: unknown, fallback: string): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return fallback;
  if (value === 300) return "5h";
  if (value === 10080) return "Weekly";
  if (value % 1440 === 0) return `${value / 1440}d`;
  if (value % 60 === 0) return `${value / 60}h`;
  return `${value}m`;
}

function normalizeWindow(value: unknown, fallbackLabel: string): DisplayWindow | null {
  if (!isRecord(value)) return null;
  const usedPercent = value.usedPercent;
  if (typeof usedPercent !== "number" || !Number.isFinite(usedPercent) || usedPercent < 0 || usedPercent > 100) {
    return null;
  }

  const resetsAt = value.resetsAt;
  let resetAt: Date | null = null;
  if (typeof resetsAt === "number" && Number.isFinite(resetsAt) && resetsAt > 0) {
    const date = new Date(resetsAt * 1000);
    if (!Number.isNaN(date.getTime())) resetAt = date;
  }

  return {
    label: durationLabel(value.windowDurationMins, fallbackLabel),
    remainingPercent: Math.round(100 - usedPercent),
    resetAt
  };
}

export function normalizeCodexQuota(response: unknown): DisplayWindow[] {
  if (!isRecord(response)) return [];

  let snapshot: unknown;
  const byLimitId = response.rateLimitsByLimitId;
  if (isRecord(byLimitId)) {
    for (const key of Object.keys(byLimitId)) {
      if (key.toLowerCase() === "codex") {
        snapshot = byLimitId[key];
        break;
      }
    }
  }
  if (snapshot === undefined) snapshot = response.rateLimits;
  if (!isRecord(snapshot)) return [];

  const windows: DisplayWindow[] = [];
  const primary = normalizeWindow(snapshot.primary, "5h");
  const secondary = normalizeWindow(snapshot.secondary, "Weekly");
  if (primary) windows.push(primary);
  if (secondary) windows.push(secondary);
  return windows;
}

export function formatCodexQuotaSnapshot(
  response: unknown,
  now: Date = new Date(),
  options: CodexQuotaFormatOptions = {}
): { text: string; windows: CodexQuotaWindowSnapshot[] } {
  const windows = normalizeCodexQuota(response).map(window => {
    let resetCountdown = "";
    let resetAbsolute = "";
    let resetText = "reset time unavailable";
    if (window.resetAt) {
      const diffMs = window.resetAt.getTime() - now.getTime();
      if (diffMs <= 0) {
        resetText = "reset due / awaiting updated usage";
      } else {
        resetCountdown = formatResetCountdown(diffMs);
        resetAbsolute = formatAbsoluteResetTime(window.resetAt, {
          locale: options.locale,
          timeZone: options.timeZone
        });
        resetText = `resets in ${resetCountdown} · ${resetAbsolute}`;
      }
    }
    return {
      text: `${window.label}: ${window.remainingPercent}% left · ${resetText}`,
      label: window.label,
      remainingPercent: window.remainingPercent,
      resetCountdown,
      resetAbsolute,
      resetText
    };
  });
  const text = windows.length > 0
    ? ["Codex quota", ...windows.map(window => window.text)].join("\n")
    : codexQuotaUnavailableMessage;
  return { text, windows };
}

export function formatCodexQuota(
  response: unknown,
  now: Date = new Date(),
  options: CodexQuotaFormatOptions = {}
): string {
  return formatCodexQuotaSnapshot(response, now, options).text;
}
