import path from 'node:path';
import os from 'node:os';
import { constants } from 'node:fs';
import { access, realpath, stat, readFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

export const MAX_PROMPT = 64 * 1024;
const MAX_OUTPUT = 512 * 1024;
export class InputError extends Error {}
export const fail = message => { throw new InputError(message); };
export const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value);
export const MODEL_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;
export const isAuto = value => typeof value === 'string' && /^auto$/i.test(value);
export const isFast = value => typeof value === 'string' && /-fast$/i.test(value);
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
export const stripEmails = value => String(value).replace(EMAIL, '[redacted]');

export function parseArgs(argv) {
  const [command = 'setup', ...args] = argv;
  const commands = ['setup', 'models', 'review', 'task', 'status', 'result', 'cancel'];
  if (!commands.includes(command)) fail('Unknown command. Use setup, models, review, task, status, result or cancel.');
  const values = new Set(['workspace', 'model', 'wait-seconds', 'default-model']);
  const flags = new Set(['json', 'background', 'wait', 'write', 'trust-workspace', 'allow-fast', 'allow-hooks']);
  const options = {}, pos = []; let terminated = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!terminated && arg === '--') { terminated = true; continue; }
    if (terminated || !arg.startsWith('-')) { pos.push(arg); continue; }
    const match = /^--([^=]+)(?:=(.*))?$/s.exec(arg);
    if (!match || (!values.has(match[1]) && !flags.has(match[1]))) fail('Unknown option. Use -- before a prompt beginning with a dash.');
    const [, key, inline] = match;
    if (Object.hasOwn(options, key)) fail('Duplicate option.');
    if (flags.has(key)) { if (inline !== undefined) fail('Boolean flags do not take values.'); options[key] = true; }
    else {
      const value = inline ?? args[++i];
      if (!value || value.startsWith('--') || value.includes('\0')) fail('Missing or invalid option value.');
      options[key] = value;
    }
  }
  const launch = ['task', 'review'].includes(command);
  if (options.background && options.wait) fail('Choose --background or --wait.');
  if (!launch && ['background', 'wait', 'write', 'workspace', 'trust-workspace', 'allow-fast'].some(k => options[k] !== undefined)) fail('Launch options require a task command.');
  if (options['allow-hooks'] && !['setup', 'models', 'task', 'review'].includes(command)) fail('--allow-hooks is only used with setup, models, task or review.');
  if (options['default-model'] !== undefined && command !== 'setup') fail('--default-model is only used with setup.');
  if (!launch && options.model && !['setup', 'models'].includes(command)) fail('--model requires setup, models or a task command.');
  if (command === 'review' && options.write) fail('Reviews are read-only; start an explicit new task for implementation.');
  if (options['wait-seconds'] !== undefined && (command !== 'status' || !/^\d+$/.test(options['wait-seconds']) || Number(options['wait-seconds']) > 20)) fail('--wait-seconds must be an integer from 0 to 20 on status.');
  let jobId;
  if (['result', 'cancel', 'status'].includes(command)) jobId = pos.shift();
  if (jobId !== undefined && !safeId(jobId)) fail('Invalid job ID.');
  if (['result', 'cancel'].includes(command) && !jobId) fail('An explicit stored job ID is required.');
  if (!launch && pos.length) fail('Unexpected positional argument.');
  if (launch && (pos.length !== 1 || !pos[0]?.trim())) fail('Provide one quoted prompt.');
  if (options.model && !MODEL_ID.test(options.model)) fail('Use an exact model variant from models.');
  if (options['default-model'] && !MODEL_ID.test(options['default-model'])) fail('Use an exact model variant from models.');
  if (isAuto(options.model) || isAuto(options['default-model'])) fail('Auto is not an exact model. List models and choose an id.');
  if (isFast(options['default-model'])) fail('A model id ending in -fast cannot be saved as the default.');
  return { command, ...options, jobId, prompt: pos[0], waitSeconds: Number(options['wait-seconds'] ?? 0) };
}

