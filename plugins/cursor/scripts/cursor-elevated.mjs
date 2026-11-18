#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from './cursor-companion.mjs';

// Same commands as cursor-companion.mjs, plus --write, --trust-workspace, --allow-fast, --workspace and --allow-hooks.
// Never add this file to allowed-tools. Claude Code must ask each time.
export function mainElevated(argv = process.argv.slice(2), service) {
  return main(argv, service, { elevated: true });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await mainElevated();
