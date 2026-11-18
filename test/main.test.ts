import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import childProcess, { execFileSync } from "node:child_process";
import { PassThrough, Readable } from "node:stream";
import { strip } from "../src/ansi";
import { defaultConfig } from "../src/config";
import { maxStdinBytes, renderStatusline, runCli, stdinTimeoutMs, version } from "../src/main";

const packageVersion = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8")
).version as string;

function samplePayload(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    cwd: "agy-hud",
    model: { display_name: "Gemini 3.5 Flash (High)" },
    context_window: { used_percentage: 24 },
    agent_state: "idle",
    plan_tier: "Google AI Pro",
    vcs: { branch: "main" },
    terminal_width: 120,
    quota: {
      "gemini-5h": {
        remaining_fraction: 0.72,
        reset_time: "2026-11-20T18:00:00Z"
      }
    },
    ...overrides
  });
}

test("version matches package.json and empty/malformed/non-object JSON exits cleanly without printing raw JSON", async () => {
  assert.equal(version, packageVersion);
  assert.equal(maxStdinBytes, 1024 * 1024);
  assert.equal(stdinTimeoutMs, 1000);

  for (const bad of ["", "not json", "{bad", "null", "[]", "123", '"secret-token-value"', "true"]) {
    let out = "";
    let err = "";
    const code = await runCli(["statusline"], {
      stdin: Readable.from([bad]),
      stdout: chunk => { out += chunk; },
      stderr: chunk => { err += chunk; }
    });
    assert.equal(code, 0);
    assert.equal(out, "agy-hud\n");
    assert.equal(err, "");
    assert.doesNotMatch(out, /secret-token-value/);
  }
});

test("rejects payloads exceeding 1 MiB byte cap without leaking raw payload", async () => {
  const bigSecret = "SECRET_PAYLOAD_" + "x".repeat(maxStdinBytes + 1024);
  const bigJson = JSON.stringify({ conversation_title: bigSecret, model: { display_name: "Gemini" } });
  let out = "";
  let err = "";
  const code = await runCli(["statusline"], {
    stdin: Readable.from([Buffer.from(bigJson, "utf8")]),
    stdout: chunk => { out += chunk; },
    stderr: chunk => { err += chunk; }
  });
  assert.equal(code, 0);
  assert.equal(out, "agy-hud\n");
  assert.equal(err, "");
  assert.doesNotMatch(out + err, /SECRET_PAYLOAD/);

  assert.equal(renderStatusline(bigJson, defaultConfig()), "agy-hud");
});

test("rejects invalid UTF-8 byte sequences cleanly without crashing or leaking bytes", async () => {
  const invalidBytes = Buffer.from([0x7b, 0x22, 0x61, 0x22, 0x3a, 0xff, 0xfe, 0x7d]);
  let out = "";
  let err = "";
  const code = await runCli(["statusline"], {
    stdin: Readable.from([invalidBytes]),
    stdout: chunk => { out += chunk; },
    stderr: chunk => { err += chunk; }
  });
  assert.equal(code, 0);
  assert.equal(out, "agy-hud\n");
  assert.equal(err, "");
});

test("waits for chunked JSON and settles immediately without waiting for EOF", async () => {
  const entry = path.join(__dirname, "..", "..", "dist", "agy-hud.js");
  const child = childProcess.spawn(process.execPath, [entry, "statusline", "--no-color", "--no-icons"], {
    stdio: ["pipe", "pipe", "ignore"]
  });
  let stdout = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", chunk => { stdout += chunk; });

  const payload = samplePayload();
  child.stdin.write(payload.slice(0, 30));
  await new Promise(resolve => setTimeout(resolve, 40));
  child.stdin.write(payload.slice(30));

  const started = performance.now();
  const exited = await Promise.race([
    new Promise<boolean>(resolve => child.once("close", () => resolve(true))),
    new Promise<boolean>(resolve => setTimeout(() => resolve(false), 3000))
  ]);
  child.stdin.destroy();
  if (child.exitCode === null) child.kill("SIGKILL");

  assert.equal(exited, true);
  assert.equal(child.exitCode, 0);
  assert.ok(performance.now() - started < 2000);
  assert.match(stdout, /3\.5 Flash High/);
  assert.match(stdout, /72% left/);
});

