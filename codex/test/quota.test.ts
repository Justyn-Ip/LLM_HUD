import test from "node:test";
import assert from "node:assert/strict";
import { formatCodexQuota, formatCodexQuotaSnapshot } from "../src/quota";

const now = new Date("2026-11-18T10:25:00Z");
const response = {
  rateLimits: {
    primary: { usedPercent: 28, resetsAt: Date.parse("2026-11-18T12:00:00Z") / 1000, windowDurationMins: 300 },
    secondary: { usedPercent: 9, resetsAt: Date.parse("2026-11-22T22:35:00Z") / 1000, windowDurationMins: 10080 }
  }
};

test("Codex quota shows remaining percent, countdown, and local absolute reset time", () => {
  assert.equal(
    formatCodexQuota(response, now, { locale: "en-GB", timeZone: "UTC" }),
    [
      "Codex quota",
      "5h: 72% left · resets in 1h 35m · 18-Nov-2026 12:00",
      "Weekly: 91% left · resets in 4d 12h 10m · 22-Nov-2026 22:35"
    ].join("\n")
  );
});

test("Codex quota uses the Codex limit bucket and never invents an absent window", () => {
  const result = formatCodexQuota({
    rateLimits: { primary: { usedPercent: 99, resetsAt: null } },
    rateLimitsByLimitId: {
      codex: { primary: { usedPercent: 12, resetsAt: null, windowDurationMins: 300 } },
      other: { primary: { usedPercent: 0, resetsAt: null, windowDurationMins: 300 } }
    }
  }, now, { locale: "en-GB", timeZone: "UTC" });
  assert.equal(result, "Codex quota\n5h: 88% left · reset time unavailable");
});

test("Codex quota rejects invalid percentages and reports past resets without claiming recovery", () => {
  const result = formatCodexQuota({
    rateLimits: {
      primary: { usedPercent: 101, resetsAt: 0, windowDurationMins: 300 },
      secondary: { usedPercent: 40, resetsAt: Date.parse("2026-11-18T09:00:00Z") / 1000, windowDurationMins: 10080 }
    }
  }, now, { locale: "en-GB", timeZone: "UTC" });
  assert.equal(result, "Codex quota\nWeekly: 60% left · reset due / awaiting updated usage");
});

test("Codex quota reports unavailable when the account API has no rate-limit data", () => {
  assert.equal(formatCodexQuota({ rateLimits: null }, now), "Codex quota unavailable. Check Codex login.");
});

test("Codex quota snapshot includes structured fields alongside combined text", () => {
  const snapshot = formatCodexQuotaSnapshot({
    rateLimits: {
      primary: { usedPercent: 21, resetsAt: Date.parse("2026-11-18T13:30:00Z") / 1000, windowDurationMins: 300 },
      secondary: { usedPercent: 88, resetsAt: Date.parse("2026-11-18T09:00:00Z") / 1000, windowDurationMins: 10080 }
    }
  }, now, { locale: "en-US", timeZone: "UTC" });

  assert.deepEqual(snapshot.windows, [
    {
      text: "5h: 79% left · resets in 3h 05m · 18-Nov-2026 1:30 PM",
      label: "5h",
      remainingPercent: 79,
      resetCountdown: "3h 05m",
      resetAbsolute: "18-Nov-2026 1:30 PM",
      resetText: "resets in 3h 05m · 18-Nov-2026 1:30 PM"
    },
    {
      text: "Weekly: 12% left · reset due / awaiting updated usage",
      label: "Weekly",
      remainingPercent: 12,
      resetCountdown: "",
      resetAbsolute: "",
      resetText: "reset due / awaiting updated usage"
    }
  ]);
});
