import { runWorker } from './lib/jobs.mjs';
// Private entrypoint launched by cursor-companion. No user prompt or credential is transported in its argv.
await runWorker(process.argv[2], process.argv[3]).catch(() => { process.exitCode = 1; });