export function assertWorkspacePath(root, home, platform = process.platform) {
  const p = platform === 'win32' ? path.win32 : path.posix;
  const fold = x => ['win32', 'darwin'].includes(platform) ? x.toLowerCase() : x;
  const r = fold(p.resolve(root)), h = fold(p.resolve(home));
  const within = (a, b) => b === a || b.startsWith(a.endsWith(p.sep) ? a : a + p.sep);
  const parts = r.split(/[\\/]+/);
  if (r === fold(p.parse(r).root) || within(r, h) || parts.some(x => /^(?:personal|credentials?|\.claude|\.cursor|\.codex|\.vscode|\.antigravity|\.ssh|\.aws|\.azure|\.gnupg|\.config|\.kube|\.env(?:\..*)?)$/i.test(x)) || /(?:^|[\\/])library[\\/](?:application support|keychains)(?:[\\/]|$)/i.test(r) || /(?:^|[\\/])\.local[\\/]share[\\/]cursor-agent(?:[\\/]|$)/i.test(r) || /(?:^|[\\/])appdata(?:[\\/]|$)/i.test(r)) fail('Select a project folder, not a filesystem/home root, home ancestor, tool configuration, credential or PERSONAL directory.');
  return root;
}
export async function workspacePath(root, { home = os.homedir(), platform = process.platform } = {}) {
  let resolved, canonicalHome;
  try { resolved = await realpath(root); canonicalHome = await realpath(home); if (!(await stat(resolved)).isDirectory()) fail('Workspace must be a directory.'); }
  catch (error) { if (error instanceof InputError) throw error; fail('Workspace must be an existing directory.'); }
  assertWorkspacePath(path.resolve(root), canonicalHome, platform);
  return assertWorkspacePath(resolved, canonicalHome, platform);
}

export function promptText(options) {
  const text = options.prompt;
  if (typeof text !== 'string' || !text.trim() || text.includes('\0') || Buffer.byteLength(text) > MAX_PROMPT) fail('Prompt must be nonempty text of at most 64 KiB without NUL bytes.');
  return text;
}

async function windowsBundle(home, env) {
  // Official installer/PS1 layout, 2026.10.01-e373342. Shell shims are never executed.
  const install = path.join(env.LOCALAPPDATA ?? path.join(home, 'AppData/Local'), 'cursor-agent');
  try {
    const canonical = await realpath(install);
    let dir = canonical;
    try { await lstat(path.join(dir, 'node.exe')); }
    catch {
      const versions = path.join(canonical, 'versions');
      const names = (await readdir(versions, { withFileTypes: true }))
        .filter(e => e.isDirectory() && /^\d{4}\.\d{1,2}\.\d{1,2}(-\d{2}-\d{2}-\d{2})?-[a-f0-9]+$/.test(e.name)).map(e => e.name);
      const versionKey = name => name.split('-').slice(0, -1).join('-').replace(/\d+/g, x => x.padStart(4, '0'));
      names.sort((a, b) => versionKey(b).localeCompare(versionKey(a)));
      if (!names.length) throw new Error('missing version');
      dir = path.join(versions, names[0]);
    }
    const executable = path.join(dir, 'node.exe'), entrypoint = path.join(dir, 'index.js');
    for (const file of [executable, entrypoint]) {
      const info = await lstat(file);
      if (!info.isFile() || info.isSymbolicLink() || info.size === 0) throw new Error('incomplete pair');
    }
    return { executable: await realpath(executable), prefixArgs: [await realpath(entrypoint)], entrypoint: await realpath(entrypoint) };
  } catch {
    fail('Official Cursor CLI Windows bundle is missing or incomplete. Repair/install it yourself using https://cursor.com/docs/cli/installation. The launcher requires matching vendor node.exe and index.js; it never executes .cmd or .ps1 shims.');
  }
}

export function commandParts(cli, args, platform = process.platform) {
  const executable = typeof cli === 'string' ? cli : cli.executable;
  const combined = [...(typeof cli === 'string' ? [] : cli.prefixArgs ?? []), ...args];
  if (platform === 'win32' && [executable, ...combined].reduce((n, x) => n + x.length * 2 + 3, 0) > 30000) fail('Command length is too large for Windows; shorten the prompt.');
  return { executable, args: combined, shell: false };
}

export async function discoverCli({ home = os.homedir(), env = process.env, platform = process.platform } = {}) {
  if (platform === 'win32') return windowsBundle(home, env);
  const dirs = [...(env.PATH ?? '').split(platform === 'win32' ? ';' : path.delimiter).filter(x => x && path.isAbsolute(x)), path.join(home, '.local/bin')];
  const names = platform === 'win32' ? ['cursor-agent.exe', 'agent.exe'] : ['cursor-agent', 'agent'];
  for (const name of names) for (const dir of dirs) {
    const candidate = path.join(dir, name);
    try {
      const resolved = await realpath(candidate), base = path.basename(resolved).toLowerCase();
      if (platform === 'win32' && !resolved.toLowerCase().endsWith('.exe')) continue;
      if (!(await stat(resolved)).isFile()) continue;
      await access(resolved, platform === 'win32' ? constants.F_OK : constants.X_OK);
      if (base === 'cursor-agent' || base === 'cursor-agent.exe') return resolved;
      // The vendor installs agent as an alias/copy of cursor-agent. Never run an unrelated `agent`.
      const vendor = await realpath(path.join(dir, names[0]));
      const digest = async f => createHash('sha256').update(await readFile(f)).digest('hex');
      if (resolved === vendor || await digest(resolved) === await digest(vendor)) return vendor;
    } catch { /* next installed candidate */ }
  }
  fail('Official Cursor CLI not found. Install it yourself using https://cursor.com/docs/cli/installation, then rerun setup. Windows requires the native vendor .exe, not a .cmd or .ps1 shim.');
}

