// Synthetic executable only. Never invokes a provider or reads credentials.
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
const args = process.argv.slice(2);
const account = 'fixture' + '@' + 'example.invalid';
let mode = 'normal'; try { mode = fs.readFileSync('fake-mode', 'utf8'); } catch {}
const catalog = { 'grok-4.7-medium': 'Grok 4.7 Medium', 'grok-4.7-xhigh-fast': 'Grok 4.7 256K Extra High Fast' };
if (args.includes('--version')) { console.log('2026.10.01-fixture'); process.exit(0); }
if (args[0] === 'status') { console.log(JSON.stringify({ status: mode === 'unauth' ? 'unauthenticated' : 'authenticated', isAuthenticated: mode !== 'unauth', hasAccessToken: mode !== 'unauth', userInfo: { email: account, teamName: 'Example Team', userId: 1, token: 'do-not-store' } })); process.exit(0); }
if (args[0] === 'about') { console.log(JSON.stringify({ subscriptionTier: 'Example', userEmail: account, model: 'do-not-use' })); process.exit(0); }
if (args[0] === 'models') {
  const lines = mode === 'missing-model' ? ['auto - Auto'] : [...Object.entries(catalog).map(([id, name]) => `${id} - ${name}`), 'auto - Auto'];
  console.log(`Available models\n\n${lines.join('\n')}\n\nTip: use --model <id>`);
  process.exit(0);
}
fs.writeFileSync('fake-args.json', JSON.stringify(args));
if (mode === 'trust-required') { console.error('Workspace Trust Required\nPass --trust, --yolo, or -f if you trust this directory'); process.exit(1); }
if (mode === 'cli-error') {
  const basic = 'Authorization: Basic ' + 'basic-sentinel-value';
  console.error(`Authentication failed: ${account} ${basic} CURSOR_API_KEY=fake-private-value Authorization: Bearer fake-private-value`);
  process.exit(1);
}
const session = randomUUID();
const requested = args.includes('--model') ? args[args.indexOf('--model') + 1] : 'grok-4.7-medium';
const emit = x => console.log(JSON.stringify(x));
const reportedName = mode === 'wrong-model' ? 'Other' : (catalog[requested] ?? 'Grok 4.7 Medium');
emit({ type: 'system', subtype: 'init', model: mode === 'address-label' ? `${reportedName} ${account}` : reportedName, session_id: session });
emit({ type: 'thinking', text: 'HIDDEN_SENTINEL' });
emit({ type: 'tool_call', result: 'TOOL_SENTINEL' });
if (mode === 'hang-tree') {
  process.on('SIGTERM',()=>{});
  const child=spawn(process.execPath,['-e',"process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"],{stdio:'ignore'});
  fs.writeFileSync('fake-tree.json',JSON.stringify({pid:child.pid}));
  setInterval(()=>{},1000);
}
else if (mode === 'hang') setInterval(() => {}, 1000);
else {
  if (mode === 'slow') await new Promise(r => setTimeout(r, 1300));
  const ask = args.includes('--mode') && args[args.indexOf('--mode') + 1] === 'ask';
  if (args.includes('--force') || args.includes('--yolo')) fs.writeFileSync('fake-force.txt', 'force was passed');
  else if (!ask) fs.writeFileSync('fake-written.txt', 'fixture write');
  if (mode === 'bad-json') console.log('not json');
  if (mode === 'error-result') {
    const phrase = 'cursor-error-diagnostic';
    emit({ type: 'result', subtype: 'error', is_error: true, result: `${phrase} ${account}`, session_id: session });
  } else if (mode !== 'no-terminal') emit({ type: 'result', subtype: 'success', is_error: false, result: `actual:${args.at(-1)}`, session_id: mode === 'wrong-session' ? 'wrong' : session });
}
