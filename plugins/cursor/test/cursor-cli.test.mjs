import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, chmod, symlink, stat, readdir, realpath } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { parseArgs, launchArgs, workspacePath, assertWorkspacePath, parseModels, parseAuth, parseAbout, publicAuth, discoverCli, StreamResult, capture, commandParts } from '../scripts/lib/cli.mjs';
import { JobStore, createService, processIdentity, runWorker, sameProcess, stateDirectory } from '../scripts/lib/jobs.mjs';

const MODEL = 'grok-4.7-medium';
const REPORTED = 'Grok 4.7 Medium';

const fixtureSource = fileURLToPath(new URL('./cursor-cli-fixture.mjs', import.meta.url));
const delay = ms => new Promise(r => setTimeout(r, ms));
const jobDiagnostic = job => JSON.stringify({
  status: job.status,
  error: typeof job.error === 'string' ? (/CURSOR_API_KEY|Authorization|Bearer|fake-private-value/i.test(job.error) ? '[redacted]' : job.error.slice(0, 200)) : null,
  exitCode: job.exitCode ?? null, signal: job.signal ?? null,
  workerPidPresent: !!job.workerPid, childPidPresent: !!job.childPid,
  childIdentityPresent: !!job.childIdentity, endedAtPresent: !!job.endedAt,
});
async function cancelConfirmed(service, jobId) {
  let result = await service.execute(['cancel', jobId]);
  if (['queued', 'running', 'cancelling'].includes(result.status)) {
    assert.equal(result.cancellationRequested, true);
    assert.equal(result.cancellationConfirmed, false);
    result = await service.execute(['status', jobId, '--wait-seconds', '20']);
  }
  assert.equal(result.status, 'cancelled', JSON.stringify({ status: result.status, error: result.error, heartbeatAt: result.heartbeatAt }));
  assert.equal(result.cancellationConfirmed, true);
  return result;
}
async function waitForLiveChild(service, jobId) {
  const deadline = Date.now() + 20000;
  let state;
  do {
    state = await service.execute(['status', jobId]);
    if (state.status === 'running' && state.childPid && state.childIdentity) return state;
    if (!['queued', 'running'].includes(state.status)) break;
    await delay(100);
  } while (Date.now() < deadline);
  assert.equal(state.status, 'running', JSON.stringify({ status: state.status, error: state.error, heartbeatAt: state.heartbeatAt, hasChild: !!state.childPid, hasIdentity: !!state.childIdentity }));
  assert.ok(state.childPid);
  assert.ok(state.childIdentity);
  return state;
}
// Windows' default temp directory is often under AppData, which is intentionally not a workspace.
const testTempRoot = process.platform === 'win32' ? (process.env.RUNNER_TEMP || process.env.PUBLIC || os.tmpdir()) : os.tmpdir();
const symlinkDirectory = (target, link) => symlink(target, link, process.platform === 'win32' ? 'junction' : 'dir');
async function fixture(options = {}) {
  const dir = await mkdtemp(path.join(testTempRoot, 'cursor-cli-test-'));
  const home = path.join(dir, 'home'), workspace = path.join(dir, 'project with spaces');
  await mkdir(home); await mkdir(workspace);
  const cli = { executable: process.execPath, prefixArgs: [fixtureSource] };
  const stateDir = stateDirectory(home);
  if (options.model !== false) {
    await mkdir(stateDir, { recursive: true });
    await writeFile(path.join(stateDir, 'settings.json'), JSON.stringify({ defaultModel: MODEL }) + '\n');
  }
  const service = createService({ home, cwd: workspace, cli, platform: process.platform });
  return { dir, home, workspace, cli, service, stateDir };
}
async function directWorkerFixture(delayMs) {
  const f = await fixture(), jobId = 'synthetic-save-queue';
  const executable = path.join(f.workspace, 'synthetic-slow-cli.mjs');
  const session = 'synthetic-save-queue-session';
  await writeFile(executable, `console.log(JSON.stringify({type:'system',subtype:'init',session_id:${JSON.stringify(session)},model:${JSON.stringify(REPORTED)}}));\nawait new Promise(resolve=>setTimeout(resolve,${delayMs}));\nconsole.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:'synthetic complete',session_id:${JSON.stringify(session)}}));\n`);
  const store = new JobStore(f.stateDir);
  await store.init();
  await store.create({ jobId, command: 'task', prompt: 'synthetic', workspace: await realpath(f.workspace), home: f.home,
    requestedModel: MODEL, expectedModel: REPORTED,
    cli: { executable: process.execPath, prefixArgs: [executable] }, mode: 'ask' });
  return { ...f, store, jobId };
}
const terminal = (session = 'session-123') => ({ type: 'result', subtype: 'success', is_error: false, result: 'actual response', session_id: session });
const init = (session = 'session-123') => ({ type: 'system', subtype: 'init', session_id: session, model: REPORTED });
function stream(events, expectedSession) {
  const p = new StreamResult({ expectedSession, requestedModel: MODEL, expectedModel: REPORTED });
  for (const e of events) p.push(`${JSON.stringify(e)}\n`);
  return p;
}