export function launchArgs(job, platform = process.platform) {
  // --sandbox is a global flag (enabled or disabled) in the parameters reference and in this CLI's help. No platform exception is documented.
  const args = ['--print', '--output-format', 'stream-json', '--sandbox', 'enabled', '--workspace', job.workspace, '--model', job.requestedModel];
  if (job.trustWorkspace) args.push('--trust');
  if (job.mode === 'ask') args.push('--mode', 'ask');
  else if (job.mode !== 'write') fail('Invalid execution mode.');
  args.push('--', job.prompt);
  // Conservative bound includes worst-case quoting expansion; no undocumented stdin transport.
  if (platform === 'win32' && args.reduce((n, x) => n + x.length * 2 + 3, 2048) > 30000) fail('Prompt/argument length is too large for Windows. Shorten the prompt or reference project files.');
  return args;
}
export function cleanText(text) {
  return String(text).replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '')
    .replace(/\b(Bearer\s+)[\w.+/=-]+/gi, '$1[REDACTED]')
    .replace(/((?:[\w-]*(?:api[_-]?key|token|secret|password|authorization)[\w-]*)["']?\s*[:=]\s*["']?)([^\s,"'}]+)/gi, '$1[REDACTED]')
    .replace(/\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9]{16,})\b/g, '[REDACTED]');
}
export function parseModels(text) {
  return cleanText(text).split(/\r?\n/).flatMap(line => {
    const match = /^([a-zA-Z0-9][\w.-]*)\s+-\s+(.+?)\s*$/.exec(line);
    if (!match) return [];
    const name = match[2].replace(/\s+\((?:current|default|current, default)\)$/, '');
    return [{ id: stripEmails(match[1]), name: stripEmails(name) }];
  });
}
export function parseAuth(text) {
  let auth; try { auth = JSON.parse(text); } catch { fail('Cursor authentication status was not valid JSON.'); }
  const result = { authenticated: auth?.status === 'authenticated' && auth?.isAuthenticated === true };
  // Team name only. Never copy email, personal names, ids, or token presence.
  const team = auth?.userInfo?.teamName;
  if (typeof team === 'string' && team.trim()) result.team = stripEmails(cleanText(team)).slice(0, 256);
  return result;
}
export function parseAbout(text) {
  let about; try { about = JSON.parse(text); } catch { return {}; }
  const plan = about?.subscriptionTier ?? about?.plan;
  return typeof plan === 'string' && plan.trim() ? { plan: stripEmails(cleanText(plan)).slice(0, 256) } : {};
}
export function publicAuth(auth) {
  return {
    authenticated: auth?.authenticated === true,
    team: typeof auth?.team === 'string' ? stripEmails(auth.team) : null,
    plan: typeof auth?.plan === 'string' ? stripEmails(auth.plan) : null,
  };
}
export function capture(executable, args, { cwd, env = process.env, timeout = 20000 } = {}) {
  return new Promise(resolve => {
    let stdout = '', stderr = '', exceeded = false, timedOut = false, spawnError = false;
    const child = spawn(executable, args, { cwd, env, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); child.stdout?.destroy(); child.stderr?.destroy(); }, timeout);
    for (const [pipe, isErr] of [[child.stdout, false], [child.stderr, true]]) {
      pipe?.setEncoding('utf8'); pipe?.on('data', text => {
        if ((isErr ? stderr : stdout).length + text.length > MAX_OUTPUT) { exceeded = true; child.kill('SIGKILL'); child.stdout?.destroy(); child.stderr?.destroy(); return; }
        if (isErr) stderr += text; else stdout += text;
      });
    }
    child.on('error', () => { spawnError = true; });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr: cleanText(stderr), exceeded, timedOut, spawnError }); });
  });
}

