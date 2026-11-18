# Work with more than one model

Optional. Do a first task before reading this:
[BB-QUICKSTART.md](BB-QUICKSTART.md) (work in bb) or
[WORKSPACE-GUIDE.md](WORKSPACE-GUIDE.md) (portable workspace). This guide is not a third way in.

**Multi-model** here means more than one AI model on one task: a writer, a reviewer,
and sometimes helpers. It is not about images or audio (that is *multimodal*).
For an optional mixed-media exercise, see [the multimodal huddle](examples/multimodal-huddle.md).

Nothing here installs, routes, or enforces anything. It is a way to brief, check, and
recover work. Your tools' own settings decide what a model can actually do.

---

## Pick a mode

Start solo. Move up only when the task needs it.

| Mode | Use when | Skip when | Example |
|------|----------|-----------|---------|
| **Solo**: one thread | Small, low-risk, and you can check it yourself | It will be sent, published, or relied on by others | Tidy an unsent grocery list |
| **Pair**: writer + independent reviewer | The output leaves your desk, or affects money, people, or records | Low-risk work you can check yourself in a minute. Consequential work gets review at any size | A memo that will go to customers |
| **Team**: head + helpers + reviewer | Parts are truly independent and splitting saves real time | Steps depend on each other, or helpers would edit the same file | Two independent comparisons that feed one recommendation |

A mode counts **roles**, not subscriptions:

- **Head** owns the goal, combines results, and accepts or rejects findings. The head may also write.
- **Writer** is the one role allowed to change a given file.
- **Helper** does one bounded part and returns it.
- **Reviewer** checks without editing and returns findings.
- **Closer** is the one thread that owns shared notes and wraps up when you ask.

One model can hold several roles. A pair needs approved access to a second model family
for the review; the other roles can share one model.

Rules that keep this safe:

- **One writer per file.** Helpers write only their own named file, or answer in chat.
- **One closer** owns the shared notes (`MEMORY.md`, `memory/`). Helpers and reviewers never
  write them. Wrap-up follows the kit's close procedure when you ask for it.
- **Reviewers do not edit.** A reviewer that edits becomes a second writer, and its review no longer counts.
- **Independence** means a different model family from every writer. The same family in
  another app is not independent. If you cannot confirm which family answered, write
  `independence unverified`.
- **One person accepts.** You, or the named owner, decide. A model's "pass" is advice.

---

## Place work by job class

This kit's recommendation, not a vendor requirement.

The lead is the most capable model you have for this kind of work. It owns the goal, the
decisions, reading every helper's result, and the answer to you. Hard work stays with it.
Hard work moves to another model only when that model is at least as capable for that task,
never because it is cheaper or its subscription has room.