test('one quoted prompt, option terminator, duplicate and invalid flags', () => {
  assert.equal(parseArgs(['task', '--json', '--', '--force $(touch nope)']).prompt, '--force $(touch nope)');
  assert.equal(parseArgs(['result', 'job-123']).jobId, 'job-123');
  for (const args of [['task', 'one', 'two'], ['review', '--write', 'x'], ['adversarial-review', '--write', 'x'], ['task', '--wait', '--background', 'x'], ['task', '--unknown', 'x'], ['status', '--wait-seconds', '21'], ['status', '--wait-seconds', '-1'], ['task', '--model', 'a', '--model', 'b', 'x'], ['task', '--prompt-file', 'x', 'y'], ['resume', 'job'], ['result'], ['cancel'], ['transfer'], ['task', '--model', '--force', 'x'], ['task', '--allow-outside-workspace', 'x']]) assert.throws(() => parseArgs(args));
  for (const command of ['resume', 'transfer', 'adversarial-review']) assert.throws(() => parseArgs([command, 'x']), /Unknown command/);
  for (const flag of ['--prompt-file', '--allow-outside-workspace']) assert.throws(() => parseArgs(['task', flag, 'x']), /Unknown option/);
});
test('CLI argument arrays preserve prompt data; read-only and write runs never force or trust unless asked', () => {
  const prompt = '--force; $(touch /tmp/nope) `echo no` "\\\nЮникод';
  const base = { workspace: '/project space', requestedModel: MODEL, prompt, mode: 'ask' };
  const args = launchArgs(base, 'darwin');
  assert.deepEqual(args.slice(-2), ['--', prompt]);
  assert.equal(args[args.indexOf('--mode') + 1], 'ask');
  assert.ok(!args.includes('--trust')); assert.ok(!args.includes('--force')); assert.ok(!args.includes('--yolo'));
  assert.equal(args[args.indexOf('--sandbox') + 1], 'enabled');
  const write = launchArgs({ ...base, mode: 'write', trustWorkspace: true }, 'darwin');
  assert.ok(write.includes('--trust')); assert.ok(!write.includes('--force')); assert.ok(!write.includes('--yolo'));
  assert.equal(write[write.indexOf('--sandbox') + 1], 'enabled');
  assert.ok(!write.includes('--mode'));
  assert.ok(!write.includes('--approve-mcps')); assert.ok(!write.includes('disabled'));
  const windows = launchArgs({ ...base, mode: 'write' }, 'win32');
  assert.equal(windows[windows.indexOf('--sandbox') + 1], 'enabled');
  assert.ok(!windows.includes('--force')); assert.ok(!windows.includes('--trust'));
  assert.throws(() => launchArgs({ ...base, prompt: 'x'.repeat(20000) }, 'win32'), /length|large/i);
});
test('canonical workspaces reject symlink escapes, broad roots, tool/credential/private directories', async () => {
  const f = await fixture();
  await symlinkDirectory(f.home, path.join(f.workspace, 'alias'));
  for (const root of [f.home, f.dir, '/', path.join(f.workspace, 'alias')]) await assert.rejects(workspacePath(root, { home: f.home }));
  for (const root of ['/users/USER', '/Users', '/Users/User/.CURSOR/x', '/tmp/.ssh/project', '/tmp/PERSONAL/project']) assert.throws(() => assertWorkspacePath(root, '/Users/User', 'darwin'));
  for (const root of ['C:\\', 'C:\\Users', 'c:\\users\\USER', 'C:\\Users\\User\\.claude\\x', '\\\\host\\share\\', 'C:\\other\\credentials\\project']) assert.throws(() => assertWorkspacePath(root, 'C:\\Users\\User', 'win32'));
  assert.equal(await workspacePath(f.workspace, { home: f.home }), await (await import('node:fs/promises')).realpath(f.workspace));
});
test('actual installed metadata formats, explicit authenticated state, exact model availability', () => {
  const models = parseModels('\x1b[2mAvailable models\x1b[0m\n\ngrok-4.7-xhigh-fast - Grok 4.7 256K Extra High Fast (current)\nauto - Auto\n\nTip: use --model <id>');
  assert.deepEqual(models[0], { id: 'grok-4.7-xhigh-fast', name: 'Grok 4.7 256K Extra High Fast' });
  assert.deepEqual(models[1], { id: 'auto', name: 'Auto' });
  const account = 'fixture' + '@' + 'example.invalid';
  const auth = parseAuth(JSON.stringify({ status: 'authenticated', isAuthenticated: true, hasAccessToken: true, userInfo: { email: account, teamName: 'Example', userId: 1, token: 'do-not-store' } }));
  const labeled = parseModels(`grok-4.7-medium - Grok 4.7 Medium ${account}`);
  assert.equal(labeled[0].id, 'grok-4.7-medium');
  assert.equal(labeled[0].name.includes('@'), false);
  assert.match(labeled[0].name, /\[redacted\]/);
  assert.equal(auth.authenticated, true); assert.equal(auth.team, 'Example');
  assert.equal(JSON.stringify(publicAuth(auth)).includes('@'), false);
  assert.equal(JSON.stringify(auth).includes('do-not-store'), false);
  assert.equal(JSON.stringify(auth).includes('hasAccessToken'), false);
  assert.equal(parseAbout(JSON.stringify({ subscriptionTier: 'Example', userEmail: account, model: 'do-not-use' })).plan, 'Example');
  assert.equal(JSON.stringify(parseAbout(JSON.stringify({ subscriptionTier: 'Example', userEmail: account }))).includes('@'), false);
  assert.equal(parseAuth('{"status":"unauthenticated","isAuthenticated":false}').authenticated, false);
  assert.throws(() => parseAuth('nonsense'));
});
test('stream result matches init/session, reports model separately, omits thinking and unknown event content', () => {
  const p = stream([init(), { type: 'thinking', text: 'HIDDEN_SENTINEL' }, { type: 'tool_call', secret: 'TOOL_SENTINEL' }, terminal()]);
  assert.deepEqual(p.finish(0).status, 'completed');
  assert.equal(p.finish(0).output, 'actual response');
  assert.equal(p.finish(0).servingVerified, false);
  assert.ok(!JSON.stringify(p.finish(0)).includes('SENTINEL'));
});
test('exit zero alone, invalid JSON, conflicting/missing session, result errors and model drift never complete', () => {
  for (const events of [[init()], [terminal()], [init(), terminal('wrong')], [init(), terminal(), terminal()], [init(), { ...terminal(), is_error: true }], [init(), { ...terminal(), is_error: undefined }], [{ ...init(), model: 'Other' }, terminal()]]) assert.notEqual(stream(events).finish(0).status, 'completed');
  assert.notEqual(stream([init(), terminal()], 'wrong').finish(0).status, 'completed');
  assert.notEqual(stream([init(), terminal()]).finish(1).status, 'completed');
  const p = stream([init()]); p.push('broken\n'); p.push(JSON.stringify(terminal())); assert.notEqual(p.finish(0).status, 'completed');
  const large = stream([init()]); large.push('x'.repeat(2 * 1024 * 1024)); assert.notEqual(large.finish(0).status, 'completed');
});
test('setup returns ready metadata without creating SDK/config state; missing CLI/auth/model fail clearly', async () => {
  const f = await fixture(); const s = await f.service.execute(['setup', '--json']);
  assert.equal(s.ready, true); assert.equal(s.cli.version, '2026.10.01-fixture'); assert.equal(s.defaultModelAvailable, true);
  assert.equal(s.auth.team, 'Example Team'); assert.equal(s.auth.plan, 'Example');
  assert.equal(JSON.stringify(s).includes('fixture@'), false); assert.equal(JSON.stringify(s).includes('do-not-store'), false);
  await assert.rejects(stat(path.join(f.home, '.claude/unrelated-store/config.json')));
  await writeFile(path.join(f.workspace, 'fake-mode'), 'unauth');
  assert.equal((await f.service.execute(['setup'])).ready, false);
  await assert.rejects(f.service.execute(['task', 'test']), /sign.in|auth/i);
  await writeFile(path.join(f.workspace, 'fake-mode'), 'missing-model');
  assert.equal((await f.service.execute(['setup'])).ready, false);
  await assert.rejects(f.service.execute(['task', 'test']), /model/i);
  const missing = createService({ home: f.home, cwd: f.workspace, env: { PATH: '' } });
  const result = await missing.execute(['setup']); assert.equal(result.ready, false); assert.match(result.error, /install|CLI/i);
});
test('foreground persists actual F1 shape and exact prompt, preserves old state, protects modes and excludes hidden output', async () => {
  const f = await fixture();
  await mkdir(path.join(f.home, '.claude/unrelated-store'), { recursive: true });
  await writeFile(path.join(f.home, '.claude/unrelated-store/old-job'), 'unchanged');
  const prompt = 'Review "quotes" $HOME $(touch no) `command`\nsecond line';
  const r = await f.service.execute(['review', '--json', prompt]);
  assert.equal(r.status, 'completed'); assert.equal(r.output, `actual:${prompt}`); assert.equal(r.reportedModel, REPORTED);
  assert.equal(r.mode, 'ask'); assert.equal(r.servingVerified, false);
  const args = JSON.parse(await readFile(path.join(f.workspace, 'fake-args.json'), 'utf8'));
  assert.equal(args.at(-1), prompt); assert.ok(!args.includes('--force'));
  assert.equal((await f.service.execute(['result', r.jobId])).output, r.output);
  const bytes = await readFile(path.join(f.stateDir, 'jobs', r.jobId, 'state.json'), 'utf8');
  assert.ok(!bytes.includes('HIDDEN_SENTINEL')); assert.ok(!bytes.includes('TOOL_SENTINEL'));
  assert.equal(await readFile(path.join(f.home, '.claude/unrelated-store/old-job'), 'utf8'), 'unchanged');
  if (process.platform !== 'win32') assert.equal((await stat(path.join(f.stateDir, 'jobs', r.jobId, 'state.json'))).mode & 0o777, 0o600);
});
test('explicit write mode creates the fixture file', async () => {
  const f = await fixture();
  const r = await f.service.execute(['task', '--write', 'implement fixture']);
  assert.equal(r.status, 'completed'); assert.equal(r.mode, 'write');
  assert.equal(await readFile(path.join(f.workspace, 'fake-written.txt'), 'utf8'), 'fixture write');
});
test('failure, absent terminal and stderr redaction are honest', async () => {
  const f = await fixture();
  for (const [mode, status] of [['no-terminal', 'uncertain'], ['cli-error', 'failed'], ['wrong-session', 'uncertain'], ['wrong-model', 'uncertain'], ['bad-json', 'uncertain']]) {
    await writeFile(path.join(f.workspace, 'fake-mode'), mode);
    const r = await f.service.execute(['task', mode]); assert.equal(r.status, status, mode);
    assert.ok(!JSON.stringify(r).includes('fake-private-value'));
  }
});
test('background survives launching caller exit, status wait retrieves completion', async () => {
  const f = await fixture(); await writeFile(path.join(f.workspace, 'fake-mode'), 'slow');
  const moduleUrl = new URL('../scripts/lib/jobs.mjs', import.meta.url).href;
  const code = `import {createService} from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(await createService(${JSON.stringify({ home: f.home, cwd: f.workspace, cli: f.cli })}).execute(['task','--background','delayed'])));`;
  const child = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: ['ignore','pipe','pipe'] });
  let output = ''; child.stdout.on('data', b => output += b); await new Promise(r => child.once('close', r));
  const started = JSON.parse(output); assert.ok(['queued','running'].includes(started.status));
  const r = await f.service.execute(['status', started.jobId, '--wait-seconds', '5']); assert.equal(r.status, 'completed');
  assert.equal((await f.service.execute(['status'])).jobs.length, 1);
});
test('a rejected heartbeat save does not prevent the real worker from storing completion', { concurrency: false }, async () => {
  const f = await directWorkerFixture(5000);
  const original = JobStore.prototype.save;
  let injected = false, laterAttempts = 0, workerError;
  JobStore.prototype.save = async function (state) {
    if (this.root === f.stateDir && state.jobId === f.jobId) {
      if (injected) laterAttempts++;
      if (!injected && state.status === 'running' && state.childPid && state.sessionId) {
        injected = true;
        throw Object.assign(new Error('synthetic transient save failure'), { code: 'EBUSY' });
      }
    }
    return original.call(this, state);
  };
  try { await runWorker(f.stateDir, f.jobId); }
  catch (error) { workerError = error; }
  finally { JobStore.prototype.save = original; }
  assert.equal(injected, true, 'The fixture must reach a heartbeat after child identity was stored');
  assert.ok(laterAttempts > 0, 'A failed save must not poison later underlying JobStore.save calls');
  assert.equal(workerError, undefined);
  const stored = await f.store.read(f.jobId);
  assert.equal(stored.status, 'completed');
  assert.equal(stored.output, 'synthetic complete');
  assert.ok(stored.endedAt);
});
test('a rejected child-state save remains visible and persists uncertain, never false completion', { concurrency: false }, async () => {
  const f = await directWorkerFixture(0);
  const original = JobStore.prototype.save;
  let injected = false, laterAttempts = 0, workerError;
  JobStore.prototype.save = async function (state) {
    if (this.root === f.stateDir && state.jobId === f.jobId) {
      if (injected) laterAttempts++;
      if (!injected && state.status === 'running' && state.childPid) {
        injected = true;
        throw Object.assign(new Error('synthetic child-state save failure'), { code: 'EBUSY' });
      }
    }
    return original.call(this, state);
  };
  try { await runWorker(f.stateDir, f.jobId); }
  catch (error) { workerError = error; }
  finally { JobStore.prototype.save = original; }
  assert.equal(injected, true);
  assert.ok(laterAttempts > 0, 'The worker must attempt to persist the truthful failure state');
  assert.equal(workerError, undefined);
  const stored = await f.store.read(f.jobId);
  assert.equal(stored.status, 'uncertain');
  assert.equal(stored.error, 'Job worker failed; completion is unconfirmed.');
  assert.notEqual(stored.cancellationConfirmed, true);
});
test('cancel targets its live owned child group, never another job; terminal result remains immutable', async () => {
  const f = await fixture(); await writeFile(path.join(f.workspace, 'fake-mode'), 'hang');
  const a = await f.service.execute(['task', '--background', 'a']);
  const running = await waitForLiveChild(f.service, a.jobId);
  assert.ok(running.childPid);
  await cancelConfirmed(f.service, a.jobId);
  assert.equal((await f.service.execute(['cancel', a.jobId])).status, 'cancelled');
  await writeFile(path.join(f.workspace, 'fake-mode'), 'normal');
  const b = await f.service.execute(['task', 'b']); assert.equal(b.status, 'completed');
  assert.equal((await f.service.execute(['cancel', b.jobId])).status, 'completed');
});
test('unknown worker stays uncertain and cancel never confirms it; PID identity mismatch fails closed', async () => {
  const f = await fixture(), r = await f.service.execute(['task', 'complete']);
  const file = path.join(f.stateDir, 'jobs', r.jobId, 'state.json');
  await writeFile(file, JSON.stringify({ ...r, status: 'running', heartbeatAt: new Date(0).toISOString(), workerPid: process.pid }));
  assert.equal((await f.service.execute(['status', r.jobId])).status, 'uncertain');
  assert.notEqual((await f.service.execute(['cancel', r.jobId])).cancellationConfirmed, true);
  const identity = await processIdentity(process.pid); assert.ok(identity); assert.equal(await sameProcess(process.pid, identity), true); assert.equal(await sameProcess(process.pid, 'different'), false);
});
test('executable discovery resolves vendor path and refuses arbitrary alias and Windows shims', async () => {
  const f = await fixture();
  const posixPlatform = process.platform === 'win32' ? 'linux' : process.platform;
  const executable = path.join(f.dir, 'cursor-agent');
  await writeFile(executable, 'synthetic executable for discovery only', { mode: 0o700 });
  assert.equal(await discoverCli({ home: f.home, env: { PATH: f.dir }, platform: posixPlatform }), await realpath(executable));
  const aliasDir = path.join(f.dir, 'aliases'); await mkdir(aliasDir);
  await symlink(executable, path.join(aliasDir, 'agent'));
  assert.equal(await discoverCli({ home: f.home, env: { PATH: aliasDir }, platform: posixPlatform }), await realpath(executable));
  await writeFile(path.join(aliasDir, 'cursor-agent.cmd'), 'exit 0');
  await assert.rejects(discoverCli({ home: f.home, env: { PATH: aliasDir }, platform: 'win32' }), /native|installer|exe|CLI/i);
});