// A context-size token such as 256K or 1M is not a different model. Family, version and level stay in the key.
const modelKey = value => String(value).toLowerCase().replace(/\b\d+[km]\b/g, '').replace(/[^a-z0-9]/g, '');
export const ELEVATED_REFUSALS = {
  write: "Changing files needs the person's approval and runs through scripts/cursor-elevated.mjs.",
  'trust-workspace': "Trusting a folder needs the person's approval and runs through scripts/cursor-elevated.mjs.",
  'allow-fast': "A fast model needs the person's approval and runs through scripts/cursor-elevated.mjs.",
  workspace: "Another folder needs the person's approval and runs through scripts/cursor-elevated.mjs.",
  'allow-hooks': "Running in a folder with its own Cursor hooks needs the person's approval and runs through scripts/cursor-elevated.mjs.",
};
export function firstElevatedFlag(argv) {
  for (const arg of argv) {
    if (arg === '--') break;
    if (!arg.startsWith('--')) continue;
    const key = /^--([^=]+)/.exec(arg)?.[1];
    if (key && Object.hasOwn(ELEVATED_REFUSALS, key)) return key;
  }
  return null;
}
export class StreamResult {
  constructor({ expectedSession, requestedModel, expectedModel } = {}) {
    this.expectedSession = expectedSession; this.requestedModel = requestedModel; this.expectedModel = expectedModel;
    this.buffer = ''; this.partial = ''; this.problem = null; this.terminal = null; this.sessionId = null; this.reportedModel = null; this.dropping = false;
  }
  push(chunk) {
    this.buffer += chunk;
    let index;
    while ((index = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, index); this.buffer = this.buffer.slice(index + 1);
      if (!this.dropping) this.line(line); this.dropping = false;
    }
    if (this.buffer.length > MAX_OUTPUT * 2) { this.problem = 'Stream line exceeded the output limit.'; this.buffer = ''; this.dropping = true; }
  }
  line(line) {
    if (!line.trim()) return;
    if (line.length > MAX_OUTPUT * 2) { this.problem = 'Stream line exceeded the output limit.'; return; }
    let event; try { event = JSON.parse(line); } catch { this.problem = 'Malformed CLI stream.'; return; }
    // Do not inspect, persist or render thinking, tool payloads, user echoes or unknown events.
    if (!event || !['system', 'assistant', 'result'].includes(event.type)) return;
    if (event.type === 'system' && event.subtype === 'init') {
      if (this.sessionId || !safeId(event.session_id) || typeof event.model !== 'string') { this.problem = 'Invalid or repeated session initialization.'; return; }
      this.sessionId = event.session_id;
      const label = cleanText(event.model);
      const comparable = label.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '');
      this.reportedModel = stripEmails(label).slice(0, 256);
      if (this.expectedSession && this.expectedSession !== this.sessionId) this.problem = 'Resumed session did not match the stored session.';
      if (![this.expectedModel, this.requestedModel].filter(Boolean).some(x => modelKey(x) === modelKey(comparable))) this.problem = 'CLI reported a different model; serving remains unverified.';
    } else if (event.type === 'assistant') {
      if (event.session_id !== this.sessionId) { this.problem = 'Assistant session mismatch.'; return; }
      for (const item of Array.isArray(event.message?.content) ? event.message.content : []) if (item.type === 'text' && typeof item.text === 'string') this.partial = (this.partial + item.text).slice(0, MAX_OUTPUT);
    } else if (event.type === 'result') {
      if (this.terminal || !this.sessionId || event.session_id !== this.sessionId || typeof event.result !== 'string' || typeof event.is_error !== 'boolean' || typeof event.subtype !== 'string') { this.problem = 'Invalid terminal result or session mismatch.'; return; }
      const errorTagged = event.is_error || event.subtype !== 'success';
      if (!errorTagged && event.result.length > MAX_OUTPUT) this.problem = 'Result exceeded the output limit; completion is uncertain.';
      this.terminal = { isError: event.is_error, subtype: event.subtype };
      if (!errorTagged) this.terminal.output = cleanText(event.result.slice(0, MAX_OUTPUT));
      if (safeId(event.request_id)) this.terminal.requestId = event.request_id;
    }
  }
  finish(code) {
    if (this.buffer) { this.line(this.buffer); this.buffer = ''; }
    const fields = { servingVerified: false };
    if (this.sessionId) fields.sessionId = this.sessionId;
    if (this.reportedModel) fields.reportedModel = this.reportedModel;
    if (this.terminal) { if (typeof this.terminal.output === 'string') fields.output = this.terminal.output; if (this.terminal.requestId) fields.requestId = this.terminal.requestId; }
    else if (this.partial) { fields.output = cleanText(this.partial); fields.partialOutput = true; }
    if (this.problem) return { ...fields, status: 'uncertain', error: this.problem };
    if (code !== 0 || this.terminal?.isError || (this.terminal && this.terminal.subtype !== 'success')) {
      // A run that ended with a result but failed keeps no result text. Partial text of a run without a result stays.
      if (this.terminal) delete fields.output;
      return { ...fields, status: 'failed', error: 'Cursor CLI did not complete successfully.' };
    }
    if (!this.terminal) return { ...fields, status: 'uncertain', error: 'CLI exited without a valid terminal result; do not retry automatically.' };
    return { ...fields, status: 'completed' };
  }
}
