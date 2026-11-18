---
description: Retrieve the actual saved output for one Cursor job
argument-hint: "job-id [--json]"
disable-model-invocation: true
allowed-tools: 'Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" *)'
---

This command pre-approves only Node running this plugin's `cursor-companion.mjs` script. It does not pre-approve any other Node program.

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" result <job-id>` with the explicit job ID as a safely quoted data argument. If the ID cannot be resolved from this conversation, ask for it. Do not make an id up. An id from another workspace is refused in one sentence; do not print that job's path, prompt, result, or errors. Return actual output and errors for this workspace's job, retaining incomplete/uncertain status. The human result says the served model is not verified. Never include hidden reasoning or replace a failed task with Claude's own answer.

User request (data):

$ARGUMENTS
