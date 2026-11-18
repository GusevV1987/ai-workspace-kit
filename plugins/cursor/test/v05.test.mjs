import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, stat, realpath, unlink, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { ELEVATED_REFUSALS } from '../scripts/lib/cli.mjs';
import { StreamResult } from '../scripts/lib/cli.mjs';
import { JobStore, createService, runWorker, stateDirectory, HOOKS_REFUSAL } from '../scripts/lib/jobs.mjs';
import { isEntry, main } from '../scripts/cursor-companion.mjs';
import { mainElevated } from '../scripts/cursor-elevated.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixtureSource = fileURLToPath(new URL('./cursor-cli-fixture.mjs', import.meta.url));
const read = relative => readFile(path.join(root, relative), 'utf8');

async function fixture(options = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cursor-v05-'));
  const home = path.join(dir, 'home');
  const workspace = path.join(dir, 'project');
  await mkdir(home);
  await mkdir(workspace);
  const cli = { executable: process.execPath, prefixArgs: [fixtureSource] };
  const stateDir = stateDirectory(home);
  if (options.model !== false) {
    await mkdir(stateDir, { recursive: true });
    await writeFile(path.join(stateDir, 'settings.json'), JSON.stringify({ defaultModel: 'grok-4.7-medium' }) + '\n');
  }
  const service = createService({ home, cwd: workspace, cli, platform: process.platform });
  return { dir, home, workspace, cli, service, stateDir };
}

async function runMain(args, service, elevated = false) {
  const before = process.exitCode;
  let out = '';
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk, encoding, callback) => {
    out += chunk;
    const cb = typeof encoding === 'function' ? encoding : callback;
    if (typeof cb === 'function') cb();
    return true;
  };
  try {
    const result = await (elevated ? mainElevated(args, service) : main(args, service));
    return { result, out };
  } finally {
    process.stdout.write = original;
    process.exitCode = before;
  }
}

