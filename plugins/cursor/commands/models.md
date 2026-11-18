---
description: List models available through the member’s Cursor CLI
argument-hint: "[--json] [--allow-hooks]"
disable-model-invocation: true
allowed-tools: 'Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" *)'
---

If the user's own command contains `--allow-hooks`, run `node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-elevated.mjs" models --allow-hooks`. Otherwise run `node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" models`. Pass `--json` only when the user typed it. Never add an option the user did not type. When a script refuses, repeat its sentence and stop.

This command pre-approves only Node running this plugin's `cursor-companion.mjs` script. It does not pre-approve any other Node program.

Then print the id list unchanged unless the user asked for a summary. Show the signed-in team and plan, and do not show an email address. Model listing does not select a model or prove serving identity. If the exact requested variant is unavailable, report that result; do not substitute Auto or a similar model. Do not run login, update or install commands.
