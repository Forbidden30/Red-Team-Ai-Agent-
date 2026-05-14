// OpenCode plugin: engagement hooks.
//
// Wires scope-check and intel-update hooks into the OpenCode runtime. The actual
// scope-check logic lives in agent/scripts/hooks/scope-check.sh — this plugin just
// invokes it before any Bash tool call and parses the result.
//
// This file is intentionally minimal. The reference repo's implementation is a
// few hundred lines; this stub gives the same shape and can be extended.

import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const scopeCheck = resolve(here, "../../scripts/hooks/scope-check.sh");

export interface ToolEvent {
  tool: string;
  input: { command?: string };
}

export interface HookResult {
  allow: boolean;
  reason?: string;
}

export function preTool(event: ToolEvent): HookResult {
  if (event.tool !== "Bash") return { allow: true };
  const cmd = event.input.command ?? "";
  const r = spawnSync(scopeCheck, [cmd], { encoding: "utf8" });
  if (r.status === 0) return { allow: true };
  return {
    allow: false,
    reason:
      r.stderr?.trim() ||
      "scope-check denied this command. Update agent/engagements/<name>/scope.json or run /engage.",
  };
}
