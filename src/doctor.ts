import { Config, defaultConfig } from "./config";

export const iconProbe: { glyph: string; label: string }[] = [
  { glyph: "", label: "model" },
  { glyph: "", label: "plan" },
  { glyph: "", label: "branch" },
  { glyph: "", label: "folder" }
];

export interface PassiveDoctorReport {
  version: string;
  passive: true;
  nodeVersion: string;
  nodeOk: boolean;
  platform: string;
  locale: string;
  timeZone: string;
  defaults: Config;
  iconProbe: string;
}

function nodeMajor(nodeVersion: string): number {
  const match = nodeVersion.trim().match(/^v?(\d+)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Strictly passive runtime self-check. Reads no files, inspects no processes,
 * spawns no commands, and emits no environment variables or secrets.
 */
export function collectPassiveDoctorReport(version: string): PassiveDoctorReport {
  const resolved = new Intl.DateTimeFormat().resolvedOptions();
  return {
    version,
    passive: true,
    nodeVersion: process.version,
    nodeOk: nodeMajor(process.version) >= 18,
    platform: process.platform,
    locale: resolved.locale || "unknown",
    timeZone: resolved.timeZone || "unknown",
    defaults: defaultConfig(),
    iconProbe: iconProbe.map(item => `${item.glyph} ${item.label}`).join("   ")
  };
}

export function formatPassiveDoctorReport(report: PassiveDoctorReport): string {
  const lines = [
    `agy-hud ${report.version} (strictly passive mode)`,
    `node      ${report.nodeVersion} (${report.nodeOk ? "ok" : "Node 18+ required"})`,
    `platform  ${report.platform}`,
    `locale    ${report.locale}`,
    `timezone  ${report.timeZone}`,
    `probe     ${report.iconProbe}`,
    `note      If the probe shows boxes instead of icons, pass --no-icons or install a Nerd Font.`
  ];
  return `${lines.join("\n")}\n`;
}
