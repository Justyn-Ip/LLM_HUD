import { cpSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const destination = join(homedir(), ".config", "opencode", "plugins", "opencode-hud")
mkdirSync(destination, { recursive: true })

for (const file of ["index.ts", "tui.tsx", "quota.ts", "package.json"]) {
  cpSync(new URL(file, import.meta.url), join(destination, file))
}

console.log(`opencode-hud synced to ${destination}`)