test('bounded metadata calls return on an unresponsive child', async () => {
  const result = await capture(process.execPath, ['-e', "process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"], { timeout: 100 });
  assert.equal(result.timedOut, true);
});
test('tool config runtime root is refused after canonicalization', () => {
  assert.throws(() => assertWorkspacePath('/Users/User/.local/share/cursor-agent/versions', '/Users/User', 'darwin'));
});
test('metadata capture stderr scrubs secrets and never returns raw argv on spawn failure', async () => {
  const r = await capture('/nonexistent/official-cursor-agent', ['prompt-private-value']);
  assert.equal(r.spawnError, true); assert.ok(!JSON.stringify(r).includes('prompt-private-value'));
});
test('cancelling one of two live child groups leaves the other running', async () => {
  const f = await fixture(); await writeFile(path.join(f.workspace, 'fake-mode'), 'hang');
  const a = await f.service.execute(['task', '--background', 'a']);
  const b = await f.service.execute(['task', '--background', 'b']);
  await waitForLiveChild(f.service, a.jobId);
  await waitForLiveChild(f.service, b.jobId);
  try {
    await cancelConfirmed(f.service, a.jobId);
    assert.equal((await f.service.execute(['status', b.jobId])).status, 'running');
  } finally { await cancelConfirmed(f.service, b.jobId); }
});
test('lost detached worker cannot falsely confirm cancellation', async () => {
  const f = await fixture(), r = await f.service.execute(['task', 'complete']);
  const file = path.join(f.stateDir, 'jobs', r.jobId, 'state.json');
  await writeFile(file, JSON.stringify({ ...r, status: 'queued', heartbeatAt: new Date(0).toISOString() }));
  assert.equal((await f.service.execute(['cancel', r.jobId])).status, 'uncertain');
});
test('Windows vendor bundle discovery bypasses shell shims and binds node/index in one version', async () => {
  const f = await fixture(), appData = path.join(f.dir, 'Local App Data'), install = path.join(appData, 'cursor-agent');
  const version = path.join(install, 'versions', '2026.10.01-e373342');
  await mkdir(version, { recursive: true });
  await writeFile(path.join(install, 'cursor-agent.cmd'), 'must never execute');
  await writeFile(path.join(install, 'cursor-agent.ps1'), 'must never execute');
  await writeFile(path.join(version, 'node.exe'), 'synthetic vendor node fixture');
  await writeFile(path.join(version, 'index.js'), 'synthetic vendor CLI fixture');
  const cli = await discoverCli({ home: f.home, env: { PATH: install, LOCALAPPDATA: appData }, platform: 'win32' });
  assert.equal(cli.executable, await realpath(path.join(version, 'node.exe')));
  assert.deepEqual(cli.prefixArgs, [await realpath(path.join(version, 'index.js'))]);
  const prompt = '--force & $(touch nope) `bad` \"quoted\"';
  const launch = commandParts(cli, launchArgs({ workspace: 'C:\\project with spaces', prompt, requestedModel: MODEL, mode: 'ask' }, 'win32'), 'win32');
  assert.equal(launch.executable, cli.executable); assert.equal(launch.args[0], cli.prefixArgs[0]);
  assert.deepEqual(launch.args.slice(-2), ['--', prompt]);
  assert.equal(launch.shell, false);
  const partial = path.join(install, 'versions', '2026.10.02-12-10-30-abc123'); await mkdir(partial);
  await writeFile(path.join(partial, 'node.exe'), 'incomplete newer installation');
  await assert.rejects(discoverCli({ home: f.home, env: { LOCALAPPDATA: appData, PATH: install }, platform: 'win32' }), /installation|pair|bundle|CLI/i);
});
test('Windows same-directory official bundle works; orphan shim and arbitrary agent aliases are refused', async () => {
  const f = await fixture(), appData = path.join(f.dir, 'Local'), install = path.join(appData, 'cursor-agent');
  await mkdir(install, { recursive: true }); await writeFile(path.join(install, 'cursor-agent.cmd'), 'shim only');
  await assert.rejects(discoverCli({ home: f.home, env: { LOCALAPPDATA: appData, PATH: install }, platform: 'win32' }));
  await writeFile(path.join(install, 'node.exe'), 'native fixture'); await writeFile(path.join(install, 'index.js'), 'fixture');
  assert.equal((await discoverCli({ home: f.home, env: { LOCALAPPDATA: appData }, platform: 'win32' })).executable, await realpath(path.join(install, 'node.exe')));
  const bin = path.join(f.dir, 'arbitrary'); await mkdir(bin); await writeFile(path.join(bin, 'agent'), 'not vendor'); await chmod(path.join(bin, 'agent'), 0o700);
  await assert.rejects(discoverCli({ home: f.home, env: { PATH: bin } }));
});


