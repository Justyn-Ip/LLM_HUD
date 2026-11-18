#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const bundlePath = path.join(root, "dist", "agy-hud.js");
const pkgPath = path.join(root, "package.json");
const cmdHookPath = path.join(root, "hooks", "status-line.cmd");

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

const forbiddenSrcPatterns = [
  { name: "fetch call", regex: /\bfetch\s*\(/ },
  { name: "XMLHttpRequest", regex: /\bXMLHttpRequest\b/ },
  { name: "hard-coded Asia/Hong_Kong", regex: /Asia\/Hong_Kong/ },
  { name: "hard-coded UTC+08:00", regex: /UTC\+08:00/ },
  { name: "hard-coded en-HK", regex: /\ben-HK\b/ },
  { name: "credential store reference", regex: /\b(SecKeychain|CredRead|dpapi|keytar)\b/i }
];

const errors = [];

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
for (const hook of ["preinstall", "install", "postinstall", "prepare"]) {
  if (pkg.scripts && Object.prototype.hasOwnProperty.call(pkg.scripts, hook)) {
    errors.push(`package.json must not define npm lifecycle script "${hook}"`);
  }
}

const srcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith(".ts")).sort();
if (srcFiles.length === 0) {
  errors.push("No TypeScript source files found in src/");
}

for (const file of srcFiles) {
  const full = path.join(srcDir, file);
  const content = fs.readFileSync(full, "utf8");

  for (const mod of forbiddenModules) {
    const importRe = new RegExp(`(?:from\\s+["']${mod.replace("/", "\\/")}["']|require\\(\\s*["']${mod.replace("/", "\\/")}["']\\s*\\))`);
    if (importRe.test(content)) {
      errors.push(`src/${file}: forbidden module import "${mod}"`);
    }
  }

  for (const pat of forbiddenSrcPatterns) {
    if (pat.regex.test(content)) {
      errors.push(`src/${file}: forbidden ${pat.name}`);
    }
  }
}

if (!fs.existsSync(bundlePath)) {
  errors.push("dist/agy-hud.js does not exist (run npm run build first)");
} else {
  const bundle = fs.readFileSync(bundlePath, "utf8");
  if (!bundle.startsWith("#!/usr/bin/env node\n")) {
    errors.push("dist/agy-hud.js must start with #!/usr/bin/env node");
  }
  for (const mod of forbiddenModules) {
    const escaped = mod.replace("/", "\\/");
    const reqRe = new RegExp(`\\brequire\\(\\s*["']${escaped}["']\\s*\\)`);
    if (reqRe.test(bundle)) {
      errors.push(`dist/agy-hud.js: forbidden require("${mod}")`);
    }
  }
  if (/\bfetch\s*\(/.test(bundle)) {
    errors.push("dist/agy-hud.js: forbidden fetch() call");
  }
  if (/\b(SecKeychain|CredRead|dpapi|keytar)\b/i.test(bundle)) {
    errors.push("dist/agy-hud.js: forbidden credential-store reference");
  }
  const sha256 = crypto.createHash("sha256").update(fs.readFileSync(bundlePath)).digest("hex");
  console.log(`audit: dist/agy-hud.js sha256=${sha256}`);
}

const cmdText = fs.readFileSync(cmdHookPath, "utf8");
if (!cmdText.includes("\r\n") || /[^\r]\n/.test(cmdText)) {
  errors.push("hooks/status-line.cmd must use CRLF line endings");
}

if (errors.length > 0) {
  for (const err of errors) {
    console.error(`AUDIT FAIL: ${err}`);
  }
  process.exit(1);
}

console.log(`audit: PASS (${srcFiles.length} src files, bundle verified passive)`);