test('the pre-approved script refuses each approval flag', async () => {
  const cases = [
    ['write', ['task', '--write', 'hello']],
    ['trust-workspace', ['task', '--trust-workspace', 'hello']],
    ['allow-fast', ['task', '--model', 'grok-4.7-xhigh-fast', '--allow-fast', 'hello']],
    ['workspace', ['task', '--workspace', os.tmpdir(), 'hello']],
    ['workspace', ['review', `--workspace=${os.tmpdir()}`]],
    ['allow-hooks', ['task', '--allow-hooks', 'hello']],
    ['allow-hooks', ['review', '--allow-hooks', 'hello']],
    ['allow-hooks', ['setup', '--allow-hooks']],
    ['allow-hooks', ['models', '--allow-hooks']],
  ];
  for (const [flag, args] of cases) {
    let called = false;
    const service = { async execute() { called = true; throw new Error('launched'); } };
    const { result } = await runMain(args, service, false);
    assert.equal(called, false, flag);
    assert.equal(result.status, 'failed', flag);
    assert.equal(result.error, ELEVATED_REFUSALS[flag], flag);
    assert.match(result.error, /person's approval/);
    assert.match(result.error, /cursor-elevated\.mjs/);
  }
  const { result } = await runMain(['task', '--', 'please --write this'], { async execute() { return { jobId: null, status: 'failed', error: 'reached helper' }; } }, false);
  assert.equal(result.error, 'reached helper');
});

test('the elevated script accepts the approval flags', async () => {
  const f = await fixture();
  const wrote = await runMain(['task', '--write', 'implement'], f.service, true);
  assert.equal(wrote.result.status, 'completed');
  assert.equal(wrote.result.mode, 'write');
  const trusted = await runMain(['task', '--trust-workspace', 'hello'], f.service, true);
  assert.equal(trusted.result.status, 'completed');
  const trustedArgs = JSON.parse(await readFile(path.join(f.workspace, 'fake-args.json'), 'utf8'));
  assert.ok(trustedArgs.includes('--trust'));
  const fast = await runMain(['task', '--model', 'grok-4.7-xhigh-fast', '--allow-fast', 'hello'], f.service, true);
  assert.equal(fast.result.status, 'completed');
  assert.equal(fast.result.requestedModel, 'grok-4.7-xhigh-fast');
  const other = path.join(f.dir, 'other');
  await mkdir(other);
  const moved = await runMain(['task', '--workspace', other, 'hello'], f.service, true);
  assert.equal(moved.result.status, 'completed');
  assert.equal(moved.result.workspace, await realpath(other));
});

test('every command is typed by hand and grants only the pre-approved script', async () => {
  const pattern = `allowed-tools: 'Bash(node "\${CLAUDE_PLUGIN_ROOT}/scripts/cursor-companion.mjs" *)'`;
  const files = (await readdir(path.join(root, 'commands'))).sort();
  assert.deepEqual(files, ['cancel.md', 'models.md', 'result.md', 'review.md', 'setup.md', 'status.md', 'task.md']);
  for (const file of files) {
    const text = await readFile(path.join(root, 'commands', file), 'utf8');
    assert.match(text, /^disable-model-invocation: true$/m, file);
    const allowed = text.match(/^allowed-tools:.*$/m);
    assert.equal(allowed?.[0], pattern, file);
    assert.equal(text.includes('CLAUDE_PLUGIN_DATA'), false, file);
    assert.equal(text.includes('plugins/data/cursor'), false, file);
  }
  await assert.rejects(stat(path.join(root, 'agents')));
  await assert.rejects(stat(path.join(root, 'skills')));
  const readme = await read('README.md');
  assert.equal(readme.includes('CLAUDE_PLUGIN_DATA'), false);
  assert.match(readme, /~\/\.claude\/cursor-companion\//);
});

test('removed commands and options are unknown to both scripts', async () => {
  const cases = [
    ['resume', 'x', 'more'],
    ['transfer', 'brief'],
    ['adversarial-review', 'look'],
    ['task', '--prompt-file', 'notes.md'],
    ['task', '--allow-outside-workspace', 'hello'],
  ];
  for (const args of cases) {
    for (const elevated of [false, true]) {
      let called = false;
      const { result } = await runMain(args, { async execute() { called = true; throw new Error('launched'); } }, elevated);
      assert.equal(called, false, args.join(' '));
      assert.equal(result.status, 'failed', args.join(' '));
      assert.match(result.error, /Unknown (command|option)/, args.join(' '));
    }
  }
});

test('setup and models refuse a hooks file before Cursor starts', async () => {
  const f = await fixture();
  const marker = path.join(f.workspace, 'cursor-called.txt');
  const cliScript = path.join(f.dir, 'marker-cli.mjs');
  await writeFile(cliScript, `import fs from 'node:fs'; fs.writeFileSync(${JSON.stringify(marker)}, 'called');\n`);
  const watching = createService({ home: f.home, cwd: f.workspace, cli: { executable: process.execPath, prefixArgs: [cliScript] }, platform: process.platform });
  await mkdir(path.join(f.workspace, '.cursor'));
  await writeFile(path.join(f.workspace, '.cursor', 'hooks.json'), '{"version":1,"hooks":{}}\n');
  const setup = await runMain(['setup'], watching, false);
  assert.equal(setup.result.error, HOOKS_REFUSAL);
  assert.equal(setup.result.status, 'failed');
  assert.equal(setup.result.requestedModel, null);
  await assert.rejects(stat(marker));
  await unlink(path.join(f.workspace, '.cursor', 'hooks.json'));
  await mkdir(path.join(f.workspace, '.cursor', 'hooks.json'));
  const models = await runMain(['models'], watching, false);
  assert.equal(models.result.error, HOOKS_REFUSAL);
  assert.equal(models.result.status, 'failed');
  await assert.rejects(stat(marker));
});

test('task and review refuse hooks until the second script is given --allow-hooks', async () => {
  const f = await fixture();
  await mkdir(path.join(f.workspace, '.cursor'));
  await writeFile(path.join(f.workspace, '.cursor', 'hooks.json'), '{"version":1,"hooks":{}}\n');
  const marker = path.join(f.workspace, 'cursor-called.txt');
  const cliScript = path.join(f.dir, 'marker-cli.mjs');
  await writeFile(cliScript, `import fs from 'node:fs'; fs.writeFileSync(${JSON.stringify(marker)}, 'called');\n`);
  const watching = createService({ home: f.home, cwd: f.workspace, cli: { executable: process.execPath, prefixArgs: [cliScript] }, platform: process.platform });
  for (const command of ['task', 'review']) {
    const first = await runMain([command, 'hello'], watching, false);
    assert.equal(first.result.error, HOOKS_REFUSAL, command);
    assert.equal(first.result.jobId, null, command);
    const second = await runMain([command, 'hello'], watching, true);
    assert.equal(second.result.error, HOOKS_REFUSAL, `${command} elevated`);
    assert.equal(second.result.jobId, null, `${command} elevated`);
    await assert.rejects(stat(marker), command);
  }
  const accepted = await runMain(['task', '--allow-hooks', 'hello'], f.service, true);
  assert.equal(accepted.result.status, 'completed');
  const reviewed = await runMain(['review', '--allow-hooks', 'hello'], f.service, true);
  assert.equal(reviewed.result.status, 'completed');
  const request = JSON.parse(await readFile(path.join(f.stateDir, 'jobs', reviewed.result.jobId, 'request.json'), 'utf8'));
  assert.equal(request.allowHooks, true);
});

test('the worker re-checks hooks before starting Cursor', async () => {
  const f = await fixture();
  const workspace = await realpath(f.workspace);
  const marker = path.join(workspace, 'cursor-called.txt');
  const cliScript = path.join(f.dir, 'marker-cli.mjs');
  await writeFile(cliScript, `import fs from 'node:fs'; fs.writeFileSync(${JSON.stringify(marker)}, 'called');\n`);
  await mkdir(path.join(workspace, '.cursor'));
  await writeFile(path.join(workspace, '.cursor', 'hooks.json'), '{"version":1,"hooks":{}}\n');
  const store = new JobStore(f.stateDir);
  await store.init();
  const jobId = 'hooksrecheck';
  await store.create({ jobId, command: 'task', prompt: 'hello', workspace, home: f.home,
    requestedModel: 'grok-4.7-medium', expectedModel: 'Grok 4.7 Medium',
    cli: { executable: process.execPath, prefixArgs: [cliScript] }, mode: 'ask' });
  await runWorker(f.stateDir, jobId);
  const state = await store.read(jobId);
  assert.equal(state.status, 'failed');
  assert.equal(state.error, HOOKS_REFUSAL);
  await assert.rejects(stat(marker));
});

test('a failing run does not keep Cursor diagnostics, and a stored stderr field is not shown', async () => {
  const f = await fixture();
  const account = 'fixture' + '@' + 'example.invalid';
  await writeFile(path.join(f.workspace, 'fake-mode'), 'cli-error');
  const text = await runMain(['task', 'hello'], f.service, false);
  const json = await runMain(['task', '--json', 'hello'], f.service, false);
  assert.equal(text.result.status, 'failed');
  assert.equal(text.result.error, 'Cursor CLI did not complete successfully.');
  assert.equal(json.result.error, 'Cursor CLI did not complete successfully.');
  for (const view of [text, json]) {
    assert.equal(view.out.includes(account), false);
    assert.equal(view.out.includes('@'), false);
    assert.equal(view.out.includes('basic-sentinel-value'), false);
    assert.equal(view.out.includes('Authorization: Basic'), false);
    assert.equal(Object.hasOwn(view.result, 'stderr'), false);
    assert.equal(Object.hasOwn(view.result, 'stderrTruncated'), false);
  }
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) {
        const body = await readFile(full, 'utf8');
        assert.equal(body.includes(account), false, full);
        assert.equal(body.includes('@'), false, full);
        assert.equal(body.includes('basic-sentinel-value'), false, full);
        assert.equal(body.includes('Authorization: Basic'), false, full);
      }
    }
  }
  await walk(f.stateDir);
  const stateFile = path.join(f.stateDir, 'jobs', text.result.jobId, 'state.json');
  const stored = JSON.parse(await readFile(stateFile, 'utf8'));
  stored.stderr = `leaked ${account} Authorization: Basic basic-sentinel-value`;
  await writeFile(stateFile, JSON.stringify(stored));
  const shown = await runMain(['result', text.result.jobId], f.service, false);
  const shownJson = await runMain(['result', text.result.jobId, '--json'], f.service, false);
  for (const view of [shown, shownJson]) {
    assert.equal(view.out.includes(account), false);
    assert.equal(view.out.includes('@'), false);
    assert.equal(view.out.includes('basic-sentinel-value'), false);
    assert.equal(view.out.includes('Authorization: Basic'), false);
    assert.equal(Object.hasOwn(view.result, 'stderr'), false);
  }
  assert.equal((await readFile(stateFile, 'utf8')).includes('stderr'), true);
});