| Job | What it looks like | Start with | Step up when |
|-----|--------------------|------------|--------------|
| **Routine** | Fetch, list, extract, reformat, inventory, a bulk read with a short answer. A quick look or a script can check it. | A tool or script first. Otherwise the smallest current model you have, at a low or medium reasoning level. Never a paid speed tier. | One check fails. |
| **Everyday** | Research, drafting, sweeps, analysis, routine code with tests, a second opinion. | A balanced current model. A stronger one when the brief is long or full of instructions. | One check fails, or the work turns out ambiguous. |
| **Hard** | Ambiguous design, hard debugging, a result that is hard to check, writing anything that will be formally reviewed. | The lead itself, or a model whose vendor documents it as at least as capable for this kind of task. | The highest setting only when the owner asks. |
| **Formal review** | The check on consequential work. | A reviewer from a different model family, started fresh ([Get an independent review](#get-an-independent-review)). | No step. |
| **Head** | The conversation the owner opened. | The owner's model and setting, kept. | No step. |

Unsure between two rows: take the lower one and write the check that would catch a miss.

1. **Keep the head lean.** Claude Code's documentation says it sends the full conversation
   with every request, so there the head's length drives its usage. Treat a long head the
   same way in any tool unless its vendor says otherwise. Keep one goal per head, read long files by section,
   and send bulk reading and long tool output to a helper that returns a short answer and
   a file path. After about a day of work, about 150 requests, or a second automatic
   summary of the conversation, save a short checkpoint
   ([examples/task-brief.md](examples/task-brief.md#optional-checkpoint-for-ongoing-work))
   and start a fresh conversation from it. For one request, see
   [Keep threads short](MODEL-CHOICE.md#keep-threads-short).
2. **Helpers start low and step up on evidence.** Give each helper one written brief and
   run its check. On a failure, do one bounded repair; if that fails, stop that helper,
   cancel its retries, and move one row up. Never start at the top to be safe.
3. **Faster service buys waiting time only.** A fast tier costs more allowance or separate
   credits, and in some tools turning it on changes the model. Use it when a person or a
   blocked step is waiting, never for routine work. Before turning it on, check which model
   you will get and how your plan bills it. See
   [Reasoning level and Fast mode](MODEL-CHOICE.md#reasoning-level-and-fast-mode).
4. **Send work where there is room.** Before delegating, read each subscription's usage
   meter ([See your usage](MODEL-CHOICE.md#see-your-usage)). Room decides where routine and
   everyday work goes. It never moves the lead or the hard work, and it never changes a
   setting. Unknown room is not room.
5. **One independent check, sized to risk.** One check is enough, and its size follows the
   risk. Use the triage under [Get an independent review](#get-an-independent-review)
   ([Review, tests, or skip](#review-tests-or-skip)). For consequential work, reserve the
   reviewer before you choose the writer: an approved reviewer whose model family will write
   none of it. If you have only one family, use your team's human review and leave the
   independent model review pending.

Rules name no model. Models change with every release. Keep model names out of rule files.
Keep one dated note of today's names and settings
([Today's names](MODEL-CHOICE.md#todays-names)) and refresh it on a release, an app
upgrade, or a failed run, from the vendor's current page. Older names that remain in a
picker are in [Older models in the picker](MODEL-CHOICE.md#older-models-in-the-picker).

Teammates who only need to choose a model for a request read
[MODEL-CHOICE.md](MODEL-CHOICE.md#pick-the-model-for-the-request).

## Size the job before you build

Name the result and the first real item. Get that one item through the whole path, rough,
with what you already have. Only then harden.

Before you build tooling, write five lines: the outcome, what is out of scope, the chosen
approach and its risks, the evidence that will show it works, and the budget. Default to
the thinnest thing that works, often a written procedure. Stop and re-plan at the third
rework or re-review cycle on one artifact, or when you are fixing the scaffolding instead
of the task.

## Write a brief

Do not assume a helper receives your chat. Put the original inputs in the brief or in files
it can open. Some helpers do inherit the conversation, such as forks and some built-in
subagents, so check how your tool shares context before you delegate. Always start a
reviewer fresh: a new conversation, not a fork. Copy the template and the filled example in
[examples/task-brief.md](examples/task-brief.md). Tiny tasks need only its short form.

- Freeze the brief before work starts. Change it on purpose, not along the way.
- If a helper thinks the brief is wrong, it stops and says so. It does not quietly widen the job.
- A shared folder can give another thread access to **saved files**, never to your
  conversation. If source notes exist only in one chat, paste or save them for the next thread.

---

## Get an independent review

### Review, tests, or skip

This kit's recommendation, not a vendor requirement. Sort the change first.

- **Review.** Anything sent, published, paid, or deleted. Access, money, people, records,
  or live systems. A different family reviews it, at any size.
- **Tests carry.** Routine bounded work that a test suite fully exercises ships on green
  tests, and you say so.
- **Skip.** Typos, comments, formatting, and scratch.

A change to the wording of your own rules or skills is approved by the owner, shown before
and after in plain words. A second model's pass does not replace that yes. Code and
settings in the same change keep their own tier.

1. Start a **new** conversation for the reviewer, not a copy or fork of the writer's.
2. Give it the original inputs, the exact artifact (file path or pasted text), and the checklist.
3. Ask for findings only: pass or issue, with evidence for each.
4. Bring the findings to the head, who accepts, rejects, or parks each one.
5. If the artifact changes, review the changed version. Later rounds focus on the listed
   fixes and anything they broke, and still report any newly found breach of the checklist
   or of safety.

Stop after three rounds. Stopping never turns an unresolved blocker into a pass; the work
stays unaccepted. A second rejection of the same plan or document usually means the task is
too big: shrink it or ask the owner. If the result is a page, slide, or PDF, check the
rendered output, not only its source text. Review never grants permission to send, publish, or pay.

A ready-made review prompt is in [BB-QUICKSTART.md](BB-QUICKSTART.md), step 4.

---

## Split work across helpers

- Split only independent parts: separate sources, separate questions, separate files.
- Prefer parallel **reading**, such as research, comparisons, or reviews from different angles.
  Parallel **writing** is risky: two helpers editing the same file overwrite each other.
- Give each helper its own brief: outcome, inputs, the one file it owns, what to return, when to stop.
- Start with one or two helpers. Do not let helpers start helpers of their own.
- Helpers return evidence: file path, what they checked, what is still unverified. The head
  combines results; the writer writes the final artifact.
- Some tools can start helpers inside one conversation (Claude Code and Codex call them
  subagents). Depending on the tool, they start fresh or inherit your conversation. They can
  be harder to watch and stop, and each one still uses your plan or credits.

---

## In bb

| bb | Use it for |
|----|------------|
| **Task** (Tasks plugin) | The one authoritative brief and its status. Attach helper threads and result files to it. |
| **Thread** | One conversation. It can hold many turns, including retries of a failed turn. A parent thread is notified when a child thread completes, fails, or is interrupted. |
| **Helper** | A visible child thread. Some providers also have built-in subagents inside a thread; each product shows them differently. |
| **Workflow** (Workflows plugin) | An optional, repeatable chain of steps. Its worker threads are hidden from the sidebar. Not needed to start. |
| **Environment** | Where the files live. **Project checkout** is your folder. **Worktree** is an isolated Git copy; by default it holds tracked files, and a repo's own setup can add more. Check that needed inputs are there, and never copy credential files in. |

A working sequence, all in the app:

1. **Owner.** Decide who accepts the result and which thread closes.
2. **Brief.** Keep one copy: a task card if Tasks is installed, otherwise a file such as
   `drafts/brief.md`, or the first message of the thread.
3. **Writer.** Start one thread on the folder with the brief.
4. **Helpers (team only).** Start each as a child thread with its own brief. Attach it to the
   task if you use Tasks. Keep helpers visible.
5. **Review.** Start a new thread and choose a model from a different family in the model
   picker. Use a new thread, not a fork: a fork copies the writer's conversation.
6. **Accept and wrap up.** The head decides on findings; the closer wraps up in its own thread.

The brief and this sequence need no new subscription, terminal, or plugin. The review step
still needs approved access to a second model family. Tasks and Workflows are optional
plugins that the workspace owner turns on deliberately. Tasks is added from Plugins → Browse
plugins; Workflows is enabled under Settings → Installed plugins. Without them, use a brief
file and ordinary threads.

Know these before you start:

- **Same folder, shared saved files.** Threads on one folder may be able to open its saved
  files, including your notes, as far as their permissions allow. Use only an approved folder,
  holding only data those models may see.
- **Permission modes.** bb's modes include `accept-edits`, `auto`, and `full`; what a thread
  offers can vary by provider. None of these is a read-only mode. A child inherits permissions by default, but explicit
  child settings can override that default; nesting is not a permission cap. Host restrictions
  still apply. Check each child's actual mode. "Read-only" is part of the reviewer's brief,
  so check afterwards that no files changed. Never switch to `full` to unblock a helper or reviewer;
  fix the brief or ask the owner.
- **The picker shows what you asked for.** It is not proof of which model answered. If the
  family matters and you cannot confirm it, write `independence unverified`.

---

## The same roles in every app

The roles above are the same in each app. What changes is how a helper is started. This
kit's recommendation, not a vendor requirement. The two inheritance paragraphs are what
the vendor pages say, and no further.

| App | Helpers | Independent check |
|-----|---------|-------------------|
| **bb** | Visible child threads. Start each one with the provider, the model, the reasoning level, and the speed tier named. | A reviewer from another family, started fresh. |
| **Claude Code and the Claude desktop app's Code tab** | Built-in subagents, with the model and the reasoning level set per job. | A reviewer from another family, started fresh. |
| **Codex and the ChatGPT desktop app** | Built-in subagents, with the model and the reasoning level named. | A reviewer from another family, started fresh. |

Name the model and the reasoning level on every helper.

Claude Code, read November 18, 2026
([subagents](https://code.claude.com/docs/en/sub-agents)): by default, a subagent you define
runs on the same model as the conversation that starts it. When more than one source sets
a model, the page's order is the call, then the subagent's own model field, then
`CLAUDE_CODE_SUBAGENT_MODEL`, then the main conversation's model. On the main
conversation's model, a subagent with no effort of its own runs at the level you pick in
the session. On another model, that level does not apply. Set the subagent's effort to
choose it.

Codex, read November 18, 2026
([subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)): if you do not
configure a subagent's model or its reasoning effort, it inherits the parent agent's model
and reasoning effort. When more than one source sets them, a custom agent file wins; before
it, the page's order is an explicit spawn value, then the `[agents]` default, then the
parent's value. If a spawn request or an `[agents]` default selects a model and neither
sets a reasoning effort, the subagent uses that model's default reasoning effort.

A helper from another vendor is an external job. Give it a brief and files, never an
assumed shared conversation. Files cross between apps. A chat crosses only when a tool is
built to copy it, and copying a chat to another vendor needs approval for everything in
that chat.

---

## Permissions and costs

- **Instructions are not locks.** Only a tool's own permission, sandbox, or hook settings
  enforce anything, and a hook only as far as you have tested it. Find those settings before
  the first task. A hook that runs after an action cannot undo it; it can only warn or change
  what the model is shown.
- **Approval carries through the task.** Its routine steps need no new approval. Ask again
  when the effect, target, access, cost, or risk changes materially, or when the approval has
  expired or been withdrawn. Write the approval and its limits in the brief. A stop written in
  the brief wins over any general permission here.
- **Some steps stay with the owner:** signing in, unless the owner has delegated that exact
  flow in writing, and then only within its limits; a new identity, credential, or wider
  access; steps only a person can complete, such as passkeys or two-factor prompts; switching
  accounts, organizations, or seats; spending beyond what was approved; sending, publishing,
  paying, or deleting without approval; and any required review. No model can grant itself
  access. Before asking for access, check whether an approved connection already works.
- **Least access.** Reviewers and researchers only read. Use read-only permissions where the
  tool offers them; otherwise confirm nothing changed. This kit recommends giving helpers
  no broader access than their task needs; the parent relationship does not enforce that.
- **No secrets.** Never paste passwords or keys into a brief. Never copy credential files into
  a helper's folder or a worktree. Ask the owner for approved access.
- **Usage adds up.** Every helper and reviewer runs its own conversation on your plan or
  credits, so running several at once multiplies usage.
- **A limit stops one route.** A usage limit stops work on the tool and account that hit it.
  Keep the draft and report which account and limit stopped the work. If the brief lists a
  usage limit as a stop, that stop wins: stop and ask the owner. Otherwise, independent work
  may continue on another tool the owner already approved for this work and that is already
  signed in, once you confirm it has room; unknown room counts as none. Another app or model
  on the same subscription may draw on the same pool. A model must not, on its own, switch
  accounts, organizations, or seats, buy credits, or use another tool to resume work someone
  deliberately paused. Room left on one account or meter does not cover another.
  The owner switches accounts or seats by hand. A model never does. A capped seat does not
  stop work that another approved, signed-in tool can do. Which limit was hit decides what
  helps: see [When you hit a limit](MODEL-CHOICE.md#when-you-hit-a-limit).
- **Pick models by task.** See [Place work by job class](#place-work-by-job-class).
- **Effort, delegation, and speed are separate settings.** Deeper reasoning, letting a model
  start its own helpers, and faster service are different switches, and tools name them differently.
- **Measure what matters:** accepted quality, total time including review and rework, and the
  usage you can actually attribute. Do not claim savings you did not measure.

---

## When something breaks

Re-read the brief and the current files first. Files are the record; chat memory is not.

### Before interrupted work continues

Use these steps, in order, for a usage limit, a failed helper, or any stopped writer.
The interrupted work does not continue, and no replacement starts, until step 3.

1. **Stop the affected writer first.** Check its status: an automatic retry may already be
   running. Stop that thread, cancel its pending retry, and confirm it is no longer running.
   Leave unrelated work alone. In bb 0.49.0 the automatic retry continues the failed turn in
   the same thread, with the model selection it had. A turn gets at most four automatic
   retries. A reset farther away than the configured maximum wait (six hours by default) is
   not retried. A retry may run after the first attempt already produced output or used
   tools, so a queued retry is not proof that nothing happened. "Handoff to new thread" is a manual button: it opens a new thread that
   refers to the old one, and you choose the provider and model. It does not replace this
   step, so check and cancel the old thread's queued retry yourself. In bb 0.49.0 a pending
   retry survives a restart, so restarting the app does not cancel it. The workspace owner
   can check with `bb provider-retry status <thread-id>` and cancel with
   `bb provider-retry cancel <thread-id>`; replace `<thread-id>` with the affected thread's
   ID. Check status again before resuming or starting a replacement.
2. **Reconcile what happened.** Read the partial output and the saved files, and treat them
   as `unverified: interrupted`. If anything may already have been sent, published, paid, or
   deleted, check the sent mail, the published page, or the payment record. If you cannot
   tell, keep the work stopped and ask the owner; do not repeat it, even through a retry.
3. **Resume in exactly one place.** Continue that same thread or start one replacement, never
   both. Check the partial work against the brief before building on it.

**Usage limit mid-draft**

1. Keep the partial draft. Report the account and the limit. Do not sign in to another
   account or switch accounts.
2. If the brief lists a usage limit as a stop, stop as it says and ask the owner. Otherwise,
   work that does not need this tool may continue; see
   [Permissions and costs](#permissions-and-costs).
3. Before the draft continues anywhere, including on the same tool after the limit resets,
   complete the three steps above. Moving it to another approved tool is the single
   replacement those steps allow, made only after the old writer is stopped and its effects
   are reconciled.
4. If another model family continues the draft, every family whose work remains in it counts
   as a writer, and none of them can review it. Another app of the same family is not a new
   family. If no approved reviewer from another family is left, hold the review.

**Helper failed, stopped, or went quiet**

1. Read that helper's own status and last output. The real error is usually there.
2. Finished or idle does not mean checked.
3. Follow the steps above, then continue in exactly one place.

**Reviewer output lost**

1. Recover saved findings if they exist: a file, a task comment, or the thread itself.
2. If none exist and the artifact is exactly unchanged, run the same review in a new thread
   with a different-family reviewer. Never write "pass" from memory.
3. If the artifact changed, review the changed version.

**Afterwards.** One closer records the outcome at wrap-up. **Saved** means the file was read
back. Text that exists only in chat is `not saved`.

---

## Where this comes from

Core references checked in September 2026. BB permission inheritance and pending-retry
behaviour rechecked against 0.45.0 on October 8, 2026. Hook and usage-pool details checked on
October 27, 2026; other references retain their earlier date. Model placement, limits, and
handoff were rechecked on November 18, 2026 against bb 0.49.0. Vendor pages and app
interfaces change; re-check a detail before relying on it. The reasoning behind the October
27 changes is in [FIELD-NOTES.md](FIELD-NOTES.md). The November 18 changes are in
[FIELD-NOTES-2026-11.md](FIELD-NOTES-2026-11.md).

| Point | Basis |
|-------|-------|
| Start simple; add agents only when they clearly help | Vendor guidance: [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (Dec 2024); [OpenAI, A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) (Apr 2025) |
| Helpers need a complete brief; some start fresh, while forks inherit the conversation | Vendor docs: [Anthropic, multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (Jun 2025); [Claude Code subagents](https://code.claude.com/docs/en/sub-agents) |
| Parallel reading is safer than parallel editing | Vendor docs: [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents); [Claude Code agent teams](https://code.claude.com/docs/en/agent-teams) |
| Helpers multiply usage | Vendor docs: [Claude Code costs](https://code.claude.com/docs/en/costs); [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) |
| bb permission inheritance and pending retries | bb 0.45.0 official guides: [threads](https://github.com/get-bb/bb/blob/desktop-v0.45.0/packages/templates/src/templates/bb-guide-threads.md), [providers](https://github.com/get-bb/bb/blob/desktop-v0.45.0/packages/templates/src/templates/bb-guide-providers.md); checked Oct 8, 2026 |
| Other bb worktree and plugin guidance | bb 0.49.0: [environments](https://github.com/get-bb/bb/blob/desktop-v0.49.0/packages/templates/src/templates/bb-guide-environments.md), [configuration](https://github.com/get-bb/bb/blob/desktop-v0.49.0/docs/configuration.md), [Tasks](https://github.com/get-bb/bb/blob/desktop-v0.49.0/plugins/tasks/PLUGIN_OVERVIEW.md), [Workflows](https://github.com/get-bb/bb/blob/desktop-v0.49.0/plugins/workflows/PLUGIN_OVERVIEW.md); the September 2026 check used 0.43.1; verify against your installed version |
| A hook can block before an action; after it, a hook cannot undo the action but can change what the model is shown | Vendor docs: [Claude Code hooks](https://code.claude.com/docs/en/hooks); [Codex hooks](https://learn.chatgpt.com/docs/hooks); checked Oct 27, 2026 |
| Apps and models on one subscription can share a usage pool | Vendor docs: [Cursor models and pricing](https://cursor.com/docs/models-and-pricing); checked Oct 27, 2026 |
| Fresh reviews caught problems that earlier passes missed; review rounds that added scope created new problems | The author's own project experience in 2026. Not a benchmark |
| Different-family review, one writer, three rounds, `unverified` labels, approval through the task, a brief's stop winning, a limit stopping one route | This kit's recommendation, not a vendor requirement |
| bb 0.49.0 handoff and provider retry | bb 0.49.0 guides, read November 18, 2026: [threads](https://github.com/get-bb/bb/blob/desktop-v0.49.0/packages/templates/src/templates/bb-guide-threads.md), [plugins](https://github.com/get-bb/bb/blob/desktop-v0.49.0/packages/templates/src/templates/bb-guide-plugins.md). On the author's bb 0.49.0, the provider-retry skill says a pending retry survives a restart. Those two guides do not repeat that sentence |
| A helper with no model of its own can run as its parent | Vendor docs, read November 18, 2026: [Claude Code subagents](https://code.claude.com/docs/en/sub-agents); [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents). Worded in [The same roles in every app](#the-same-roles-in-every-app) only as far as those pages go |
| Claude session and weekly limits; fast mode billed apart from the allowance | Read November 18, 2026. The session-limit and weekly-limit messages are a seat window shared across models ([costs](https://code.claude.com/docs/en/costs)). Weekly limits apply across models, and some plans also have a separate weekly limit for one model ([usage and length limits](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work)). On Claude Code subscription plans, fast mode is usage credits and is not included in the subscription rate limits ([fast mode](https://code.claude.com/docs/en/fast-mode)). Check your vendor for other plans |
| Job classes, the five rules, rules that name no model, the triage, the owner's yes on rule wording | This kit's recommendation, from the author's own usage records ([November field notes](FIELD-NOTES-2026-11.md)) |

The job classes and rules rest on the author's own records. No speed, quality, or cost benefit is promised.
