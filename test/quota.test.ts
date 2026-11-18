import test from "node:test";
import assert from "node:assert/strict";
import {
  formatAbsoluteResetTime,
  formatResetCountdown,
  normalizeQuota,
  parseTimezoneAwareTimestamp
} from "../src/quota";

test("parseTimezoneAwareTimestamp accepts explicit offsets and Z, rejects ambiguous local timestamps", () => {
  assert.equal(parseTimezoneAwareTimestamp("2026-11-20T18:00:00Z")?.toISOString(), "2026-11-20T18:00:00.000Z");
  assert.equal(parseTimezoneAwareTimestamp("2026-11-20T18:00:00+08:00")?.toISOString(), "2026-11-20T10:00:00.000Z");
  assert.equal(parseTimezoneAwareTimestamp("2026-11-20T18:00:00-0500")?.toISOString(), "2026-11-20T23:00:00.000Z");
  assert.equal(parseTimezoneAwareTimestamp("2026-11-20T18:00:00.123456789Z")?.toISOString(), "2026-11-20T18:00:00.123Z");

  // Reject ambiguous local timestamps without timezone, date-only, invalid calendar dates, non-strings
  for (const bad of [
    "",
    "2026-11-20T18:00:00",
    "2026-11-20 18:00:00",
    "2026-11-20",
    "Nov 20, 2026 18:00",
    "2026-02-30T12:00:00Z",
    "2026-04-31T00:00:00Z",
    "2026-11-20T25:00:00Z",
    null,
    123
  ]) {
    assert.equal(parseTimezoneAwareTimestamp(bad), null, `expected null for ${String(bad)}`);
  }
});

test("formatResetCountdown handles minute boundaries, rounding up, leading zeros, and past/zero", () => {
  assert.equal(formatResetCountdown(-5000), "");
  assert.equal(formatResetCountdown(0), "");
  assert.equal(formatResetCountdown(1), "<1m");
  assert.equal(formatResetCountdown(59_999), "<1m");
  assert.equal(formatResetCountdown(60_000), "1m");
  assert.equal(formatResetCountdown(60_001), "2m");
  assert.equal(formatResetCountdown(35 * 60_000), "35m");
  assert.equal(formatResetCountdown((7 * 60 + 3) * 60_000 + 1000), "7h 04m");
  assert.equal(formatResetCountdown(((2 * 24 + 7) * 60 + 35) * 60_000), "2d 7h 35m");
});

test("formatAbsoluteResetTime formats across en-US, en-GB, zh-HK, DST, and rollovers", () => {
  // Standard UTC -> local day rollover across NY, London, Hong Kong
  const utc = new Date("2026-11-20T18:00:00Z");
  const us = formatAbsoluteResetTime(utc, { locale: "en-US", timeZone: "America/New_York" });
  const gb = formatAbsoluteResetTime(utc, { locale: "en-GB", timeZone: "Europe/London" });
  const hk = formatAbsoluteResetTime(utc, { locale: "zh-HK", timeZone: "Asia/Hong_Kong" });

  assert.match(us, /^20-Nov-2026 1:00 PM$/);
  assert.match(gb, /^20-Nov-2026 18:00$/);
  assert.match(hk, /^21-11-2026 .*2:00$/);

  const usCompact = formatAbsoluteResetTime(utc, { locale: "en-US", timeZone: "America/New_York", compact: true });
  assert.match(usCompact, /^20-Nov 1:00 PM$/);

  // Year/month/day rollover: 2026-12-31T23:30:00Z -> 2027-01-01 in HK, 2026-12-31 in NY
  const nye = new Date("2026-12-31T23:30:00Z");
  assert.match(formatAbsoluteResetTime(nye, { locale: "zh-HK", timeZone: "Asia/Hong_Kong" }), /^01-1-2027 /);
  assert.match(formatAbsoluteResetTime(nye, { locale: "en-US", timeZone: "America/New_York" }), /^31-Dec-2026 /);

  // DST transition in America/New_York (2026-03-08 02:00 EST -> 03:00 EDT)
  const beforeDst = new Date("2026-03-08T06:30:00Z"); // 01:30 AM EST
  const afterDst = new Date("2026-03-08T07:30:00Z");  // 03:30 AM EDT
  assert.match(formatAbsoluteResetTime(beforeDst, { locale: "en-US", timeZone: "America/New_York" }), /^08-Mar-2026 1:30 AM$/);
  assert.match(formatAbsoluteResetTime(afterDst, { locale: "en-US", timeZone: "America/New_York" }), /^08-Mar-2026 3:30 AM$/);

  // DST transition in Europe/London (BST UTC+1 in summer vs GMT UTC+0 in winter)
  const summerLondon = new Date("2026-07-15T12:00:00Z");
  const winterLondon = new Date("2026-01-15T12:00:00Z");
  assert.match(formatAbsoluteResetTime(summerLondon, { locale: "en-GB", timeZone: "Europe/London" }), /^15-Jul-2026 13:00$/);
  assert.match(formatAbsoluteResetTime(winterLondon, { locale: "en-GB", timeZone: "Europe/London" }), /^15-Jan-2026 12:00$/);

  // Estimated marking
  const est = formatAbsoluteResetTime(utc, { locale: "en-GB", timeZone: "Europe/London", estimated: true });
  assert.ok(est.startsWith("~20-Nov-2026 18:00"));
  assert.match(est, /\(estimated\)$/);
});

