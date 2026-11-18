import test from "node:test";
import assert from "node:assert/strict";
import { collectPassiveDoctorReport, formatPassiveDoctorReport, iconProbe } from "../src/doctor";

test("passive doctor report exposes non-sensitive runtime diagnostics only", () => {
  const report = collectPassiveDoctorReport("0.2.0-passive");
  assert.equal(report.version, "0.2.0-passive");
  assert.equal(report.passive, true);
  assert.equal(report.nodeVersion, process.version);
  assert.equal(report.nodeOk, true);
  assert.equal(report.platform, process.platform);
  assert.ok(report.locale.length > 0);
  assert.ok(report.timeZone.length > 0);
  assert.equal(report.defaults.usageValue, "remaining");

  const text = formatPassiveDoctorReport(report);
  assert.match(text, /strictly passive mode/);
  for (const item of iconProbe) {
    assert.ok(text.includes(item.glyph));
    assert.ok(text.includes(item.label));
  }
});
