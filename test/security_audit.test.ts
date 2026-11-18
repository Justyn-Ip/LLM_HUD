import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.join(__dirname, "..", "..");

const forbiddenModules = [
  "fs",
  "node:fs",
  "fs/promises",
  "node:fs/promises",
  "child_process",
  "node:child_process",
  "http",
  "node:http",
  "https",
  "node:https",
  "http2",
  "node:http2",
  "net",
  "node:net",
  "tls",
  "node:tls",
  "dgram",
  "node:dgram",
  "dns",
  "node:dns",
  "os",
  "node:os",
  "worker_threads",
  "node:worker_threads",
  "vm",
  "node:vm"
];

test("static production source graph contains zero forbidden modules or active APIs", () => {
  const srcDir = path.join(root, "src");
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith(".ts"));
  assert.ok(files.length > 0);
  for (const file of files) {
    const src = fs.readFileSync(path.join(srcDir, file), "utf8");
    for (const mod of forbiddenModules) {
      const re = new RegExp(`(?:from\\s+["']${mod.replace("/", "\\/")}["']|require\\(\\s*["']${mod.replace("/", "\\/")}["']\\s*\\))`);
      assert.doesNotMatch(src, re, `src/${file} must not import ${mod}`);
    }
    assert.doesNotMatch(src, /\bfetch\s*\(/, `src/${file} must not call fetch()`);
    assert.doesNotMatch(src, /Asia\/Hong_Kong|UTC\+08:00|\ben-HK\b/, `src/${file} must not hard-code HK locale/tz`);
  }
});

test("generated dist/agy-hud.js bundle contains zero forbidden module requires or credential references", () => {
  const bundlePath = path.join(root, "dist", "agy-hud.js");
  const bundle = fs.readFileSync(bundlePath, "utf8");
  assert.ok(bundle.startsWith("#!/usr/bin/env node\n"));
  for (const mod of forbiddenModules) {
    const re = new RegExp(`\\brequire\\(\\s*["']${mod.replace("/", "\\/")}["']\\s*\\)`);
    assert.doesNotMatch(bundle, re, `dist/agy-hud.js must not require ${mod}`);
  }
  assert.doesNotMatch(bundle, /\bfetch\s*\(/);
  assert.doesNotMatch(bundle, /\b(SecKeychain|CredRead|dpapi|keytar)\b/i);
});
