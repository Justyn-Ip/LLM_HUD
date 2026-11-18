import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { spawn } from "node:child_process";
import { readCodexRateLimits } from "../src/appServer";

test("Codex app-server handshake reads rate limits without exposing credentials", async () => {
  const requests: Array<Record<string, unknown>> = [];
  const child = new EventEmitter() as EventEmitter & {
    stdin: PassThrough;
    stdout: PassThrough;
    kill: () => boolean;
  };
  child.stdin = new PassThrough();
  child.stdout = new PassThrough();
  child.kill = () => true;
  child.stdin.on("data", (chunk: Buffer) => {
    for (const line of chunk.toString("utf8").split("\n").filter(Boolean)) {
      const request = JSON.parse(line) as Record<string, unknown>;
      requests.push(request);
      if (request.id !== undefined) {
        const result = request.method === "initialize" ? { userAgent: "codex" } : { rateLimits: { primary: { usedPercent: 25 } } };
        child.stdout.write(`${JSON.stringify({ id: request.id, result })}\n`);
      }
    }
  });

  const spawnServer = (() => child as never) as typeof spawn;
  const result = await readCodexRateLimits({
    launch: { command: "codex", args: [] },
    spawnServer,
    timeoutMs: 100
  });

  assert.deepEqual(result, { rateLimits: { primary: { usedPercent: 25 } } });
  assert.deepEqual(requests.map(request => request.method), ["initialize", "initialized", "account/rateLimits/read"]);
  assert.deepEqual(requests[2].params, { excludeResetCreditDetails: true });
});