test("gives up cleanly on silent open stdin within configured timeout", async () => {
  const stdin = new PassThrough();
  let out = "";
  const started = performance.now();
  const code = await runCli(["statusline"], {
    stdin,
    stdout: chunk => { out += chunk; },
    stderr: () => {},
    stdinTimeoutMs: 80
  });
  assert.equal(code, 0);
  assert.equal(out, "agy-hud\n");
  assert.ok(performance.now() - started < 1000);
});

test("removed active quota refresh command exits non-zero with usage message", async () => {
  let out = "";
  let err = "";
  const code = await runCli(["quota", "refresh"], {
    stdout: chunk => { out += chunk; },
    stderr: chunk => { err += chunk; }
  });
  assert.equal(code, 2);
  assert.equal(out, "");
  assert.match(err, /^usage:/);
});

test("bundle runs when child_process, fs, and network APIs are blocked/stubbed", () => {
  const bundlePath = path.join(__dirname, "..", "..", "dist", "agy-hud.js");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-hud-blocked-"));
  const preload = path.join(dir, "block-apis.js");
  fs.writeFileSync(
    preload,
    `
const Module = require("node:module");
const blocked = new Set([
  "fs", "node:fs", "fs/promises", "node:fs/promises",
  "child_process", "node:child_process",
  "http", "node:http", "https", "node:https", "http2", "node:http2",
  "net", "node:net", "tls", "node:tls", "dgram", "node:dgram", "dns", "node:dns"
]);
const origLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (blocked.has(request)) {
    throw new Error("BLOCKED_MODULE:" + request);
  }
  return origLoad.apply(this, arguments);
};
globalThis.fetch = () => { throw new Error("BLOCKED_FETCH"); };
`,
    "utf8"
  );

  const output = execFileSync(
    process.execPath,
    ["--require", preload, bundlePath, "statusline", "--no-color", "--no-icons", "--locale=en-GB", "--time-zone=UTC"],
    {
      input: samplePayload(),
      encoding: "utf8"
    }
  );
  assert.match(output, /3\.5 Flash High/);
  assert.match(output, /72% left/);
});

test("concurrent multi-pane simulated invocations share no mutable state, locks, or caches", async () => {
  const now = new Date("2026-11-18T10:00:00Z");
  const panes = Array.from({ length: 20 }, (_, i) => ({
    model: i % 2 === 0 ? "Gemini 3.5 Flash (High)" : "Claude Sonnet 4.6 (Thinking)",
    branch: `pane-${i}`,
    pct: 0.1 + i * 0.04,
    width: 60 + (i % 3) * 30
  }));

  const results = await Promise.all(
    panes.map(pane => {
      let out = "";
      return runCli(["statusline", "--no-color", "--no-icons", "--locale=en-GB", "--time-zone=UTC"], {
        stdin: Readable.from([
          JSON.stringify({
            model: { display_name: pane.model },
            vcs: { branch: pane.branch },
            context_window: { used_percentage: 20 },
            terminal_width: pane.width,
            quota: {
              "gemini-5h": { remaining_fraction: pane.pct, reset_time: "2026-11-18T12:00:00Z" },
              "3p-5h": { remaining_fraction: pane.pct, reset_time: "2026-11-18T12:00:00Z" }
            }
          })
        ]),
        stdout: chunk => { out += chunk; },
        stderr: () => {},
        now
      }).then(code => ({ code, out: strip(out), pane }));
    })
  );

  for (const { code, out, pane } of results) {
    assert.equal(code, 0);
    assert.match(out, new RegExp(pane.branch));
    assert.match(out, /Gemini/);
    assert.match(out, /Claude\/GPT/);
    assert.match(out, /5h/);
    assert.match(out, new RegExp(`${Math.round(pane.pct * 100)}% left`));
  }
});

test("dist bundle CLI smoke test for version and doctor --json", () => {
  const bundlePath = path.join(__dirname, "..", "..", "dist", "agy-hud.js");
  assert.equal(execFileSync(process.execPath, [bundlePath, "version"], { encoding: "utf8" }), `${packageVersion}\n`);
  const doc = JSON.parse(execFileSync(process.execPath, [bundlePath, "doctor", "--json"], { encoding: "utf8" }));
  assert.equal(doc.passive, true);
  assert.equal(doc.version, packageVersion);
});
