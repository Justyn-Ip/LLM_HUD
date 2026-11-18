import test from "node:test";
import assert from "node:assert/strict";

import {
  bar,
  formatCountdown,
  formatMoney,
  normalizeGoUsage,
  normalizeLimits,
  renderHud,
  selectBudget,
} from "../build/quota.mjs";

const now = Date.parse("2026-11-18T12:00:00.000Z");

const goResponse = {
  usage: {
    rolling: { status: "ok", percent: 40, resetsAt: "2026-11-18T14:14:00.000Z" },
    weekly: { status: "ok", percent: 12, resetsAt: "2026-11-21T16:00:00.000Z" },
    monthly: { status: "ok", percent: 62, resetsAt: "2026-12-06T12:00:00.000Z" },
  },
};

const limitsResponse = {
  workspace: { id: "wrk_test", usageURL: "https://opencode.ai/console/wrk_test" },
  go: {
    rolling: { percent: 40, limited: false, resetsAt: Date.parse("2026-11-18T14:14:00.000Z") },
    weekly: { percent: 12, limited: false, resetsAt: Date.parse("2026-11-21T16:00:00.000Z") },
    monthly: { percent: 62, limited: false, resetsAt: Date.parse("2026-12-06T12:00:00.000Z") },
  },
  budgets: [],
};

const text = parts => parts.map(part => part.text).join("");

test("normalizeGoUsage reads the three Go windows", () => {
  const snapshot = normalizeGoUsage(goResponse, now);
  assert.ok(snapshot);
  assert.equal(snapshot.source, "go");
  assert.deepEqual(
    snapshot.windows.map(window => [window.label, window.percent]),
    [
      ["5h", 40],
      ["Wk", 12],
      ["Mo", 62],
    ],
  );
  assert.equal(snapshot.windows[0].resetsAt, Date.parse("2026-11-18T14:14:00.000Z"));
});

test("normalizeGoUsage marks a rate-limited window as full", () => {
  const snapshot = normalizeGoUsage(
    {
      usage: {
        ...goResponse.usage,
        rolling: { status: "rate-limited", percent: 98, resetsAt: "2026-11-18T14:14:00.000Z" },
      },
    },
    now,
  );
  assert.ok(snapshot);
  assert.equal(snapshot.windows[0].percent, 100);
  assert.equal(snapshot.windows[0].limited, true);
});

test("normalizeGoUsage rejects incomplete or invalid payloads", () => {
  assert.equal(normalizeGoUsage({ usage: { rolling: goResponse.usage.rolling } }, now), null);
  assert.equal(
    normalizeGoUsage(
      {
        usage: {
          ...goResponse.usage,
          weekly: { status: "ok", percent: 101, resetsAt: "2026-11-21T16:00:00.000Z" },
        },
      },
      now,
    ),
    null,
  );
  assert.equal(
    normalizeGoUsage(
      {
        usage: {
          ...goResponse.usage,
          monthly: { status: "ok", percent: 1, resetsAt: "not-a-date" },
        },
      },
      now,
    ),
    null,
  );
});

test("normalizeLimits reads Go meters and Console budgets", () => {
  const go = normalizeLimits(limitsResponse, now);
  assert.ok(go);
  assert.equal(go.source, "go");
  assert.deepEqual(
    go.windows.map(window => window.percent),
    [40, 12, 62],
  );

  const budget = normalizeLimits(
    {
      workspace: limitsResponse.workspace,
      budgets: [
        {
          id: "budget_1",
          limit: 60,
          spent: 12.4,
          scope: "each",
          per: "set",
          coverage: "all",
          models: [],
          vendors: [],
          picked: true,
          shared: false,
          resetsAt: Date.parse("2026-12-06T12:00:00.000Z"),
        },
      ],
    },
    now,
  );
  assert.ok(budget);
  assert.equal(budget.source, "budget");
  assert.equal(budget.budget.percent, 21);
  assert.equal(budget.budget.spent, 12.4);
  assert.equal(budget.budget.limit, 60);
});

test("selectBudget prefers the picked budget", () => {
  const budgets = [
    { limit: 10, spent: 1, resetsAt: now, picked: false, coverage: "all" },
    { limit: 60, spent: 12, resetsAt: now, picked: true, coverage: "models" },
  ];
  const selected = selectBudget(budgets, now);
  assert.equal(selected.limit, 60);
});

