import test from "node:test";
import assert from "node:assert/strict";
import { defaultConfig, parseCliConfig } from "../src/config";

test("default config uses static passive defaults and OS locale/timezone", () => {
  const got = defaultConfig();
  assert.equal(got.showModel, true);
  assert.equal(got.showProgressBar, true);
  assert.equal(got.multiline, true);
  assert.equal(got.color, true);
  assert.equal(got.showGitBranch, true);
  assert.equal(got.showCWD, true);
  assert.equal(got.showAgentState, true);
  assert.equal(got.showCost, true);
  assert.equal(got.showTitle, false);
  assert.equal(got.showMode, true);
  assert.equal(got.showIcons, true);
  assert.equal(got.contextValue, "percent");
  assert.equal(got.usageValue, "remaining");
  assert.equal(got.locale, undefined);
  assert.equal(got.timeZone, undefined);
  assert.equal(got.stdinTimeoutMs, 1000);
});

test("parseCliConfig applies safe non-secret CLI flags", () => {
  const res = parseCliConfig([
    "--no-color",
    "--no-icons",
    "--single-line",
    "--show-title",
    "--no-cost",
    "--context-value=both",
    "--usage-value=percent",
    "--locale=en-GB",
    "--time-zone=Europe/London",
    "--stdin-timeout-ms=500"
  ]);
  assert.equal(res.error, undefined);
  assert.equal(res.config.color, false);
  assert.equal(res.config.showIcons, false);
  assert.equal(res.config.multiline, false);
  assert.equal(res.config.showTitle, true);
  assert.equal(res.config.showCost, false);
  assert.equal(res.config.contextValue, "both");
  assert.equal(res.config.usageValue, "percent");
  assert.equal(res.config.locale, "en-GB");
  assert.equal(res.config.timeZone, "Europe/London");
  assert.equal(res.config.stdinTimeoutMs, 500);
});

test("parseCliConfig rejects invalid flag values and unknown flags", () => {
  assert.ok(parseCliConfig(["--context-value=bogus"]).error);
  assert.ok(parseCliConfig(["--usage-value=bogus"]).error);
  assert.ok(parseCliConfig(["--locale=invalid_locale!"]).error);
  assert.ok(parseCliConfig(["--time-zone=Mars/Olympus_Mons"]).error);
  assert.ok(parseCliConfig(["--stdin-timeout-ms=10"]).error);
  assert.ok(parseCliConfig(["--stdin-timeout-ms=999999"]).error);
  assert.ok(parseCliConfig(["--unknown-flag"]).error);
});
