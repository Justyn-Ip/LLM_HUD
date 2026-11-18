export type ContextDisplayMode = "percent" | "tokens" | "both";
export type UsageDisplayMode = "remaining" | "percent";

export interface Config {
  showModel: boolean;
  showProgressBar: boolean;
  multiline: boolean;
  color: boolean;
  showGitBranch: boolean;
  showCWD: boolean;
  showAgentState: boolean;
  showCost: boolean;
  showTitle: boolean;
  showMode: boolean;
  showIcons: boolean;
  contextValue: ContextDisplayMode;
  usageValue: UsageDisplayMode;
  locale?: string;
  timeZone?: string;
  stdinTimeoutMs: number;
}

export const defaultStdinTimeoutMs = 1000;
export const minStdinTimeoutMs = 50;
export const maxStdinTimeoutMs = 10000;

/**
 * Static build-time defaults. The passive status-line runtime never reads
 * configuration files or secret environment variables from disk/env.
 */
export function defaultConfig(): Config {
  return {
    showModel: true,
    showProgressBar: true,
    multiline: true,
    color: true,
    showGitBranch: true,
    showCWD: true,
    showAgentState: true,
    showCost: true,
    showTitle: false,
    showMode: true,
    showIcons: true,
    contextValue: "percent",
    usageValue: "remaining",
    locale: undefined,
    timeZone: undefined,
    stdinTimeoutMs: defaultStdinTimeoutMs
  };
}

function isValidLocale(value: string): boolean {
  if (value === "" || value.length > 35 || !/^[A-Za-z0-9-]+$/.test(value)) {
    return false;
  }
  try {
    new Intl.DateTimeFormat(value);
    return true;
  } catch {
    return false;
  }
}

function isValidTimeZone(value: string): boolean {
  if (value === "" || value.length > 64 || !/^[A-Za-z0-9_/+.-]+$/.test(value)) {
    return false;
  }
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse safe, non-secret CLI flags into a static Config copy.
 */
export function parseCliConfig(args: string[], base: Config = defaultConfig()): { config: Config; error?: string } {
  const cfg: Config = { ...base };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--color") cfg.color = true;
    else if (arg === "--no-color") cfg.color = false;
    else if (arg === "--icons") cfg.showIcons = true;
    else if (arg === "--no-icons") cfg.showIcons = false;
    else if (arg === "--bar") cfg.showProgressBar = true;
    else if (arg === "--no-bar") cfg.showProgressBar = false;
    else if (arg === "--multiline") cfg.multiline = true;
    else if (arg === "--single-line") cfg.multiline = false;
    else if (arg === "--no-git") cfg.showGitBranch = false;
    else if (arg === "--no-cwd") cfg.showCWD = false;
    else if (arg === "--no-state") cfg.showAgentState = false;
    else if (arg === "--no-cost") cfg.showCost = false;
    else if (arg === "--no-mode") cfg.showMode = false;
    else if (arg === "--show-title") cfg.showTitle = true;
    else if (arg === "--no-title") cfg.showTitle = false;
    else if (arg.startsWith("--context-value=")) {
      const v = arg.slice("--context-value=".length);
      if (v === "percent" || v === "tokens" || v === "both") cfg.contextValue = v;
      else return { config: cfg, error: "Invalid --context-value (expected percent, tokens, or both)." };
    } else if (arg.startsWith("--usage-value=")) {
      const v = arg.slice("--usage-value=".length);
      if (v === "remaining" || v === "percent") cfg.usageValue = v;
      else return { config: cfg, error: "Invalid --usage-value (expected remaining or percent)." };
    } else if (arg.startsWith("--locale=")) {
      const v = arg.slice("--locale=".length);
      if (isValidLocale(v)) cfg.locale = v;
      else return { config: cfg, error: "Invalid --locale value." };
    } else if (arg.startsWith("--time-zone=")) {
      const v = arg.slice("--time-zone=".length);
      if (isValidTimeZone(v)) cfg.timeZone = v;
      else return { config: cfg, error: "Invalid --time-zone value." };
    } else if (arg.startsWith("--stdin-timeout-ms=")) {
      const raw = Number(arg.slice("--stdin-timeout-ms=".length));
      if (!Number.isInteger(raw) || raw < minStdinTimeoutMs || raw > maxStdinTimeoutMs) {
        return { config: cfg, error: `Invalid --stdin-timeout-ms (expected integer ${minStdinTimeoutMs}..${maxStdinTimeoutMs}).` };
      }
      cfg.stdinTimeoutMs = raw;
    } else {
      return { config: cfg, error: "Unknown flag." };
    }
  }
  return { config: cfg };
}
