import { Plugin } from "@opencode/plugin"

/**
 * The server part exists so the package has a normal plugin entry. The HUD
 * itself lives in the TUI part and needs no server hooks.
 */
export default Plugin.define({
  id: "opencode.hud",
  setup() {},
})