test("formatAbsoluteResetTime detects runtime TZ changes when no override is set", () => {
  const prevTz = process.env.TZ;
  try {
    const d = new Date("2026-11-20T18:00:00Z");
    process.env.TZ = "America/New_York";
    const ny = formatAbsoluteResetTime(d, { locale: "en-US" });
    process.env.TZ = "Asia/Hong_Kong";
    const hk = formatAbsoluteResetTime(d, { locale: "en-US" });
    assert.notEqual(ny, hk);
    assert.match(ny, /^20-Nov-2026 /);
    assert.match(hk, /^21-Nov-2026 /);
  } finally {
    if (prevTz === undefined) delete process.env.TZ;
    else process.env.TZ = prevTz;
  }
});

test("normalizeQuota computes exact remaining percentage without inversion and validates bounds", () => {
  const now = new Date("2026-11-18T12:00:00Z");
  const q = normalizeQuota(
    {
      "gemini-5h": {
        remaining_fraction: 0.72,
        reset_time: "2026-11-20T19:35:00Z",
        reset_in_seconds: 200100
      }
    },
    "Gemini 3.5 Flash",
    now,
    { locale: "en-GB", timeZone: "Europe/London" }
  );
  assert.equal(q.hasQuota, true);
  assert.equal(q.buckets.length, 1);
  assert.equal(q.buckets[0].label, "Gemini 5h");
  assert.equal(q.buckets[0].remainingPct, 72);
  assert.equal(q.buckets[0].usedPct, 28);
  assert.equal(q.buckets[0].resetEstimated, false);
  assert.equal(q.buckets[0].countdownText, "2d 7h 35m");

  // Out-of-range or malformed remaining_fraction is rejected
  for (const badFrac of [-0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY, "0.5", null]) {
    const invalid = normalizeQuota({ "gemini-5h": { remaining_fraction: badFrac } }, "Gemini", now);
    assert.equal(invalid.hasQuota, false);
  }
});

