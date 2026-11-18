import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("widget snapshot uses the latest recorded Codex quota without a CLI on PATH", t => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "codex-hud-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10).split("-");
  const directory = path.join(home, "sessions", ...day);
  fs.mkdirSync(directory, { recursive: true });

  function quota(agoMs: number, usedPercent: number) {
    return {
      timestamp: new Date(now - agoMs).toISOString(),
      type: "event_msg",
      payload: {
        type: "token_count",
        rate_limits: {
          limit_id: "codex",
          primary: { used_percent: usedPercent, window_minutes: 300, resets_at: Math.floor(now / 1000) + 7200 },
          secondary: { used_percent: 9, window_minutes: 10080, resets_at: Math.floor(now / 1000) + 172800 }
        }
      }
    };
  }

  const latest = quota(10_000, 28);
  const otherBucket = quota(1000, 99);
  otherBucket.payload.rate_limits.limit_id = "other";
  fs.writeFileSync(path.join(directory, "rollout-latest.jsonl"), [
    JSON.stringify(latest),
    JSON.stringify(otherBucket),
    '{"type":'
  ].join("\n"));
  fs.writeFileSync(path.join(directory, "rollout-older.jsonl"), [
    JSON.stringify(quota(60_000, 50)),
    JSON.stringify({ type: "response_item", payload: "private transcript text" }),
    ""
  ].join("\n"));

  const result = spawnSync(process.execPath, [path.join(__dirname, "../src/main.js"), "--json"], {
    env: { ...process.env, CODEX_HOME: home, PATH: "", Path: "" },
    encoding: "utf8",
    timeout: 5000
  });
  assert.equal(result.status, 0, result.stdout || result.stderr);
  const snapshot = JSON.parse(result.stdout);
  assert.match(snapshot.text, /^Codex quota\n5h: 72% left · resets in .+\nWeekly: 91% left · resets in .+$/);
  const [, fiveHour, weekly] = snapshot.text.split("\n");
  assert.equal(snapshot.windows.length, 2);
  assert.equal(snapshot.windows[0].text, fiveHour);
  assert.equal(snapshot.windows[0].label, "5h");
  assert.equal(snapshot.windows[0].remainingPercent, 72);
  assert.equal(snapshot.windows[0].resetCountdown, "2h 00m");
  assert.ok(snapshot.windows[0].resetAbsolute.length > 0);
  assert.match(snapshot.windows[0].resetText, /^resets in 2h 00m · /);
  assert.equal(snapshot.windows[1].text, weekly);
  assert.equal(snapshot.windows[1].label, "Weekly");
  assert.equal(snapshot.windows[1].remainingPercent, 91);
  assert.equal(snapshot.windows[1].resetCountdown, "2d 0h 00m");
  assert.ok(snapshot.windows[1].resetAbsolute.length > 0);
  assert.match(snapshot.windows[1].resetText, /^resets in 2d 0h 00m · /);
  assert.equal(snapshot.recordedAtMs, now - 10_000);
  assert.doesNotMatch(result.stdout, /private transcript text/);
});
