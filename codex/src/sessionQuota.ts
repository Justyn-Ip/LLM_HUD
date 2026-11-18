import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CodexRateLimitWindow, CodexRateLimitsResponse, normalizeCodexQuota } from "./quota";

const maxDays = 7;
const maxRollouts = 12;
const maxTailBytes = 1024 * 1024;

interface RecordedQuota {
  recordedAtMs: number;
  response: CodexRateLimitsResponse;
}

function list(directory: string): fs.Dirent[] {
  try {
    return fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return [];
  }
}

function datedDirectories(directory: string, pattern: RegExp): string[] {
  return list(directory)
    .filter(entry => entry.isDirectory() && pattern.test(entry.name))
    .map(entry => path.join(directory, entry.name))
    .sort()
    .reverse();
}

function* rolloutDays(sessions: string): Generator<string> {
  for (const year of datedDirectories(sessions, /^\d{4}$/)) {
    for (const month of datedDirectories(year, /^\d{2}$/)) {
      yield* datedDirectories(month, /^\d{2}$/);
    }
  }
}

function readTail(file: string): string {
  const fd = fs.openSync(file, "r");
  try {
    const size = fs.fstatSync(fd).size;
    const start = Math.max(0, size - maxTailBytes);
    const buffer = Buffer.alloc(size - start);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, start);
    const text = buffer.toString("utf8", 0, bytesRead);
    if (start === 0) return text;
    const firstNewline = text.indexOf("\n");
    return firstNewline < 0 ? "" : text.slice(firstNewline + 1);
  } finally {
    fs.closeSync(fd);
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
}

function toWindow(value: unknown): CodexRateLimitWindow | null {
  const window = asRecord(value);
  return window ? {
    usedPercent: window.used_percent,
    resetsAt: window.resets_at,
    windowDurationMins: window.window_minutes
  } : null;
}

function readRecord(line: string): RecordedQuota | null {
  if (!line.includes('"token_count"') || !line.includes('"rate_limits"')) return null;
  try {
    const event = asRecord(JSON.parse(line));
    if (event?.type !== "event_msg" || typeof event.timestamp !== "string") return null;
    const payload = asRecord(event.payload);
    if (payload?.type !== "token_count") return null;
    const limits = asRecord(payload.rate_limits);
    if (!limits || (limits.limit_id != null && limits.limit_id !== "codex")) return null;

    const recordedAtMs = Date.parse(event.timestamp);
    if (!Number.isFinite(recordedAtMs)) return null;
    const response = {
      rateLimits: { primary: toWindow(limits.primary), secondary: toWindow(limits.secondary) }
    };
    return normalizeCodexQuota(response).length > 0 ? { recordedAtMs, response } : null;
  } catch {
    // A session can still be writing the final JSON line.
    return null;
  }
}

export function readRecordedCodexQuota(): RecordedQuota | null {
  const sessions = path.join(process.env.CODEX_HOME || path.join(os.homedir(), ".codex"), "sessions");
  const rollouts: { file: string; modifiedAtMs: number }[] = [];
  let days = 0;
  for (const day of rolloutDays(sessions)) {
    if (days++ >= maxDays) break;
    for (const entry of list(day)) {
      if (!entry.isFile() || !/^rollout-.*\.jsonl$/.test(entry.name)) continue;
      const file = path.join(day, entry.name);
      try {
        rollouts.push({ file, modifiedAtMs: fs.statSync(file).mtimeMs });
      } catch {
        // The session may have been moved or removed.
      }
    }
  }
  rollouts.sort((a, b) => b.modifiedAtMs - a.modifiedAtMs);

  let latest: RecordedQuota | null = null;
  for (const { file } of rollouts.slice(0, maxRollouts)) {
    let tail: string;
    try {
      tail = readTail(file);
    } catch {
      continue;
    }
    for (const line of tail.split("\n")) {
      const record = readRecord(line);
      if (record && (!latest || record.recordedAtMs >= latest.recordedAtMs)) latest = record;
    }
  }
  return latest;
}
