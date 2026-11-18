import test from "node:test";
import assert from "node:assert/strict";
import { runCodexHud } from "../src/main";

test("JSON snapshot mode performs one quota read and emits only formatted display data", async () => {
  let reads = 0;
  let sleeps = 0;
  let output = "";
  const code = await runCodexHud(["--json"], {
    readRateLimits: async () => {
      reads += 1;
      return {
        rateLimits: {
          primary: { usedPercent: 20, resetsAt: Date.parse("2026-11-19T12:00:00Z") / 1000, windowDurationMins: 300 }
        }
      };
    },
    stdout: text => { output += text; },
    now: () => new Date("2026-11-19T10:00:00Z"),
    sleep: async () => { sleeps += 1; }
  });

  assert.equal(code, 0);
  assert.equal(reads, 1);
  assert.equal(sleeps, 0);
  const snapshot = JSON.parse(output) as {
    text: string;
    windows: Array<{
      text: string;
      label: string;
      remainingPercent: number;
      resetCountdown: string;
      resetAbsolute: string;
      resetText: string;
    }>;
  };
  assert.match(snapshot.text, /^Codex quota\n5h: 80% left · resets in 2h 00m · .+2026/);
  assert.equal(snapshot.windows.length, 1);
  assert.equal(snapshot.windows[0].label, "5h");
  assert.equal(snapshot.windows[0].remainingPercent, 80);
  assert.equal(snapshot.windows[0].resetCountdown, "2h 00m");
  assert.match(snapshot.windows[0].resetAbsolute, /2026/);
  assert.match(snapshot.windows[0].resetText, /^resets in 2h 00m · .+2026/);
});

test("JSON snapshot mode hides app-server errors behind a safe message", async () => {
  let output = "";
  const code = await runCodexHud(["--json"], {
    readRateLimits: async () => { throw new Error("private account response"); },
    stdout: text => { output += text; }
  });

  assert.equal(code, 1);
  assert.deepEqual(JSON.parse(output), {
    text: "Codex quota unavailable. Check Codex login."
  });
  assert.doesNotMatch(output, /private account response/);
});