test('explicit workspace is used for preflight as well as model execution', async () => {
  const f = await fixture(), other = path.join(f.dir, 'other project'); await mkdir(other);
  await writeFile(path.join(f.workspace, 'fake-mode'), 'unauth');
  const result = await f.service.execute(['task', '--workspace', other, 'selected project']);
  assert.equal(result.status, 'completed'); assert.equal(result.workspace, await realpath(other));
});
test('public CLI JSON errors retain the requested model, and terminator keeps --json as prompt data', async () => {
  const f = await fixture();
  const mainUrl = new URL('../scripts/cursor-companion.mjs', import.meta.url).href;
  const jobsUrl = new URL('../scripts/lib/jobs.mjs', import.meta.url).href;
  async function run(args) {
    const code = `import {main} from ${JSON.stringify(mainUrl)}; import {createService} from ${JSON.stringify(jobsUrl)}; await main(${JSON.stringify(args)},createService(${JSON.stringify({ home:f.home,cwd:f.workspace,cli:f.cli })}));`;
    const child=spawn(process.execPath,['--input-type=module','-e',code],{stdio:['ignore','pipe','pipe'],env:{...process.env,PATH:f.dir,HOME:f.home}});
    let out=''; child.stdout.on('data',b=>out+=b); await new Promise(r=>child.on('close',r)); return out;
  }
  assert.equal(JSON.parse(await run(['task','--json','--model','missing-variant','test'])).requestedModel,'missing-variant');
  const text=await run(['task','--','--json']); assert.match(text,/^Job /); assert.match(text,/actual:--json/);
  assert.match(text, /requested model grok-4\.7-medium; the served model is not verified\./);
  assert.equal(text.includes('fixture@'), false);
  assert.equal(text.includes('do-not-store'), false);
  assert.equal(text.includes('do-not-use'), false);
});
test('cancellation escalates only the owned group when its descendants ignore TERM', {skip:process.platform==='win32'}, async () => {
  const f=await fixture(); await writeFile(path.join(f.workspace,'fake-mode'),'hang-tree');
  const job=await f.service.execute(['task','--background','tree']);
  let descendant;
  for(let i=0;i<50;i++){try{descendant=JSON.parse(await readFile(path.join(f.workspace,'fake-tree.json'),'utf8'));break;}catch{}await delay(50);}
  assert.ok(descendant);
  const result=await f.service.execute(['cancel',job.jobId]);
  assert.equal(result.status,'cancelled'); assert.equal(result.cancellationConfirmed,true);
});

