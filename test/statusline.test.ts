import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { strip, visibleLen } from "../src/ansi";
import { Config, defaultConfig } from "../src/config";
import { formatCost, Payload, render, shortModelName } from "../src/statusline";

function fixturePayload(): Payload {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "testdata", "statusline_payload.json"), "utf8"));
}

function cleanConfig(overrides: Partial<Config> = {}): Config {
  return {
    ...defaultConfig(),
    color: false,
    showIcons: false,
    locale: "en-GB",
    timeZone: "UTC",
    ...overrides
  };
}

test("short model name strips Gemini/Claude/Thinking and compacts tier", () => {
  const cases: Record<string, string> = {
    "Gemini 3.8 Flash (High)": "3.8 Flash High",
    "Gemini 3.7 Flash (Medium)": "3.7 Flash Med",
    "Gemini 3.6 Flash (Low)": "3.6 Flash Low",
    "GPT-OSS 120B (Medium)": "GPT-OSS 120B Med",
    "Claude Sonnet 4.6 (Thinking)": "Sonnet 4.6",
    "Claude Opus 4.6 (Thinking)": "Opus 4.6"
  };
  for (const [input, want] of Object.entries(cases)) {
    assert.equal(shortModelName(input), want);
  }
});

test("missing, empty, and malformed quota renders Quota N/A without fabricating values", () => {
  const base = fixturePayload();
  const malformedCases: unknown[] = [
    undefined,
    {},
    { "gemini-5h": { remaining_fraction: -0.2 } },
    { "gemini-5h": { remaining_fraction: "bad" } }
  ];
  for (const quota of malformedCases) {
    const out = render({ ...base, quota: quota as Payload["quota"], terminal_width: 120 }, { config: cleanConfig() });
    assert.match(out, /Quota N\/A/);
    assert.doesNotMatch(out, /% left/);
  }
});

test("single-bucket quota renders bucket label, remaining percentage, countdown, and absolute reset time", () => {
  const payload: Payload = {
    ...fixturePayload(),
    terminal_width: 120,
    vcs: { type: "git", branch: "main" },
    quota: {
      "gemini-5h": {
        remaining_fraction: 0.72,
        reset_time: "2026-11-20T18:00:00Z",
        reset_in_seconds: 198000
      }
    }
  };
  const out = render(payload, {
    config: cleanConfig({ locale: "en-GB", timeZone: "Asia/Hong_Kong" }),
    now: new Date("2026-11-18T10:25:00Z")
  });
  const [line1, line2] = out.split("\n");
  assert.match(line1, /3\.5 Flash Med \| Pro/);
  assert.match(line1, /agy-hud/);
  assert.match(line1, /main/);
  assert.match(line1, /Idle/);
  assert.match(line2, /Context .* 12%/);
  assert.equal(line2, "Context █░░░░░░░░░ 12% │ Quota: Gemini 5h: 72% left (2d 7h 35m, 21-Nov-2026 2:00)");
  assert.doesNotMatch(line2, /28%/);
});

test("multi-bucket quota renders uniform no-bar horizontal per-group lines with DD-MMM-YYYY", () => {
  const payload: Payload = {
    ...fixturePayload(),
    terminal_width: 140,
    vcs: { type: "git", branch: "main" },
    quota: {
      "gemini-5h": {
        remaining_fraction: 0.96,
        reset_time: "2026-11-20T18:00:00Z"
      },
      "gemini-weekly": {
        remaining_fraction: 0.91,
        reset_time: "2026-11-22T22:35:00Z"
      },
      "gemini-argon-wtu-weekly": {
        remaining_fraction: 0.98,
        reset_time: "2026-11-23T06:00:00Z"
      },
      "3p-5h": {
        remaining_fraction: 1,
        reset_time: "2026-11-20T19:00:00Z"
      },
      "3p-weekly": {
        remaining_fraction: 0.5,
        reset_time: "2026-11-24T10:00:00Z"
      }
    }
  };
  const out = render(payload, {
    config: cleanConfig({ locale: "en-US", timeZone: "Asia/Hong_Kong" }),
    now: new Date("2026-11-18T10:25:00Z")
  });
  const lines = out.split("\n");
  assert.equal(lines.length, 5);
  assert.match(lines[1], /^Context .* 12%$/);
  assert.equal(lines[2], " Gemini     │ 5h: 96% left (2d 7h 35m, 21-Nov-2026 2:00 AM)  │ Weekly: 91% left (4d 12h 10m, 23-Nov-2026 6:35 AM)");
  assert.equal(lines[3], " Argon      │                                                │ Weekly: 98% left (4d 19h 35m, 23-Nov-2026 2:00 PM)");
  assert.equal(lines[4], " Claude/GPT │ 5h: 100% left (2d 8h 35m, 21-Nov-2026 3:00 AM) │ Weekly: 50% left (5d 23h 35m, 24-Nov-2026 6:00 PM)");
  for (const qLine of lines.slice(2)) {
    assert.doesNotMatch(qLine, /[█░]|Reset /);
  }
  const weeklyCols = lines.slice(2).map(l => l.indexOf("Weekly:"));
  assert.equal(weeklyCols[0], weeklyCols[1]);
  assert.equal(weeklyCols[1], weeklyCols[2]);

  for (const width of [80, 120, 140]) {
    const wideOut = strip(
      render({ ...payload, terminal_width: width }, {
        config: cleanConfig({ locale: "en-US", timeZone: "Asia/Hong_Kong" }),
        now: new Date("2026-11-18T10:25:00Z")
      })
    );
    const qLines = wideOut.split("\n").slice(2);
    assert.match(qLines[1], /^ Argon\s+│\s+│ Weekly: /);
    const cols = qLines.map(l => l.indexOf("Weekly:"));
    assert.ok(cols[0] > 0);
    assert.equal(cols[0], cols[1]);
    assert.equal(cols[1], cols[2]);
  }
});