test("formatCountdown stays compact and never rounds down", () => {
  assert.equal(formatCountdown(90_000), "2m");
  assert.equal(formatCountdown(2 * 3_600_000 + 14 * 60_000), "2h14m");
  assert.equal(formatCountdown(3 * 86_400_000 + 4 * 3_600_000), "3d4h");
  assert.equal(formatCountdown(0), "due");
});

test("formatMoney keeps cents only when they matter", () => {
  assert.equal(formatMoney(60), "$60");
  assert.equal(formatMoney(12.4), "$12.40");
  assert.equal(formatMoney(0.001), "<$0.01");
  assert.equal(formatMoney(1234), "$1.2k");
});

test("bar fills continuously", () => {
  assert.equal(bar(0, 5), "░░░░░");
  assert.equal(bar(40, 5), "██░░░");
  assert.equal(bar(100, 5), "█████");
});

test("renderHud shows 5h, weekly and monthly windows at full width", () => {
  const snapshot = normalizeGoUsage(goResponse, now);
  const line = text(renderHud(snapshot, 100, now));
  assert.match(line, /^Go 5h ██░░░ 40% used 2h14m │ Wk █░░░░ 12% used 3d4h │ Mo ███░░ 62% used 18d$/);
});

test("renderHud drops reset times before bars", () => {
  const snapshot = normalizeGoUsage(goResponse, now);
  const medium = text(renderHud(snapshot, 58, now));
  assert.equal(medium, "Go 5h ██░░░ 40% │ Wk █░░░░ 12% │ Mo ███░░ 62%");

  const compact = text(renderHud(snapshot, 38, now));
  assert.equal(compact, "Go 5h 40% │ Wk 12% │ Mo 62%");

  const tiny = text(renderHud(snapshot, 20, now));
  assert.equal(tiny, "Go 40/12/62%");

  const minimal = text(renderHud(snapshot, 10, now));
  assert.equal(minimal, "40/12/62%");
});

test("renderHud shows a limited window as 100%", () => {
  const snapshot = normalizeGoUsage(
    {
      usage: {
        ...goResponse.usage,
        rolling: { status: "rate-limited", percent: 98, resetsAt: "2026-11-18T14:14:00.000Z" },
      },
    },
    now,
  );
  const line = text(renderHud(snapshot, 38, now));
  assert.match(line, /5h 100%!/);
});

test("renderHud shows a Zen monthly budget when Go is absent", () => {
  const snapshot = normalizeLimits(
    {
      workspace: limitsResponse.workspace,
      budgets: [
        {
          id: "budget_1",
          limit: 60,
          spent: 12.4,
          scope: "each",
          per: "set",
          coverage: "all",
          models: [],
          vendors: [],
          picked: true,
          shared: false,
          resetsAt: Date.parse("2026-12-06T12:00:00.000Z"),
        },
      ],
    },
    now,
  );
  assert.equal(text(renderHud(snapshot, 60, now)), "Zen Mo █░░░░ 21% used $12.40/$60 18d");
  assert.equal(text(renderHud(snapshot, 30, now)), "Zen Mo 21% $12.40/$60");
  assert.equal(text(renderHud(snapshot, 12, now)), "Zen 21%");
});

test("renderHud handles missing data and errors", () => {
  assert.equal(text(renderHud({ source: "none", windows: [], fetchedAt: 0 }, 80, now)), "Go/Zen —");
  assert.equal(
    text(renderHud({ source: "none", windows: [], fetchedAt: now, error: "auth" }, 80, now)),
    "Go auth err",
  );
  assert.equal(
    text(renderHud({ source: "none", windows: [], fetchedAt: now, error: "network" }, 80, now)),
    "Go n/a",
  );
});

test("renderHud marks cached data stale after a failed refresh", () => {
  const snapshot = normalizeGoUsage(goResponse, now);
  snapshot.error = "network";
  const line = text(renderHud(snapshot, 100, now));
  assert.match(line, /^Go~ /);
});

test("renderHud marks data older than five minutes stale", () => {
  const snapshot = normalizeGoUsage(goResponse, now);
  const line = text(renderHud(snapshot, 100, now + 5 * 60_000 + 1));
  assert.match(line, /^Go~ /);
});