test('an error-tagged result keeps no Cursor text, and a successful answer remains', async () => {
  const f = await fixture();
  const account = 'fixture' + '@' + 'example.invalid';
  const phrase = 'cursor-error-diagnostic';
  await writeFile(path.join(f.workspace, 'fake-mode'), 'error-result');
  const text = await runMain(['task', 'hello'], f.service, false);
  const json = await runMain(['task', '--json', 'again'], f.service, false);
  assert.equal(text.result.status, 'failed');
  assert.equal(text.result.error, 'Cursor CLI did not complete successfully.');
  assert.equal(json.result.error, 'Cursor CLI did not complete successfully.');
  for (const view of [text, json]) {
    assert.equal(Object.hasOwn(view.result, 'output'), false);
    assert.equal(view.out.includes(account), false);
    assert.equal(view.out.includes(phrase), false);
    assert.equal(view.out.includes('@'), false);
  }
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) {
        const body = await readFile(full, 'utf8');
        assert.equal(body.includes(account), false, full);
        assert.equal(body.includes(phrase), false, full);
        assert.equal(body.includes('@'), false, full);
      }
    }
  }
  await walk(f.stateDir);
  const later = await runMain(['result', text.result.jobId], f.service, false);
  const laterJson = await runMain(['result', text.result.jobId, '--json'], f.service, false);
  const laterStatus = await runMain(['status', text.result.jobId], f.service, false);
  for (const view of [later, laterJson, laterStatus]) {
    assert.equal(Object.hasOwn(view.result, 'output'), false);
    assert.equal(view.out.includes(account), false);
    assert.equal(view.out.includes(phrase), false);
    assert.equal(view.result.error, 'Cursor CLI did not complete successfully.');
  }
  for (const [events, secret] of [
    [[{ type: 'result', subtype: 'error', is_error: false, result: 'subtype-diagnostic', session_id: 'session-123' }], 'subtype-diagnostic'],
    [[{ type: 'result', subtype: 'success', is_error: true, result: 'flag-diagnostic', session_id: 'session-123' }], 'flag-diagnostic'],
  ]) {
    const parser = new StreamResult({ requestedModel: 'grok-4.7-medium', expectedModel: 'Grok 4.7 Medium' });
    parser.push(`${JSON.stringify({ type: 'system', subtype: 'init', session_id: 'session-123', model: 'Grok 4.7 Medium' })}\n`);
    parser.push(`${JSON.stringify(events[0])}\n`);
    const parsed = parser.finish(0);
    assert.equal(parsed.status, 'failed');
    assert.equal(parsed.error, 'Cursor CLI did not complete successfully.');
    assert.equal(Object.hasOwn(parsed, 'output'), false);
    assert.equal(JSON.stringify(parsed).includes(secret), false);
  }
  await writeFile(path.join(f.workspace, 'fake-mode'), 'normal');
  const ok = await runMain(['task', 'keep-this-answer'], f.service, false);
  assert.equal(ok.result.status, 'completed');
  assert.equal(ok.result.output, 'actual:keep-this-answer');
  assert.equal(ok.out.includes('actual:keep-this-answer'), true);
});

