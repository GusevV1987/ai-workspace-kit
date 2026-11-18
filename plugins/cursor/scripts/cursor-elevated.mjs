#!/usr/bin/env node
import { isEntry, main } from './cursor-companion.mjs';

// Same commands as cursor-companion.mjs, plus --write, --trust-workspace, --allow-fast, --workspace and --allow-hooks.
// Never add this file to allowed-tools. Claude Code must ask each time.
export function mainElevated(argv = process.argv.slice(2), service) {
  return main(argv, service, { elevated: true });
}

if (isEntry(import.meta.url)) await mainElevated();
