#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOOKS_REFUSAL, createService } from './lib/jobs.mjs';
import { ELEVATED_REFUSALS, InputError, firstElevatedFlag, parseArgs, publicAuth, stripEmails } from './lib/cli.mjs';

// True when this file is the script Node was started with. Node resolves links in the script's own path,
// so both sides are resolved before comparing; a plugin folder reached through a link must still run.
export function isEntry(moduleUrl, started = process.argv[1]) {
  if (!started) return false;
  const real = file => { try { return realpathSync(file); } catch { return path.resolve(file); } };
  return real(started) === real(fileURLToPath(moduleUrl));
}

function present(result) {
  const copy = { ...result };
  delete copy.stderr;
  delete copy.stderrTruncated;
  if (typeof copy.reportedModel === 'string') copy.reportedModel = stripEmails(copy.reportedModel);
  if (Array.isArray(copy.models)) copy.models = copy.models.map(model => ({
    ...model,
    id: typeof model.id === 'string' ? stripEmails(model.id) : model.id,
    name: typeof model.name === 'string' ? stripEmails(model.name) : model.name,
  }));
  if (copy.selectedModel && typeof copy.selectedModel === 'object') copy.selectedModel = {
    ...copy.selectedModel,
    id: typeof copy.selectedModel.id === 'string' ? stripEmails(copy.selectedModel.id) : copy.selectedModel.id,
    name: typeof copy.selectedModel.name === 'string' ? stripEmails(copy.selectedModel.name) : copy.selectedModel.name,
  };
  if (Array.isArray(copy.jobs)) copy.jobs = copy.jobs.map(job => {
    const item = { ...job };
    delete item.stderr;
    delete item.stderrTruncated;
    if (typeof item.reportedModel === 'string') item.reportedModel = stripEmails(item.reportedModel);
    return item;
  });
  return copy;
}

export async function main(argv = process.argv.slice(2), service = createService(), { elevated = false } = {}) {
  let result, options;
  const blocked = elevated ? null : firstElevatedFlag(argv);
  if (blocked) {
    options = { json: argv.includes('--json') && argv.indexOf('--json') < (argv.indexOf('--') < 0 ? argv.length : argv.indexOf('--')) };
    result = { jobId: null, status: 'failed', requestedModel: null, servingVerified: false, error: ELEVATED_REFUSALS[blocked] };
  } else try { options = parseArgs(argv); result = await service.execute(argv, { elevated }); }
  catch (error) {
    const message = error instanceof InputError ? error.message : 'Local operation failed. Preserve job state and inspect setup/status; do not retry automatically.';
    result = { jobId: null, status: 'failed', requestedModel: message === HOOKS_REFUSAL ? null : (options?.model ?? null), servingVerified: false, error: message };
  }
  if (result.auth) result = { ...result, auth: publicAuth(result.auth) };
  result = present(result);
  if (options?.json || (!options && argv.slice(0, argv.indexOf('--') < 0 ? argv.length : argv.indexOf('--')).includes('--json'))) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  else {
    const lines = [result.jobId ? `Job ${result.jobId}: ${result.status}` : `Cursor: ${result.status}`];
    if (result.output !== undefined) lines.push(result.output);
    if (result.error) lines.push(result.error);
    if (result.sessionId) lines.push(`Session: ${result.sessionId}`);
    if (typeof result.requestedModel === 'string' && result.requestedModel) lines.push(`requested model ${result.requestedModel}; the served model is not verified.`);
    if (result.reportedModel) lines.push(`CLI reported ${result.reportedModel}. That report is not a verification of the served model.`);
    if (result.auth) lines.push(result.auth.authenticated ? `Signed in team: ${result.auth.team ?? 'not reported'}. Plan: ${result.auth.plan ?? 'not reported'}.` : 'Not signed in.');
    if (result.mode === 'write' && result.sandbox !== 'enabled') lines.push('The Cursor CLI sandbox is not available for this run. The command does not add --force.');
    if (result.ready !== undefined) lines.push(JSON.stringify({ ready: result.ready, cli: result.cli, auth: result.auth, models: result.models, savedDefaultModel: result.savedDefaultModel ?? null }, null, 2));
    if (result.jobs) {
      if (result.jobs.length === 0) lines.push('This folder has no jobs.');
      for (const job of result.jobs) lines.push(`${job.jobId}: ${job.status} (${job.workspace})${job.error ? ` — ${job.error}` : ''}`);
    }
    process.stdout.write(lines.join('\n') + '\n');
  }
  if (['failed', 'uncertain', 'not-ready'].includes(result.status)) process.exitCode = 1;
  return result;
}
if (isEntry(import.meta.url)) await main();