test("normalizeQuota groups buckets by model family and orders groups and windows consistently", () => {
  const now = new Date("2026-11-18T12:00:00Z");
  const raw = {
    "custom-bucket": { remaining_fraction: 0.4, reset_time: "2026-11-19T12:00:00Z" },
    "3p-weekly": { remaining_fraction: 0.85, reset_time: "2026-11-25T12:00:00Z" },
    "gemini-argon-wtu-weekly": { remaining_fraction: 0.9, reset_time: "2026-11-24T12:00:00Z" },
    "gemini-weekly": { remaining_fraction: 0.7, reset_time: "2026-11-23T12:00:00Z" },
    "3p-5h": { remaining_fraction: 0.95, reset_time: "2026-11-18T15:00:00Z" },
    "gemini-5h": { remaining_fraction: 0.6, reset_time: "2026-11-18T16:00:00Z" },
    "other-weekly": { remaining_fraction: 0.5, reset_time: "2026-11-22T12:00:00Z" },
    "other-5h": { remaining_fraction: 0.8, reset_time: "2026-11-18T14:00:00Z" }
  };
  for (const model of ["Gemini 3.5 Flash", "Claude Sonnet 4.6", "Gemini 4 Argon (Medium)"]) {
    const q = normalizeQuota(raw, model, now, { locale: "en-GB", timeZone: "UTC" });
    assert.deepEqual(
      q.groups.map(g => [g.groupId, g.groupLabel, g.windows.map(w => w.windowLabel)]),
      [
        ["gemini", "Gemini", ["5h", "Weekly"]],
        ["argon", "Argon", ["Weekly"]],
        ["3p", "Claude/GPT", ["5h", "Weekly"]],
        ["custom:custom-bucket", "custom-bucket", [""]],
        ["custom:other", "other", ["5h", "Weekly"]]
      ]
    );
    assert.deepEqual(
      q.buckets.map(b => [b.id, b.label]),
      [
        ["gemini-5h", "Gemini 5h"],
        ["gemini-weekly", "Gemini Weekly"],
        ["gemini-argon-wtu-weekly", "Argon Weekly"],
        ["3p-5h", "Claude/GPT 5h"],
        ["3p-weekly", "Claude/GPT Weekly"],
        ["custom-bucket", "custom-bucket"],
        ["other-5h", "other 5h"],
        ["other-weekly", "other Weekly"]
      ]
    );
  }
});

test("normalizeQuota prefers absolute reset_time, falls back to reset_in_seconds as estimated, and marks past-due", () => {
  const now = new Date("2026-11-18T12:00:00Z");

  // Skewed relative seconds ignored in favor of absolute reset_time, flag raised
  const skewed = normalizeQuota(
    {
      "example-bucket": {
        remaining_fraction: 0.65,
        reset_time: "2026-11-18T14:00:00Z",
        reset_in_seconds: 100
      }
    },
    "Gemini",
    now,
    { locale: "en-GB", timeZone: "UTC" }
  );
  assert.equal(skewed.buckets[0].resetEstimated, false);
  assert.equal(skewed.buckets[0].clockSkewDetected, true);
  assert.equal(skewed.buckets[0].countdownText, "2h 00m");

  // Missing/ambiguous reset_time uses reset_in_seconds and marks estimated
  const est = normalizeQuota(
    {
      "example-bucket": {
        remaining_fraction: 0.5,
        reset_time: "2026-11-18T14:00:00", // ambiguous local timestamp -> rejected
        reset_in_seconds: 3600
      }
    },
    "Gemini",
    now,
    { locale: "en-GB", timeZone: "UTC" }
  );
  assert.equal(est.buckets[0].resetEstimated, true);
  assert.equal(est.buckets[0].countdownText, "1h 00m");
  assert.ok(est.buckets[0].absoluteText.startsWith("~"));
  assert.match(est.buckets[0].absoluteText, /\(estimated\)$/);

  // Negative reset_in_seconds ignored
  const neg = normalizeQuota(
    { "example-bucket": { remaining_fraction: 0.5, reset_in_seconds: -30 } },
    "Gemini",
    now
  );
  assert.equal(neg.buckets[0].resetAt, null);

  // Past-due reset_time displays Reset due / awaiting update
  const past = normalizeQuota(
    { "example-bucket": { remaining_fraction: 0.1, reset_time: "2026-11-18T11:00:00Z" } },
    "Gemini",
    now
  );
  assert.equal(past.buckets[0].resetPastDue, true);
  assert.equal(past.buckets[0].absoluteText, "Reset due / awaiting update");
});
