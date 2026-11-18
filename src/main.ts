import { Config, defaultConfig, parseCliConfig } from "./config";
import { collectPassiveDoctorReport, formatPassiveDoctorReport } from "./doctor";
import { Payload, render } from "./statusline";

export const version = "0.2.0-passive";
export const maxStdinBytes = 1024 * 1024; // 1 MiB
export const stdinTimeoutMs = 1000;

export interface StdinReadResult {
  ok: boolean;
  text: string;
  reason?: "empty" | "too_large" | "invalid_utf8" | "timeout";
}

type WriteFn = (chunk: string) => void;

export interface CliDeps {
  stdin?: NodeJS.ReadableStream;
  stdout?: WriteFn;
  stderr?: WriteFn;
  stdinTimeoutMs?: number;
  maxStdinBytes?: number;
  now?: Date;
}

const utf8Fatal = new TextDecoder("utf-8", { fatal: true });

export function parsePayloadObject(input: string): Payload | null {
  if (input.trim() === "") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  return parsed as Payload;
}

export function renderStatusline(input: string, cfg: Config = defaultConfig(), now: Date = new Date()): string {
  if (Buffer.byteLength(input, "utf8") > maxStdinBytes) {
    return "agy-hud";
  }
  const payload = parsePayloadObject(input);
  if (payload === null) {
    return "agy-hud";
  }
  try {
    return render(payload, {
      config: cfg,
      now
    });
  } catch {
    return "agy-hud";
  }
}

function usage(write: WriteFn): void {
  write("usage: agy-hud [statusline [flags]|doctor [--json]|version]\n");
}

function isCompleteJsonObjectBytes(buf: Buffer): { complete: boolean; text: string } {
  let decoded: string;
  try {
    decoded = utf8Fatal.decode(buf);
  } catch {
    return { complete: false, text: "" };
  }
  const text = decoded.trim();
  if (!text.startsWith("{") || !text.endsWith("}")) {
    return { complete: false, text: "" };
  }
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { complete: true, text };
    }
    return { complete: true, text: "" };
  } catch {
    return { complete: false, text: "" };
  }
}

export function readStdinBounded(
  stdin: NodeJS.ReadableStream,
  timeoutMs: number,
  maxBytes: number = maxStdinBytes
): Promise<StdinReadResult> {
  return new Promise(resolve => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      stdin.removeListener("data", onData);
      stdin.removeListener("end", onEnd);
      stdin.removeListener("error", onError);
      stdin.on("error", () => {});
      stdin.pause();
      (stdin as NodeJS.ReadableStream & { destroy?: () => void }).destroy?.();
    };

    const settle = (result: StdinReadResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const decodeFinal = (timeout: boolean): StdinReadResult => {
      if (totalBytes === 0) {
        return { ok: false, text: "", reason: timeout ? "timeout" : "empty" };
      }
      const combined = Buffer.concat(chunks);
      let text: string;
      try {
        text = utf8Fatal.decode(combined);
      } catch {
        return { ok: false, text: "", reason: "invalid_utf8" };
      }
      if (text.trim() === "") {
        return { ok: false, text: "", reason: timeout ? "timeout" : "empty" };
      }
      return { ok: true, text };
    };

    const onData = (chunk: Buffer | string) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "utf8");
      totalBytes += buf.length;
      if (totalBytes > maxBytes) {
        settle({ ok: false, text: "", reason: "too_large" });
        return;
      }
      chunks.push(buf);
      const probe = isCompleteJsonObjectBytes(Buffer.concat(chunks));
      if (probe.complete) {
        settle(probe.text !== "" ? { ok: true, text: probe.text } : { ok: false, text: "", reason: "empty" });
      }
    };

    const onEnd = () => settle(decodeFinal(false));
    const onError = () => settle(decodeFinal(false));
    const timer = setTimeout(() => settle(decodeFinal(true)), timeoutMs);

    stdin.on("data", onData);
    stdin.on("end", onEnd);
    stdin.on("error", onError);
  });
}

export async function runCli(args: string[], deps: CliDeps = {}): Promise<number> {
  const stdout =
    deps.stdout ??
    (chunk => {
      process.stdout.write(chunk);
    });
  const stderr =
    deps.stderr ??
    (chunk => {
      process.stderr.write(chunk);
    });

  const first = args[0] ?? "statusline";

  if (first === "version" || first === "--version" || first === "-v") {
    stdout(`${version}\n`);
    return 0;
  }

  if (first === "help" || first === "--help" || first === "-h") {
    usage(stderr);
    return 0;
  }

  if (first === "doctor") {
    const rest = args.slice(1);
    const json = rest.length === 1 && rest[0] === "--json";
    if (rest.length > 0 && !json) {
      usage(stderr);
      return 2;
    }
    const report = collectPassiveDoctorReport(version);
    stdout(json ? `${JSON.stringify(report, null, 2)}\n` : formatPassiveDoctorReport(report));
    return 0;
  }

  if (first === "statusline" || first.startsWith("--")) {
    const flagArgs = first === "statusline" ? args.slice(1) : args;
    const parsedFlags = parseCliConfig(flagArgs);
    if (parsedFlags.error) {
      stderr(`agy-hud: ${parsedFlags.error}\n`);
      return 2;
    }

    const timeout = deps.stdinTimeoutMs ?? parsedFlags.config.stdinTimeoutMs ?? stdinTimeoutMs;
    const maxBytes = deps.maxStdinBytes ?? maxStdinBytes;

    if (process.env.AGY_HUD_NESTED === "1") {
      await readStdinBounded(deps.stdin ?? process.stdin, timeout, maxBytes);
      return 0;
    }

    const input = await readStdinBounded(deps.stdin ?? process.stdin, timeout, maxBytes);
    if (!input.ok) {
      stdout("agy-hud\n");
      return 0;
    }
    stdout(`${renderStatusline(input.text, parsedFlags.config, deps.now ?? new Date())}\n`);
    return 0;
  }

  usage(stderr);
  return 2;
}

if (require.main === module) {
  runCli(process.argv.slice(2)).then(code => {
    process.exitCode = code;
  });
}