test('status listing is bounded and no-ID wait observes its active jobs', async () => {
  const f = await fixture(); await writeFile(path.join(f.workspace, 'fake-mode'), 'slow');
  const job = await f.service.execute(['task', '--background', 'listing']);
  const waited = await f.service.execute(['status', '--wait-seconds', '5']);
  assert.equal(waited.jobs[0].status, 'completed');
  const template = await f.service.execute(['result', job.jobId]);
  for (let i=0;i<24;i++) {
    const id=`1000000000000-list-${String(i).padStart(2,'0')}`, dir=path.join(f.stateDir,'jobs',id); await mkdir(dir);
    await writeFile(path.join(dir,'state.json'),JSON.stringify({...template,jobId:id}));
  }
  const bounded=await f.service.execute(['status']); assert.equal(bounded.jobs.length,20); assert.equal(bounded.totalJobs,25); assert.equal(bounded.listTruncated,true);
});


test('two workspaces see only their own jobs and a foreign store is untouched', async () => {
  const f = await fixture();
  const other = path.join(f.dir, 'second project');
  await mkdir(other);
  const foreign = path.join(f.home, '.claude', 'foreign-store');
  await mkdir(foreign, { recursive: true });
  const sentinel = path.join(foreign, 'sentinel');
  await writeFile(sentinel, 'do-not-touch');
  if (process.platform !== 'win32') await chmod(foreign, 0o000);
  const otherService = createService({ home: f.home, cwd: other, cli: f.cli, platform: process.platform });
  try {
    const alpha = await f.service.execute(['task', 'alpha']);
    const beta = await otherService.execute(['task', 'beta']);
    const listA = await f.service.execute(['status']);
    const listB = await otherService.execute(['status']);
    assert.deepEqual(listA.jobs.map(job => job.jobId), [alpha.jobId]);
    assert.deepEqual(listB.jobs.map(job => job.jobId), [beta.jobId]);
    assert.equal(JSON.stringify(listA).includes(beta.jobId), false);
    assert.equal(JSON.stringify(listB).includes(alpha.workspace), false);
    assert.equal(JSON.stringify(listB).includes('alpha'), false);
    for (const command of ['status', 'result', 'cancel']) {
      await assert.rejects(() => otherService.execute([command, alpha.jobId]), error => error.message === 'That job belongs to another workspace.');
    }
    assert.equal((await f.service.execute(['result', alpha.jobId])).output, 'actual:alpha');
  } finally { if (process.platform !== 'win32') await chmod(foreign, 0o700); }
  assert.equal(await readFile(sentinel, 'utf8'), 'do-not-touch');
});