test("known CLI 1.3.5 (2 groups) and 1.4.5 (3 groups) payloads render horizontal groups uniformly without bars", () => {
  const p135: Payload = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "testdata", "statusline_payload_1.3.5.json"), "utf8"));
  const out135 = render(p135, { config: cleanConfig(), now: new Date("2026-10-15T08:38:00Z") });
  const lines135 = out135.split("\n");
  assert.equal(lines135.length, 4);
  assert.equal(lines135[2], " Gemini     │ 5h: 100% left (5h 00m, 15-Oct-2026 13:37) │ Weekly: 98% left (5d 21h 39m, 21-Oct-2026 6:16)");
  assert.equal(lines135[3], " Claude/GPT │ 5h: 100% left (5h 00m, 15-Oct-2026 13:37) │ Weekly: 100% left (7d 0h 00m, 22-Oct-2026 8:37)");

  const p145: Payload = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "testdata", "statusline_payload_1.4.5.json"), "utf8"));
  const out145 = render(p145, { config: cleanConfig(), now: new Date("2026-10-22T13:06:20Z") });
  const lines145 = out145.split("\n");
  assert.equal(lines145.length, 5);
  assert.match(lines145[0], /4 Argon Med/);
  assert.equal(lines145[2], " Gemini     │ 5h: 100% left (4h 59m, 22-Oct-2026 18:04) │ Weekly: 39% left (1d 9h 02m, 23-Oct-2026 22:08)");
  assert.equal(lines145[3], " Argon      │                                           │ Weekly: 0% left (1d 13h 24m, 24-Oct-2026 2:29)");
  assert.equal(lines145[4], " Claude/GPT │ 5h: 100% left (5h 00m, 22-Oct-2026 18:06) │ Weekly: 10% left (1d 7h 32m, 23-Oct-2026 20:38)");
});

test("past-due reset timestamp displays Reset due / awaiting update", () => {
  const payload: Payload = {
    ...fixturePayload(),
    terminal_width: 120,
    quota: {
      "gemini-5h": {
        remaining_fraction: 0.15,
        reset_time: "2026-11-18T09:00:00Z"
      }
    }
  };
  const out = render(payload, { config: cleanConfig(), now: new Date("2026-11-18T10:00:00Z") });
  assert.match(out, /Gemini 5h: 15% left \(Reset due \/ awaiting update\)/);
});

test("reset_in_seconds fallback marks derived absolute timestamp as estimated", () => {
  const payload: Payload = {
    ...fixturePayload(),
    terminal_width: 120,
    quota: {
      "gemini-5h": {
        remaining_fraction: 0.6,
        reset_in_seconds: 3600
      }
    }
  };
  const out = render(payload, { config: cleanConfig(), now: new Date("2026-11-18T10:00:00Z") });
  assert.match(out, /Gemini 5h: 60% left \(1h 00m, ~18-Nov-2026 11:00 \(estimated\)\)/);
});

