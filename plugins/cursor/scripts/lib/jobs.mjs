import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { constants, writeSync } from 'node:fs';
import { mkdir, lstat, open, rename, readdir, chmod } from 'node:fs/promises';
import { spawn, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { InputError, fail, safeId, MODEL_ID, isAuto, isFast, parseArgs, workspacePath, promptText, discoverCli, launchArgs, commandParts, capture, parseModels, parseAuth, parseAbout, publicAuth, stripEmails, StreamResult } from './cli.mjs';

const WORKER = fileURLToPath(new URL('../worker.mjs', import.meta.url));
const ACTIVE = new Set(['queued', 'running', 'cancelling']);
const FOREIGN = 'That job belongs to another workspace.';
const NO_MODEL = 'No model was selected. Pass --model <id>, or save one with setup --default-model <id>. List models with the models command.';
const FAST_RUN = 'A model id ending in -fast needs --allow-fast on this run.';
const TRUST_MESSAGE = 'Cursor will not run until you trust this folder. Repeat the command with --trust-workspace. The Cursor CLI remembers that trust for the folder.';
export const HOOKS_REFUSAL = "This folder has its own Cursor hooks (.cursor/hooks.json), which can run programs. Repeat the command with --allow-hooks. Claude Code then asks for the person's approval.";
export function stateDirectory(home) {
  return path.join(home, '.claude', 'cursor-companion');
}
const delay = ms => new Promise(r => setTimeout(r, ms));
const now = () => new Date().toISOString();
const fresh = state => Date.now() - Date.parse(state.heartbeatAt ?? state.createdAt) < 15000;

async function projectHooks(folder) {
  try {
    await lstat(path.join(folder, '.cursor', 'hooks.json'));
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return false;
    fail(HOOKS_REFUSAL);
  }
}
async function guardHooks(folder, options, elevated) {
  if (elevated && options['allow-hooks'] === true) return;
  if (await projectHooks(folder)) fail(HOOKS_REFUSAL);
}

async function directory(dir) {
  try { await mkdir(dir, { mode: 0o700 }); } catch (e) { if (e.code !== 'EEXIST') throw e; }
  const info = await lstat(dir);
  if (!info.isDirectory() || info.isSymbolicLink() || (process.getuid && info.uid !== process.getuid())) fail('Job state must use owned directories, not symlinks.');
}
async function readJson(file) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const parent = await lstat(path.dirname(file));
    if (!parent.isDirectory() || parent.isSymbolicLink() || (process.getuid && parent.uid !== process.getuid())) fail('Invalid job directory.');
    const fd = await open(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
    try {
      const info = await fd.stat();
      if (!info.isFile() || info.size > 2 * 1024 * 1024) fail('Invalid job state file.');
      if (info.nlink === 0 && attempt < 2) continue; // Atomic replacement unlinked this open inode; close before reopening.
      if (info.nlink !== 1) fail('Invalid job state file.');
      const buf = Buffer.alloc(2 * 1024 * 1024 + 1), { bytesRead } = await fd.read(buf, 0, buf.length, 0);
      if (bytesRead > 2 * 1024 * 1024) fail('Job state is too large.');
      return JSON.parse(buf.subarray(0, bytesRead).toString('utf8'));
    } finally { await fd.close(); }
  }
}
async function atomicJson(file, data) {
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data, null, 2) + '\n');
  const temp = `${file}.${randomUUID()}.tmp`;
  const fd = await open(temp, 'wx', 0o600);
  try { await fd.writeFile(bytes); await fd.sync(); } finally { await fd.close(); }
  await rename(temp, file);
}
export class JobStore {
  constructor(root) { this.root = root; }
  async init() {
    await directory(path.dirname(this.root)); await directory(this.root);
    await chmod(this.root, 0o700).catch(() => {});
    await directory(path.join(this.root, 'jobs'));
  }
  jobDir(id) { if (!safeId(id)) fail('Invalid job ID.'); return path.join(this.root, 'jobs', id); }
  async checkJob(id) {
    const dir = this.jobDir(id), info = await lstat(dir);
    if (!info.isDirectory() || info.isSymbolicLink()) fail('Invalid job directory.');
    return dir;
  }
  async create(request) {
    await directory(this.jobDir(request.jobId));
    await atomicJson(path.join(this.jobDir(request.jobId), 'request.json'), request);
    await this.save({ jobId: request.jobId, status: 'queued', requestedModel: request.requestedModel, servingVerified: false,
      workspace: request.workspace, mode: request.mode, command: request.command, sandbox: request.sandbox ?? 'enabled', createdAt: now(), heartbeatAt: now() });
  }
  async save(state) {
    const id = state.jobId, bytes = Buffer.from(JSON.stringify(state, null, 2) + '\n');
    for (let attempt = 0; attempt < 3; attempt++) {
      try { await atomicJson(path.join(await this.checkJob(id), 'state.json'), bytes); return; }
      catch (error) {
        if (process.platform !== 'win32' || error?.code !== 'EPERM' || attempt === 2) throw error;
        await delay(20 * (attempt + 1));
      }
    }
  }
  async read(id, name = 'state.json') {
    try {
      const result = await readJson(path.join(await this.checkJob(id), name));
      if (result.jobId !== id) fail('Stored job identity mismatch.');
      return result;
    } catch (e) { if (e instanceof InputError) throw e; fail('Job does not exist or its state is unreadable.'); }
  }
  async cancel(id) { await atomicJson(path.join(await this.checkJob(id), 'cancel.json'), { jobId: id, requestedAt: now() }); }
  async cancelled(id) {
    try { return (await readJson(path.join(await this.checkJob(id), 'cancel.json'))).jobId === id; }
    catch (e) { if (e.code === 'ENOENT') return false; throw e; }
  }
  async list() {
    try { return (await readdir(path.join(this.root, 'jobs'))).filter(safeId); }
    catch (e) { if (e.code === 'ENOENT') return []; throw e; }
  }
  settingsFile() { return path.join(this.root, 'settings.json'); }
  async readSettings() {
    try { return await readJson(this.settingsFile()); }
    catch (error) { if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return null; throw error; }
  }
  async writeSettings(data) { await atomicJson(this.settingsFile(), data); }
}

