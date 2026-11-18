---
description: Check Node, Cursor CLI, sign-in and the default model
argument-hint: "[--allow-hooks]"
disable-model-invocation: true
allowed-tools: 'Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" *)'
---

If the user's own command contains `--allow-hooks`, run `node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-elevated.mjs" setup --allow-hooks`, adding `--default-model <id>` only when the user typed that id. Otherwise run `node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" setup`, adding `--default-model <id>` only when the user typed that id. Do not drop a typed id, and do not refuse a fast id in your own words. Never add an option the user did not type. When a script refuses, repeat its sentence and stop.

Show whether `ready` is true, the CLI executable and version, the signed-in team and plan, and whether a default model is saved. Do not show an email address. There is no built-in model. `auto` is refused. An id ending in `-fast` cannot be saved. The helper refuses that id. This command pre-approves only Node running this plugin's `cursor-companion.mjs` script. It does not pre-approve any other Node program. This is a readiness check, not a model task. Do not install dependencies, create a workspace profile, or sign in automatically.

If Node is missing, ask the member to install Node 24.21.0 or newer from https://nodejs.org/en/download and restart Claude Desktop. If Cursor CLI is missing, give the human the official installation instructions at https://cursor.com/docs/cli/installation. On native Windows the helper resolves the official bundled `node.exe` plus `index.js` and launches it directly with an argument array. It does not execute the `.cmd` or `.ps1` shim. The member does not need to find a standalone Cursor executable. If sign-in is missing, the member runs the official CLI login themselves as directed by setup. Personal and business accounts are both accepted if the selected model is available. Never switch accounts or ask for passwords or keys in chat.

When ready, return the result. There is no additional task approval page or setup question. A first successful task still needs its own result. The member manages their Cursor privacy and training settings. Normal Claude tool permissions remain in force. The saved model is stored in `~/.claude/cursor-companion/settings.json`.