test('a request to test stays read-only and write mode is an explicit flag', async () => {
  const f = await fixture();
  const tested = await f.service.execute(['task', 'test this']);
  assert.equal(tested.mode, 'ask'); assert.equal(tested.status, 'completed');
  const askArgs = JSON.parse(await readFile(path.join(f.workspace, 'fake-args.json'), 'utf8'));
  assert.equal(askArgs[askArgs.indexOf('--mode') + 1], 'ask');
  assert.ok(!askArgs.includes('--force')); assert.ok(!askArgs.includes('--yolo')); assert.ok(!askArgs.includes('--trust'));
  assert.equal(await stat(path.join(f.workspace, 'fake-written.txt')).then(() => true, () => false), false);
  const wrote = await f.service.execute(['task', '--write', 'implement the fixture']);
  assert.equal(wrote.mode, 'write');
  const writeArgs = JSON.parse(await readFile(path.join(f.workspace, 'fake-args.json'), 'utf8'));
  assert.ok(!writeArgs.includes('--force')); assert.ok(!writeArgs.includes('--yolo')); assert.ok(!writeArgs.includes('--mode'));
  assert.equal(writeArgs[writeArgs.indexOf('--sandbox') + 1], 'enabled');
  assert.equal(await readFile(path.join(f.workspace, 'fake-written.txt'), 'utf8'), 'fixture write');
  assert.equal(await stat(path.join(f.workspace, 'fake-force.txt')).then(() => true, () => false), false);
});