function execText(exe, args) {
  return new Promise(resolve => execFile(exe, args, { shell: false, windowsHide: true, timeout: 3000, maxBuffer: 8192 }, (error, stdout) => resolve(error ? null : stdout.trim())));
}
export async function processIdentity(pid, platform = process.platform) {
  if (!Number.isInteger(pid) || pid <= 1) return null;
  if (platform === 'win32') {
    const exe = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe');
    return execText(exe, ['-NoProfile', '-NonInteractive', '-Command', `(Get-Process -Id ${pid} -ErrorAction Stop).StartTime.ToUniversalTime().Ticks`]);
  }
  return execText('/bin/ps', ['-p', String(pid), '-o', 'lstart=']);
}
export async function sameProcess(pid, identity, platform = process.platform) {
  return !!identity && await processIdentity(pid, platform) === identity;
}
function groupAlive(pid) { try { process.kill(-pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } }

// Only the worker with the live ChildProcess object can cancel. The public CLI never kills a PID from disk.
async function stopChild(child, identity) {
  if (child.exitCode !== null || child.signalCode !== null || !await sameProcess(child.pid, identity)) return false;
  if (process.platform === 'win32') {
    const exe = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/taskkill.exe');
    const result = await execText(exe, ['/PID', String(child.pid), '/T', '/F']);
    return result !== null;
  }
  try { process.kill(-child.pid, 'SIGTERM'); } catch { return false; }
  for (let n = 0; n < 20; n++) { if (!groupAlive(child.pid)) return true; await delay(50); }
  // If the group leader vanished but descendants remain, ownership of a new leader is not inferred.
  if (await sameProcess(child.pid, identity)) {
    try { process.kill(-child.pid, 'SIGKILL'); } catch { return false; }
    for (let n = 0; n < 20; n++) { if (!groupAlive(child.pid)) return true; await delay(50); }
  }
  return false;
}

export function createService({ home = os.homedir(), cwd = process.cwd(), env = process.env, platform = process.platform, cli } = {}) {
  // Constructor injection is for offline tests. No CLI flag or environment value can redirect the executable or this state directory.
  const store = new JobStore(stateDirectory(home));
  async function savedModel() {
    const data = await store.readSettings();
    const id = data?.defaultModel;
    if (typeof id !== 'string' || !id.trim()) return null;
    if (isAuto(id) || isFast(id) || !MODEL_ID.test(id)) fail('The saved default model is not allowed. Save an exact non-fast model with setup --default-model.');
    return id;
  }
  async function preflight(requestedModel, probeCwd = cwd) {
    const base = { jobId: null, status: 'not-ready', requestedModel: requestedModel ?? null, servingVerified: false, ready: false, nodeVersion: process.versions.node, defaultModelAvailable: false, sandbox: 'enabled' };
    let executable;
    try { executable = cli ?? await discoverCli({ home, env, platform }); }
    catch (e) { return { ...base, error: e instanceof InputError ? e.message : 'Cannot locate official Cursor CLI.' }; }
    const run = args => { const call = commandParts(executable, args, platform); return capture(call.executable, call.args, { cwd: probeCwd, env }); };
    const version = await run(['--version']);
    if (version.code !== 0 || version.timedOut || version.exceeded || version.spawnError || !/^\d{4}\.\d{2}\.\d{2}-[\w.-]+$/.test(version.stdout.trim())) return { ...base, error: 'Cursor CLI version check failed; repair the official installation.' };
    base.cli = { ...(typeof executable === 'string' ? { executable, prefixArgs: [] } : executable), version: version.stdout.trim() };
    const status = await run(['status', '--format', 'json']);
    let auth;
    try { auth = parseAuth(status.stdout); } catch { auth = { authenticated: false }; }
    if (status.code !== 0 || status.timedOut || status.exceeded || !auth.authenticated) return { ...base, auth: publicAuth(auth), error: 'Cursor CLI sign-in is required. Run cursor-agent login yourself, then rerun setup.' };
    const about = await run(['about', '--format', 'json']);
    if (about.code === 0 && !about.timedOut && !about.exceeded && !about.spawnError) auth = { ...auth, ...parseAbout(about.stdout) };
    base.auth = publicAuth(auth);
    const result = await run(['models']);
    if (result.code !== 0 || result.timedOut || result.exceeded) return { ...base, error: 'Cursor model catalog could not be checked. No model fallback was selected.' };
    base.models = parseModels(result.stdout);
    try { base.savedDefaultModel = await savedModel(); }
    catch (error) { return { ...base, error: error instanceof InputError ? error.message : 'Saved model settings are unreadable.' }; }
    base.defaultModelAvailable = !!base.savedDefaultModel && base.models.some(x => x.id === base.savedDefaultModel);
    if (!requestedModel) return { ...base, ready: true, status: 'ready' };
    if (isAuto(requestedModel)) return { ...base, error: 'Auto is not an exact model. List models and choose an id.' };
    const model = base.models.find(x => x.id === requestedModel);
    if (!model) return { ...base, error: 'Requested exact model is unavailable. Use models to inspect this account; no fallback was selected.' };
    return { ...base, ready: true, status: 'ready', selectedModel: model };
  }
  async function currentWorkspace(explicit) { return workspacePath(explicit ?? cwd, { home, platform }); }
  async function owned(id, workspace) {
    const state = await status(id);
    if (state.workspace !== workspace) fail(FOREIGN);
    return state;
  }
  async function listOwned(workspace) {
    const jobs = []; let unreadableJobs = 0;
    for (const id of await store.list()) {
      try {
        const state = await status(id);
        if (state.workspace === workspace) jobs.push(state);
      } catch { unreadableJobs++; }
    }
    jobs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return { jobs, unreadableJobs };
  }
  async function status(id) {
    const state = await store.read(id);
    delete state.stderr;
    delete state.stderrTruncated;
    if (typeof state.reportedModel === 'string') state.reportedModel = stripEmails(state.reportedModel);
    if (ACTIVE.has(state.status) && !fresh(state)) return { ...state, status: 'uncertain', error: 'Worker heartbeat is stale. Completion and cancellation are unconfirmed; do not retry automatically.' };
    return state;
  }
  async function wait(id, seconds) {
    const end = seconds === undefined ? Infinity : Date.now() + seconds * 1000;
    for (;;) {
      const state = await status(id);
      if (!ACTIVE.has(state.status) || Date.now() >= end) return state;
      await delay(100);
    }
  }
  async function execute(argv, { elevated = false } = {}) {
    const options = parseArgs(argv);
    if (options.command === 'models') {
      await guardHooks(cwd, options, elevated);
      return preflight(options.model, cwd);
    }
    if (options.command === 'setup') {
      await guardHooks(cwd, options, elevated);
      const view = await preflight(null, cwd);
      if (!view.ready) return view;
      if (options['default-model']) {
        const checked = await preflight(options['default-model'], cwd);
        if (!checked.ready) return checked;
        await store.init();
        await store.writeSettings({ defaultModel: options['default-model'] });
        return { ...checked, savedDefaultModel: options['default-model'], defaultModelAvailable: true };
      }
      if (view.savedDefaultModel && !view.defaultModelAvailable) return { ...view, ready: false, status: 'not-ready', error: 'Saved default model is unavailable. Use models, then setup --default-model <id>.' };
      return view;
    }
    if (['status', 'result', 'cancel'].includes(options.command)) {
      const workspace = await currentWorkspace();
      if (!options.jobId) {
        const end = Date.now() + options.waitSeconds * 1000;
        for (;;) {
          const listed = await listOwned(workspace), jobs = listed.jobs.slice(0, 20);
          if (!jobs.some(j => ACTIVE.has(j.status)) || Date.now() >= end) return { jobId: null, status: 'listed', requestedModel: null, servingVerified: false, jobs, totalJobs: listed.jobs.length, unreadableJobs: listed.unreadableJobs, listTruncated: listed.jobs.length > 20 };
          await delay(100);
        }
      }
      const state = await owned(options.jobId, workspace);
      if (options.command === 'cancel') {
        if (!ACTIVE.has(state.status)) return state;
        await store.cancel(options.jobId);
        const result = await wait(options.jobId, 5);
        return ACTIVE.has(result.status) ? { ...result, cancellationRequested: true, cancellationConfirmed: false } : result;
      }
      return options.command === 'status' ? wait(options.jobId, options.waitSeconds) : state;
    }
    const workspace = await currentWorkspace(options.workspace);
    await guardHooks(workspace, options, elevated);
    const prompt = promptText(options);
    const requestedModel = options.model ?? await savedModel();
    if (!requestedModel) fail(NO_MODEL);
    if (isAuto(requestedModel)) fail('Auto is not an exact model. List models and choose an id.');
    if (isFast(requestedModel) && !options['allow-fast']) fail(FAST_RUN);
    const ready = await preflight(requestedModel, workspace);
    if (!ready.ready) fail(ready.error);
    const request = { jobId: `${Date.now()}-${randomUUID()}`, command: options.command, prompt, workspace, home, requestedModel,
      expectedModel: ready.selectedModel.name, cli: ready.cli, mode: options.write ? 'write' : 'ask', trustWorkspace: options['trust-workspace'] === true,
      allowHooks: options['allow-hooks'] === true, sandbox: 'enabled' };
    commandParts(request.cli, launchArgs(request, platform), platform); // Reject invalid/overlong Windows args before creating a job.
    await store.init();
    await store.create(request);
    const child = spawn(process.execPath, [WORKER, store.root, request.jobId], { cwd: workspace, env, shell: false, detached: true, windowsHide: true, stdio: 'ignore' });
    await new Promise(resolve => {
      child.once('spawn', resolve);
      child.once('error', async () => {
        await store.save({ ...await store.read(request.jobId), status: 'failed', error: 'Could not launch the job worker.', endedAt: now() });
        resolve();
      });
    });
    child.unref();
    if (!options.background && !options.json) writeSync(1, `Job ${request.jobId}\n`);
    return options.background ? status(request.jobId) : wait(request.jobId);
  }
  return { execute, store };
}

export async function runWorker(root, id) {
  const store = new JobStore(root);
  let state = await store.read(id), request = await store.read(id, 'request.json');
  // An exclusive claim prevents a second worker invocation from launching the same request twice.
  const claim = await open(path.join(await store.checkJob(id), 'worker.claim'), 'wx', 0o600);
  await claim.close();
  let timer, controlBusy = false, child, childIdentity, cancelAttempted = false, cancellationConfirmed = false, cancelPromise;
  let writes = Promise.resolve();
  const save = () => {
    delete state.stderr;
    delete state.stderrTruncated;
    const snapshot = { ...state };
    const operation = writes.then(() => store.save(snapshot));
    writes = operation.catch(() => {}); // Recover only the serialization tail; the caller still sees this save's rejection.
    return operation;
  };
  try {
    if (state.status !== 'queued') fail('Worker refuses an already started job.');
    if (await workspacePath(request.workspace, { home: request.home }) !== request.workspace) fail('Stored workspace changed before launch.');
    state = { ...state, status: 'running', workerPid: process.pid, heartbeatAt: now() }; await save();
    if (await store.cancelled(id)) { state = { ...state, status: 'cancelled', cancellationConfirmed: true, endedAt: now() }; await save(); return; }
    if (await projectHooks(request.workspace) && request.allowHooks !== true) {
      state = { ...state, status: 'failed', error: HOOKS_REFUSAL, endedAt: now(), heartbeatAt: now() };
      await save();
      return;
    }
    const parser = new StreamResult({ requestedModel: request.requestedModel, expectedModel: request.expectedModel });
    const call = commandParts(request.cli, launchArgs(request));
    child = spawn(call.executable, call.args, { cwd: request.workspace, env: process.env, shell: false, detached: process.platform !== 'win32', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let spawnError = false, stderr = '', stdoutProbe = '', pipesTimedOut = false, pipeTimer;
    const closed = new Promise(resolve => {
      child.once('error', () => { spawnError = true; });
      child.once('exit', () => { pipeTimer = setTimeout(() => { pipesTimedOut = true; child.stdout?.destroy(); child.stderr?.destroy(); }, 2000); });
      child.once('close', (code, signal) => { clearTimeout(pipeTimer); resolve({ code, signal }); });
    });
    child.stdout.setEncoding('utf8'); child.stdout.on('data', text => { if (stdoutProbe.length < 8192) stdoutProbe += text.slice(0, 8192 - stdoutProbe.length); parser.push(text); });
    child.stderr.setEncoding('utf8'); child.stderr.on('data', text => {
      // Keep a bounded copy in memory for the trust check. Never store or print it.
      stderr = (stderr + text).slice(0, 32768);
    });
    childIdentity = await processIdentity(child.pid);
    state.childPid = child.pid; state.childIdentity = childIdentity; await save();
    timer = setInterval(async () => {
      if (controlBusy) return;
      controlBusy = true;
      try {
        state.heartbeatAt = now();
        if (parser.sessionId) state.sessionId = parser.sessionId;
        if (parser.reportedModel) state.reportedModel = parser.reportedModel;
        if (!cancelAttempted && await store.cancelled(id)) {
          cancelAttempted = true; state.status = 'cancelling';
          cancelPromise = stopChild(child, childIdentity).then(confirmed => { cancellationConfirmed = confirmed; });
        }
        await save();
      } catch { /* A stale heartbeat makes storage/control failures visible as uncertain. */ }
      finally { controlBusy = false; }
    }, 300);
    const { code, signal } = await closed;
    clearInterval(timer);
    while (controlBusy) await delay(10);
    if (cancelPromise) await cancelPromise;
    const result = parser.finish(code);
    state = { ...state, ...result, exitCode: code, signal, endedAt: now(), heartbeatAt: now() };
    if (spawnError) state = { ...state, status: 'failed', error: 'Cursor CLI could not be started.' };
    if (pipesTimedOut) state = { ...state, status: 'uncertain', error: 'CLI exited with open output pipes; child completion is uncertain.' };
    if (cancelAttempted) state = { ...state, status: cancellationConfirmed ? 'cancelled' : 'uncertain', cancellationConfirmed,
      error: cancellationConfirmed ? 'Job child process was cancelled; any previous changes remain.' : 'Cancellation could not be confirmed. Inspect the job before retrying.' };
    // Cursor refuses an untrusted folder before any stream event. An answer that quotes the phrase is not a refusal.
    if (!parser.sessionId && /workspace trust required/i.test(`${stderr}\n${stdoutProbe}`)) {
      state = { ...state, status: 'failed', error: TRUST_MESSAGE };
      if (typeof state.output === 'string' && /workspace trust required|--yolo/i.test(state.output)) delete state.output;
    }
    await save();
  } catch (e) {
    clearInterval(timer);
    // Never print raw subprocess exceptions: they may contain argv, environment or provider credentials.
    state = { ...state, status: child ? 'uncertain' : 'failed', error: e instanceof InputError ? e.message : 'Job worker failed; completion is unconfirmed.', endedAt: now() };
    await save();
  } finally {
    clearInterval(timer);
  }
}
