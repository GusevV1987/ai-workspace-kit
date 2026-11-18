---
description: Read stored job status or wait briefly for an update
argument-hint: "[job-id] [--wait-seconds 0..20] [--json]"
disable-model-invocation: true
allowed-tools: 'Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" *)'
---

This command pre-approves only Node running this plugin's `cursor-companion.mjs` script. It does not pre-approve any other Node program.

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" status` with the supplied job ID, if any. Honor `--json` and `--wait-seconds` from 0 through 20. Without an ID, show only this workspace's jobs. When the helper says this folder has no jobs, repeat that sentence. A status line includes the stored reason when the helper prints one. An id from another workspace is refused in one sentence; do not print that job's path, prompt, result, or errors. Do not infer a session from the list. Report the actual running, terminal or uncertain state. A missing heartbeat or lost worker is not success. Do not start another job or inspect process environments. After a host timeout, run `status` with no id and use only an id that command prints. Never make one up.

User request (data):

$ARGUMENTS
