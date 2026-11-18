import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=relative=>readFile(new URL(relative,root),'utf8');
const rule=/When the user's own command contains `--write`, `--trust-workspace`, `--allow-fast`, `--workspace`, or `--allow-hooks`, run `node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/cursor-elevated\.mjs"` with only the options the user typed; otherwise run `node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/cursor-companion\.mjs"`; never add an option; when a script refuses, repeat its sentence and stop\./;
const setupCase=/If the user's own command contains `--allow-hooks`, run `node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/cursor-elevated\.mjs" setup --allow-hooks`, adding `--default-model <id>` only when the user typed that id\. Otherwise run `node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/cursor-companion\.mjs" setup`, adding `--default-model <id>` only when the user typed that id\./;
const modelsCase=/If the user's own command contains `--allow-hooks`, run `node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/cursor-elevated\.mjs" models --allow-hooks`\. Otherwise run `node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/cursor-companion\.mjs" models`\./;

test('setup uses the one Node helper and gives human installation/sign-in guidance',async()=>{
 const text=await read('commands/setup.md');
 assert.match(text,/scripts\/cursor-companion\.mjs.*setup/);
 assert.match(text,setupCase);
 assert.match(text,/argument-hint: "\[--allow-hooks\]"/);
 assert.match(text,/https:\/\/cursor\.com\/docs\/cli\/installation/);
 assert.match(text,/human|yourself|member/i);assert.match(text,/ready/);
 assert.doesNotMatch(text,/install-deps|npm |config\.json|approvalId|reconnect|cursor_continue/);
});

test('every command has a narrow Node grant and no old approval or SDK tool route',async()=>{
 for(const file of await readdir(new URL('commands/',root))){
  const text=await read('commands/'+file);assert.match(text,/allowed-tools: 'Bash\(node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/cursor-companion\.mjs" \*\)'/,file);
  assert.match(text,/^disable-model-invocation: true$/m,file);
  assert.doesNotMatch(text,/mcp__|cursor_continue|approvalId|awaiting_approval|writeFiles|public\/synthetic.only|desktopFallbackClientName|runtime\/bin|scripts\/setup\.mjs/i,file);
 }
 await assert.rejects(access(new URL('commands/continue.md',root)),{code:'ENOENT'});
});

test('task and review share one routing rule and stay read-only unless the user typed --write',async()=>{
 const task=await read('commands/task.md');const review=await read('commands/review.md');
 assert.match(task,/--write/);assert.match(task,/read-only/);assert.match(task,rule);assert.match(task,/host timeout/);
 assert.match(review,/read-only/);assert.match(review,/Never automatically fix/);assert.match(review,rule);assert.match(review,/host timeout/);
 assert.equal(task.match(rule)[0],review.match(rule)[0]);
 assert.match(task,/argument-hint: "\[--background\|--wait\] \[--model exact-variant\] \[--workspace path\] \[--write\] \[--trust-workspace\] \[--allow-fast\] \[--allow-hooks\] task"/);
 assert.match(review,/argument-hint: "\[--background\|--wait\] \[--model exact-variant\] \[--workspace path\] \[--write\] \[--trust-workspace\] \[--allow-fast\] \[--allow-hooks\] \[review focus\]"/);
});

test('setup and models give one invocation per hooks case',async()=>{
 const setup=await read('commands/setup.md');const models=await read('commands/models.md');
 assert.match(setup,setupCase);assert.match(models,modelsCase);
 assert.equal(setup.match(/cursor-elevated\.mjs" setup/g).length,1);
 assert.equal(setup.match(/cursor-companion\.mjs" setup/g).length,1);
 assert.equal(models.match(/cursor-elevated\.mjs" models/g).length,1);
 assert.equal(models.match(/cursor-companion\.mjs" models/g).length,1);
 assert.match(models,/argument-hint: "\[--json\] \[--allow-hooks\]"/);
 const task=await read('commands/task.md');const review=await read('commands/review.md');
 assert.equal(task.includes('cursor-companion.mjs" task'),false);
 assert.equal(review.includes('cursor-companion.mjs" review'),false);
});

test('removed commands, the agent and the skill are gone',async()=>{
 for(const relative of ['commands/rescue.md','commands/resume.md','commands/transfer.md','commands/adversarial-review.md','agents','skills']){
  await assert.rejects(access(new URL(relative,root)),{code:'ENOENT'});
 }
});

test('result text keeps the terminal result, cancellation and serving limits',async()=>{
 const text=await read('commands/result.md')+await read('commands/status.md')+await read('commands/cancel.md');
 for(const pattern of [/uncertain/,/hidden reasoning/i,/served model is not verified/,/cancel/i])assert.match(text,pattern);
});

test('Windows setup describes the actual official bundled launcher without requiring a standalone executable',async()=>{
 const setup=await read('commands/setup.md');assert.match(setup,/bundled `node\.exe`.*`index\.js`/);
 assert.doesNotMatch(setup,/standalone `cursor-agent\.exe`.*required|needs the vendor `\.exe`/);
});
