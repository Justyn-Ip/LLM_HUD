import { spawn, SpawnOptions } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ChildProcessWithoutNullStreams } from "node:child_process";

const maxFrameBytes = 1024 * 1024;
const defaultRequestTimeoutMs = 15_000;

export interface CodexLaunchSpec {
  command: string;
  args: string[];
}

export function resolveCodexLaunch(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  cwd: string = process.cwd()
): CodexLaunchSpec | null {
  const pathValue = env.PATH ?? env.Path ?? "";
  const pathEntries = pathValue.split(path.delimiter);
  const isWindows = platform === "win32";

  for (const entry of pathEntries) {
    if (entry.trim() === "" || !path.isAbsolute(entry)) continue;
    if (path.resolve(entry).toLowerCase() === path.resolve(cwd).toLowerCase()) continue;

    const candidates = isWindows ? ["codex.exe", "codex.cmd", "codex.bat"] : ["codex"];
    for (const name of candidates) {
      const candidate = path.join(entry, name);
      try {
        if (!fs.statSync(candidate).isFile()) continue;
        if (!isWindows) {
          fs.accessSync(candidate, fs.constants.X_OK);
          return { command: candidate, args: [] };
        }
        if (name === "codex.exe") return { command: candidate, args: [] };

        // npm's Windows shim launches this package entry point. Run it with Node directly.
        const packageEntry = path.join(path.dirname(candidate), "node_modules", "@openai", "codex", "bin", "codex.js");
        if (fs.statSync(packageEntry).isFile()) return { command: process.execPath, args: [packageEntry] };
      } catch {
        // Keep searching PATH entries. Do not expose paths or filesystem errors in the HUD.
      }
    }
  }
  return null;
}

interface RpcResponse {
  id?: number | string;
  result?: unknown;
  error?: unknown;
  method?: string;
}

class JsonRpcClient {
  private nextId = 1;
  private buffer = "";
  private readonly pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void; timer: NodeJS.Timeout }>();
  private closedError: Error | null = null;

  constructor(private readonly child: ChildProcessWithoutNullStreams, private readonly timeoutMs: number) {
    child.stdout.on("data", chunk => this.onData(Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk)));
    child.once("error", () => this.fail(new Error("Codex app-server failed to start")));
    child.once("exit", () => this.fail(new Error("Codex app-server stopped")));
  }

  request(method: string, params: Record<string, unknown>): Promise<unknown> {
    if (this.closedError) return Promise.reject(this.closedError);
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("Codex app-server request timed out"));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      try {
        this.child.stdin.write(`${JSON.stringify({ id, method, params })}\n`, error => {
          if (error) this.rejectOne(id, new Error("Codex app-server request failed"));
        });
      } catch {
        this.rejectOne(id, new Error("Codex app-server request failed"));
      }
    });
  }

  notify(method: string, params: Record<string, unknown>): void {
    if (this.closedError) throw this.closedError;
    this.child.stdin.write(`${JSON.stringify({ method, params })}\n`);
  }

  close(): void {
    if (!this.closedError) this.fail(new Error("Codex app-server closed"));
    this.child.kill();
  }

  private onData(chunk: string): void {
    this.buffer += chunk;
    if (Buffer.byteLength(this.buffer, "utf8") > maxFrameBytes && !this.buffer.includes("\n")) {
      this.fail(new Error("Codex app-server response was too large"));
      this.child.kill();
      return;
    }

    let newline = this.buffer.indexOf("\n");
    while (newline !== -1) {
      const line = this.buffer.slice(0, newline).trim();
      this.buffer = this.buffer.slice(newline + 1);
      if (Buffer.byteLength(line, "utf8") > maxFrameBytes) {
        this.fail(new Error("Codex app-server response was too large"));
        this.child.kill();
        return;
      }
      if (line !== "") this.onMessage(line);
      newline = this.buffer.indexOf("\n");
    }
    if (Buffer.byteLength(this.buffer, "utf8") > maxFrameBytes) {
      this.fail(new Error("Codex app-server response was too large"));
      this.child.kill();
    }
  }

  private onMessage(line: string): void {
    let message: RpcResponse;
    try {
      message = JSON.parse(line) as RpcResponse;
    } catch {
      this.fail(new Error("Codex app-server returned invalid data"));
      this.child.kill();
      return;
    }
    if (typeof message.id !== "number") return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(message.id);
    if (message.error !== undefined) pending.reject(new Error("Codex app-server request failed"));
    else pending.resolve(message.result);
  }

  private rejectOne(id: number, error: Error): void {
    const pending = this.pending.get(id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(id);
    pending.reject(error);
  }

  private fail(error: Error): void {
    if (this.closedError) return;
    this.closedError = error;
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
  }
}

export interface ReadRateLimitsOptions {
  launch?: CodexLaunchSpec | null;
  spawnServer?: typeof spawn;
  timeoutMs?: number;
}

export async function readCodexRateLimits(options: ReadRateLimitsOptions = {}): Promise<unknown> {
  const launch = options.launch === undefined ? resolveCodexLaunch() : options.launch;
  if (!launch) throw new Error("Codex CLI was not found on PATH");
  const start = options.spawnServer ?? spawn;
  const args = [...launch.args, "app-server", "--stdio"];
  const spawnOptions: SpawnOptions = {
    stdio: ["pipe", "pipe", "ignore"],
    windowsHide: true
  };
  const child = start(launch.command, args, spawnOptions) as ChildProcessWithoutNullStreams;
  const rpc = new JsonRpcClient(child, options.timeoutMs ?? defaultRequestTimeoutMs);
  try {
    await rpc.request("initialize", {
      clientInfo: { name: "codex-hud", title: "Codex HUD", version: "1.0.0" },
      capabilities: {}
    });
    rpc.notify("initialized", {});
    return await rpc.request("account/rateLimits/read", { excludeResetCreditDetails: true });
  } finally {
    rpc.close();
  }
}