test('missing, auto and fast models stop before dispatch', async () => {
  const bare = await fixture({ model: false });
  await assert.rejects(bare.service.execute(['task', 'hello']), /No model was selected/);
  await assert.rejects(stat(path.join(bare.workspace, 'fake-args.json')));
  const f = await fixture();
  await assert.rejects(f.service.execute(['task', '--model', 'auto', 'hello']), /Auto is not an exact model/);
  await assert.rejects(f.service.execute(['setup', '--default-model', 'auto']), /Auto is not an exact model/);
  await assert.rejects(f.service.execute(['task', '--model', 'grok-4.7-xhigh-fast', 'hello']), /--allow-fast/);
  await assert.rejects(f.service.execute(['setup', '--default-model', 'grok-4.7-xhigh-fast']), /cannot be saved/);
  await assert.rejects(stat(path.join(f.workspace, 'fake-args.json')));
  const allowed = await f.service.execute(['task', '--model', 'grok-4.7-xhigh-fast', '--allow-fast', 'hello']);
  assert.equal(allowed.status, 'completed'); assert.equal(allowed.requestedModel, 'grok-4.7-xhigh-fast'); assert.equal(allowed.servingVerified, false);
  const saved = await f.service.execute(['setup', '--default-model', MODEL]);
  assert.equal(saved.savedDefaultModel, MODEL);
  const settings = JSON.parse(await readFile(path.join(f.stateDir, 'settings.json'), 'utf8'));
  assert.equal(settings.defaultModel, MODEL); assert.equal(settings.allowFast, undefined);
});

test('an untrusted folder stops with instructions instead of receiving --trust', async () => {
  const f = await fixture();
  await writeFile(path.join(f.workspace, 'fake-mode'), 'trust-required');
  const denied = await f.service.execute(['task', 'hello']);
  assert.equal(denied.status, 'failed');
  assert.match(denied.error, /--trust-workspace/);
  assert.match(denied.error, /remembers that trust for the folder/);
  assert.equal(JSON.stringify(denied).includes('--yolo'), false);
  const silent = JSON.parse(await readFile(path.join(f.workspace, 'fake-args.json'), 'utf8'));
  assert.ok(!silent.includes('--trust')); assert.ok(!silent.includes('--force'));
  await writeFile(path.join(f.workspace, 'fake-mode'), 'normal');
  const allowed = await f.service.execute(['task', '--trust-workspace', 'hello']);
  assert.equal(allowed.status, 'completed');
  const trusted = JSON.parse(await readFile(path.join(f.workspace, 'fake-args.json'), 'utf8'));
  assert.ok(trusted.includes('--trust')); assert.ok(!trusted.includes('--force')); assert.ok(!trusted.includes('--yolo'));
});
