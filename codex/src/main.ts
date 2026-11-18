import { codexQuotaUnavailableMessage, formatCodexQuota, formatCodexQuotaSnapshot } from "./quota";
import { readCodexRateLimits } from "./appServer";
import { readRecordedCodexQuota } from "./sessionQuota";

export const refreshIntervalMs = 60_000;

export interface CompanionDeps {
  readRateLimits?: () => Promise<unknown>;
  stdout?: (text: string) => void;
  isTTY?: boolean;
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function renderCodexHud(response: unknown, now: Date = new Date()): string {
  return `${formatCodexQuota(response, now)}\nRefreshes every minute. Press Ctrl+C to exit.`;
}

export async function runCodexHud(args: string[], deps: CompanionDeps = {}): Promise<number> {
  const stdout = deps.stdout ?? (text => process.stdout.write(text));
  const isTTY = deps.isTTY ?? process.stdout.isTTY === true;
  const readRateLimits = deps.readRateLimits ?? readCodexRateLimits;
  const sleep = deps.sleep ?? defaultSleep;
  const now = deps.now ?? (() => new Date());

  if (args.includes("--help") || args.includes("-h")) {
    stdout("usage: codex-hud [--json]\n");
    return 0;
  }
  if (args.length === 1 && args[0] === "--json") {
    try {
      const recorded = deps.readRateLimits ? null : readRecordedCodexQuota();
      if (!recorded && !deps.readRateLimits) throw new Error("No recorded Codex quota");
      const response = recorded ? recorded.response : await deps.readRateLimits?.();
      stdout(`${JSON.stringify({
        ...formatCodexQuotaSnapshot(response, now()),
        recordedAtMs: recorded?.recordedAtMs
      })}\n`);
      return 0;
    } catch {
      stdout(`${JSON.stringify({ text: codexQuotaUnavailableMessage })}\n`);
      return 1;
    }
  }
  if (args.length > 0) {
    stdout("usage: codex-hud\n");
    return 2;
  }

  let first = true;
  for (;;) {
    let view: string;
    try {
      view = renderCodexHud(await readRateLimits(), now());
    } catch {
      view = codexQuotaUnavailableMessage;
      if (first) {
        stdout(`${view}\n`);
        return 1;
      }
    }

    stdout(`${isTTY ? "\x1b[2J\x1b[H" : ""}${view}\n`);
    first = false;
    await sleep(refreshIntervalMs);
  }
}

if (require.main === module) {
  runCodexHud(process.argv.slice(2)).then(code => {
    process.exitCode = code;
  });
}