test("ANSI, OSC, control chars, and bidi injection are stripped across all untrusted fields", () => {
  const payload: Payload = {
    model: { display_name: "Evil\x1b]0;pwned\x07Model\n\x1b[31mRed\x1b[0m" },
    cwd: "/tmp/dir\x1b[31m\n\r\tName",
    vcs: { branch: "feat/\x1b]8;;http://evil\x07\u202Emain\x07\n" },
    agent_state: "idle\x1b[2J\x00",
    conversation_title: "Title\n\x1b]0;x\x07\u202E",
    plan_tier: "\x1b[31mPro\x1b[0m",
    cycle_mode: "\x1b[31mauto",
    terminal_width: 160,
    quota: {
      "bucket\x1b[31m\n\x07id_very_long_name_exceeding_thirty_two_columns": {
        remaining_fraction: 0.5,
        reset_time: "2026-11-20T18:00:00Z"
      }
    }
  };

  const out = render(payload, {
    config: cleanConfig({ showTitle: true }),
    now: new Date("2026-11-18T10:00:00Z")
  });
  assert.doesNotMatch(out, /[\x00-\x09\x0b-\x1f\x7f\u202e]/);
  assert.doesNotMatch(out, /pwned|http:\/\/evil/);
  assert.equal(out.split("\n").length, 2);
});

test("terminal widths 40, 60, 80, 120 and extreme narrow widths degrade gracefully", () => {
  const payload: Payload = {
    ...fixturePayload(),
    vcs: { type: "git", branch: "feature/very-long-branch-name" },
    cost: { total_usd: 1.25, estimated: true },
    quota: {
      "gemini-5h": {
        remaining_fraction: 0.72,
        reset_time: "2026-11-20T18:00:00Z"
      },
      "gemini-weekly": {
        remaining_fraction: 0.18,
        reset_time: "2026-11-22T22:35:00Z"
      },
      "gemini-argon-wtu-weekly": {
        remaining_fraction: 0.55,
        reset_time: "2026-11-23T06:00:00Z"
      },
      "3p-5h": {
        remaining_fraction: 0.9,
        reset_time: "2026-11-18T15:00:00Z"
      },
      "3p-weekly": {
        remaining_fraction: 0.4,
        reset_time: "2026-11-24T10:00:00Z"
      }
    }
  };

  for (const multiline of [true, false]) {
    for (const width of [10, 20, 40, 60, 80, 120, 140]) {
      const out = render({ ...payload, terminal_width: width }, {
        config: { ...defaultConfig(), multiline },
        now: new Date("2026-11-18T10:25:00Z")
      });
      if (!multiline) {
        assert.doesNotMatch(out, /\n/);
      }
      for (const line of out.split("\n")) {
        assert.ok(visibleLen(line) <= width, `multiline=${multiline} width=${width} exceeded by ${JSON.stringify(strip(line))}`);
      }
    }
  }

  // At 60 cols on single bucket, cosmetic bar drops before remaining percentage
  const singleNarrow = render(
    {
      ...fixturePayload(),
      terminal_width: 60,
      quota: { "gemini-5h": { remaining_fraction: 0.72, reset_time: "2026-11-20T18:00:00Z" } }
    },
    { config: cleanConfig(), now: new Date("2026-11-18T10:25:00Z") }
  );
  assert.match(singleNarrow, /72% left/);
  for (const line of singleNarrow.split("\n")) {
    assert.ok(visibleLen(line) <= 60);
  }
});

test("sensitive payload fields never leak", () => {
  const payload = fixturePayload();
  payload.email = "private-email-value";
  payload.session_id = "private-session-value";
  payload.conversation_id = "private-conversation-value";
  payload.transcript_path = "private-transcript-location";
  const out = render(payload, {
    config: defaultConfig(),
    now: new Date("2026-05-19T12:00:00Z")
  });
  const lower = strip(out).toLowerCase();
  for (const forbidden of ["private-email-value", "private-session-value", "private-conversation-value", "private-transcript-location", "csrf", "cookie", "token"]) {
    assert.doesNotMatch(lower, new RegExp(forbidden));
  }
});

test("formatCost formats USD values cleanly", () => {
  assert.equal(formatCost(0), "$0.00");
  assert.equal(formatCost(-1), "$0.00");
  assert.equal(formatCost(Number.NaN), "$0.00");
  assert.equal(formatCost(0.0004), "<$0.001");
  assert.equal(formatCost(0.0042), "$0.004");
  assert.equal(formatCost(0.012), "$0.01");
  assert.equal(formatCost(1.25), "$1.25");
});