test('a reported model label is stored and shown without an address', async () => {
  const f = await fixture();
  const account = 'fixture' + '@' + 'example.invalid';
  await writeFile(path.join(f.workspace, 'fake-mode'), 'address-label');
  const done = await runMain(['task', 'hello'], f.service, false);
  assert.equal(done.result.status, 'completed');
  assert.equal(done.result.reportedModel.includes('@'), false);
  assert.match(done.result.reportedModel, /\[redacted\]/);
  assert.equal(done.out.includes(account), false);
  assert.equal(done.out.includes('@'), false);
  const state = JSON.parse(await readFile(path.join(f.stateDir, 'jobs', done.result.jobId, 'state.json'), 'utf8'));
  assert.equal(state.reportedModel.includes('@'), false);
  assert.equal(JSON.stringify(state).includes(account), false);
  const shown = await runMain(['result', done.result.jobId], f.service, false);
  assert.equal(shown.out.includes('@'), false);
  assert.match(shown.out, /CLI reported Grok 4\.7 Medium \[redacted\]/);
  const shownJson = await runMain(['result', done.result.jobId, '--json'], f.service, false);
  assert.equal(shownJson.out.includes('@'), false);
  assert.equal(shownJson.result.reportedModel.includes('@'), false);
});

test('setup text and json contain no @ when the fixture account has an address', async () => {
  const raw = spawnSync(process.execPath, [fixtureSource, 'status'], { encoding: 'utf8' });
  assert.equal(raw.stdout.includes('@'), true);
  const f = await fixture();
  const text = await runMain(['setup'], f.service, false);
  const json = await runMain(['setup', '--json'], f.service, false);
  assert.equal(text.out.includes('@'), false);
  assert.equal(json.out.includes('@'), false);
});

