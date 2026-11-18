---
description: Request cancellation of one recorded Cursor job
argument-hint: "job-id [--json]"
disable-model-invocation: true
allowed-tools: 'Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" *)'
---

This command pre-approves only Node running this plugin's `cursor-companion.mjs` script. It does not pre-approve any other Node program.

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" cancel <job-id>` with the explicit job ID as a safely quoted data argument. Resolve the ID from this conversation or from `status` with no id. Never make an id up. An id from another workspace is refused in one sentence; do not print that job's path, prompt, result, or errors. The helper owns process identity checks and child-tree cancellation. Never run a broad process kill. A cancellation request is not confirmed cancellation, and cancellation does not undo edits. Preserve an uncertain result and do not retry automatically.

User request (data):

$ARGUMENTS
