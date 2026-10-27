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
- **Pick models by task.** Use a capable model you have for planning, judgment, and final
  review. Try a cheaper or faster setting on repeatable work only after comparing results.
  There is no universal best model and no rule to split usage evenly.
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
   Leave unrelated work alone. In BB 0.45.0, pending retries survive a server restart, so
   restarting the app does not cancel them. The workspace owner can check with
   `bb provider-retry status <thread-id>` and cancel with
   `bb provider-retry cancel <thread-id>`; replace `<thread-id>` with the affected thread's ID.
   Check status again before resuming or starting a replacement.
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
October 27, 2026; other references retain their earlier date. Vendor pages and app interfaces
change; re-check a detail before relying on it. The reasoning behind the October 27 changes
is in [FIELD-NOTES.md](FIELD-NOTES.md).

| Point | Basis |
|-------|-------|
| Start simple; add agents only when they clearly help | Vendor guidance: [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (Dec 2024); [OpenAI, A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) (Apr 2025) |
| Helpers need a complete brief; some start fresh, while forks inherit the conversation | Vendor docs: [Anthropic, multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (Jun 2025); [Claude Code subagents](https://code.claude.com/docs/en/sub-agents) |
| Parallel reading is safer than parallel editing | Vendor docs: [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents); [Claude Code agent teams](https://code.claude.com/docs/en/agent-teams) |
| Helpers multiply usage | Vendor docs: [Claude Code costs](https://code.claude.com/docs/en/costs); [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) |
| bb permission inheritance and pending retries | bb 0.45.0 official guides: [threads](https://github.com/get-bb/bb/blob/desktop-v0.45.0/packages/templates/src/templates/bb-guide-threads.md), [providers](https://github.com/get-bb/bb/blob/desktop-v0.45.0/packages/templates/src/templates/bb-guide-providers.md); checked Oct 8, 2026 |
| Other bb worktree and plugin guidance | September reference, bb 0.43.1: [environments](https://github.com/get-bb/bb/blob/desktop-v0.43.1/packages/templates/src/templates/bb-guide-environments.md), [configuration](https://github.com/get-bb/bb/blob/desktop-v0.43.1/docs/configuration.md), [Tasks](https://github.com/get-bb/bb/blob/desktop-v0.43.1/plugins/tasks/PLUGIN_OVERVIEW.md), [Workflows](https://github.com/get-bb/bb/blob/desktop-v0.43.1/plugins/workflows/PLUGIN_OVERVIEW.md); verify against your installed version |
| A hook can block before an action; after it, a hook cannot undo the action but can change what the model is shown | Vendor docs: [Claude Code hooks](https://code.claude.com/docs/en/hooks); [Codex hooks](https://learn.chatgpt.com/docs/hooks); checked Oct 27, 2026 |
| Apps and models on one subscription can share a usage pool | Vendor docs: [Cursor models and pricing](https://cursor.com/docs/models-and-pricing); checked Oct 27, 2026 |
| Fresh reviews caught problems that earlier passes missed; review rounds that added scope created new problems | The author's own project experience in 2026. Not a benchmark |
| Different-family review, one writer, three rounds, `unverified` labels, approval through the task, a brief's stop winning, a limit stopping one route | This kit's recommendation, not a vendor requirement |

No speed, quality, or cost benefit is measured or promised here.