test('a reported label with a context-size token completes, and a different level still fails', () => {
  const terminal = { type: 'result', subtype: 'success', is_error: false, result: 'actual response', session_id: 'session-123' };
  function finish(model, expected = 'Grok 4.7 Medium') {
    const parser = new StreamResult({ requestedModel: 'grok-4.7-medium', expectedModel: expected });
    parser.push(`${JSON.stringify({ type: 'system', subtype: 'init', session_id: 'session-123', model })}\n`);
    parser.push(`${JSON.stringify(terminal)}\n`);
    return parser.finish(0);
  }
  for (const label of ['Grok 4.7 256K Medium', 'Grok 4.7 1M Medium']) {
    const done = finish(label);
    assert.equal(done.status, 'completed', label);
    assert.equal(done.servingVerified, false, label);
  }
  for (const label of ['Grok 4.7 256K High', 'Grok 4.5 256K Medium', 'Other 4.7 256K Medium']) {
    const failed = finish(label);
    assert.notEqual(failed.status, 'completed', label);
    assert.match(failed.error, /different model/, label);
  }
});

test('the job id is printed before the foreground wait', async () => {
  const f = await fixture();
  await writeFile(path.join(f.workspace, 'fake-mode'), 'slow');
  const mainUrl = new URL('../scripts/cursor-companion.mjs', import.meta.url).href;
  const jobsUrl = new URL('../scripts/lib/jobs.mjs', import.meta.url).href;
  const code = `import { main } from ${JSON.stringify(mainUrl)}; import { createService } from ${JSON.stringify(jobsUrl)}; const service = createService(${JSON.stringify({ home: f.home, cwd: f.workspace, cli: f.cli })}); await main(['task', 'read the notes'], service);`;
  const child = spawn(process.execPath, ['--input-type=module', '-e', code], { cwd: f.workspace, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  let settled = false;
  const early = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no early job id\n${out}`)), 20000);
    const finish = (fn, value) => { if (settled) return; settled = true; clearTimeout(timer); fn(value); };
    child.stdout.on('data', buf => {
      out += buf;
      const match = out.match(/^Job (\S+)\n/);
      if (!match || settled) return;
      if (out.includes(': completed') || out.includes(': failed')) finish(reject, new Error(`job id was not ahead of the result\n${out}`));
      else finish(resolve, match[1]);
    });
    child.on('close', () => finish(reject, new Error(`closed before an early job id\n${out}`)));
  });
  const codeExit = await new Promise(resolve => child.on('close', resolve));
  assert.equal(codeExit, 0);
  assert.equal(out.indexOf(`Job ${early}\n`), 0);
  assert.match(out, new RegExp(`Job ${early}: completed`));
});

test('an empty list prints one sentence', async () => {
  const f = await fixture();
  const { result, out } = await runMain(['status'], f.service, false);
  assert.equal(result.status, 'listed');
  assert.deepEqual(result.jobs, []);
  assert.match(out, /This folder has no jobs\./);
});

test('a status line carries the stored reason', async () => {
  const f = await fixture();
  await writeFile(path.join(f.workspace, 'fake-mode'), 'trust-required');
  const failed = await f.service.execute(['task', 'hello']);
  assert.equal(failed.status, 'failed');
  const { out } = await runMain(['status'], f.service, false);
  assert.ok(out.includes(`${failed.jobId}: failed (${failed.workspace}) — ${failed.error}`));
});

test('setup --default-model with a fast id is refused by the helper', async () => {
  const f = await fixture({ model: false });
  const { result } = await runMain(['setup', '--default-model', 'grok-4.7-xhigh-fast'], f.service, false);
  assert.match(result.error, /cannot be saved/);
  await assert.rejects(stat(path.join(f.stateDir, 'settings.json')));
  const setup = await read('commands/setup.md');
  assert.match(setup, /--default-model <id>/);
  const models = await read('commands/models.md');
  assert.match(models, /print the id list unchanged unless the user asked for a summary/);
});

test('a result that arrives with a failing exit code keeps no answer text', () => {
  const parser = new StreamResult({ requestedModel: 'grok-4.7-medium', expectedModel: 'Grok 4.7 Medium' });
  parser.push(`${JSON.stringify({ type: 'system', subtype: 'init', session_id: 'session-123', model: 'Grok 4.7 Medium' })}\n`);
  parser.push(`${JSON.stringify({ type: 'result', subtype: 'success', is_error: false, result: 'text-of-a-failed-run', session_id: 'session-123' })}\n`);
  const parsed = parser.finish(1);
  assert.equal(parsed.status, 'failed');
  assert.equal(Object.hasOwn(parsed, 'output'), false);
  assert.equal(JSON.stringify(parsed).includes('text-of-a-failed-run'), false);
});

test('an answer that quotes the trust phrase stays a completed answer', async () => {
  const f = await fixture();
  const quoted = await runMain(['task', 'Explain the message Workspace Trust Required'], f.service, false);
  assert.equal(quoted.result.status, 'completed');
  assert.equal(quoted.result.output, 'actual:Explain the message Workspace Trust Required');
  await writeFile(path.join(f.workspace, 'fake-mode'), 'trust-required');
  const refused = await runMain(['task', 'hello'], f.service, false);
  assert.equal(refused.result.status, 'failed');
  assert.match(refused.result.error, /--trust-workspace/);
  assert.equal(Object.hasOwn(refused.result, 'output'), false);
});

test('both scripts run when the plugin folder is reached through a link', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cursor-link-'));
  const home = path.join(dir, 'home');
  const project = path.join(dir, 'project');
  await mkdir(home);
  await mkdir(project);
  const linked = path.join(dir, 'plugin-link');
  await symlink(root, linked, 'junction');
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  for (const script of ['cursor-companion.mjs', 'cursor-elevated.mjs']) {
    const run = spawnSync(process.execPath, [path.join(linked, 'scripts', script), 'status'], { cwd: project, env, encoding: 'utf8' });
    assert.equal(run.status, 0, script);
    assert.match(run.stdout, /This folder has no jobs\./, script);
  }
  const companionUrl = new URL('../scripts/cursor-companion.mjs', import.meta.url).href;
  assert.equal(isEntry(companionUrl, path.join(linked, 'scripts', 'cursor-companion.mjs')), true);
  assert.equal(isEntry(companionUrl, path.join(linked, 'scripts', 'cursor-elevated.mjs')), false);
  assert.equal(isEntry(companionUrl, undefined), false);
});
