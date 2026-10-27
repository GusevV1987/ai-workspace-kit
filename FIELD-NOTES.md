# Field notes: let approved work finish

*October 27, 2026. Lessons from the kit author's own AI workspace. Not a benchmark.*

For teammates and fellow founders who already hand work to AI. New to the kit? Start with
[work in bb](BB-QUICKSTART.md) or [build a portable workspace](WORKSPACE-GUIDE.md).

We reviewed recent sessions for places where agents stopped to ask. Some pauses were
unnecessary: an agent asked again after a scoped approval, asked for access before checking a
connection that already worked, dropped its approved task for an unrelated sign-in prompt
instead of leaving that prompt to the owner, or parked a check it could have run right away.
Other stops were exactly right, and we kept them.

**In this kit:** [MASTER.md](MASTER.md) now says an approval carries through its task and
lists the steps that stay with the owner; [AGENTS.md](AGENTS.md) points to that list.
[ORCHESTRATION.md](ORCHESTRATION.md) and the [bb quickstart](BB-QUICKSTART.md#troubleshooting)
cover usage limits, sign-in, and recovery. The optional [`tdd`](skills/tdd/SKILL.md) and
[`investigate`](skills/investigate/SKILL.md) skills now size tests and diagnosis to the job.
If you keep a filled-in copy, carry the new lines across by hand.

## Keep going or ask?

| Situation | Keep going when | Stop and ask the owner when |
|---|---|---|
| Next step of an approved task | Effect, target, access, cost, and risk are unchanged | One of those changes, or the approval expired or was withdrawn |
| Access | An approved connection already works (check first), or the owner delegated this exact sign-in flow in writing | Any other sign-in; a new identity, credential, or wider access; or a step only a person can complete, such as a passkey |
| Send, publish, pay, or delete | That exact action and target were approved, and any required review passed | Anything beyond that |
| Usage limit on one tool | Independent work fits another approved, signed-in tool with confirmed room | The brief lists a usage limit as a stop; room is unknown; or it would mean switching accounts or seats, or spending more |
| A check you could run now | It needs nothing new: run it now, not after a later event | It needs access or effects nobody approved |
| A dated failure says it can't be done | An allowed route can be checked safely | Only a route your rules forbid would work |

A stop written into the task's brief wins over this table.

## An approval covers the task

The owner's "yes" covers the task's routine steps: ordering the work, re-running a failed
check, fixing your own mistakes. A materially different effect, target, access, cost, or
risk needs a new decision.

Example (fiction): you approve fixing the broken links in the draft returns sheet. Fixing
the fourth link is the same job. Emailing the sheet to customers is not.

Write the approval, its limits, and its stops into the [brief](examples/task-brief.md), not
only the chat, so a replacement thread or another tool can see them. Claude Code's guidance
notes that a limit stated only in conversation can get lost when a long chat is compacted.

Do not cure stalls with lines like "keep going until done." The same guidance says such
lines are more likely to cause over-work than fix a stall. Say what is approved, where the
real stops are, and which check shows the work is done.

## Keep the stops that matter

Some steps stay with a person: signing in, unless the owner delegated that exact flow in
writing, and then only within its limits; a new identity, credential, or wider access; steps
only a person can complete, such as passkeys and two-factor prompts; switching accounts,
organizations, or seats, or spending beyond what was approved; sending, publishing, paying,
or deleting anything the owner has not approved; and any review your process requires. We
removed none of these.

When a stop is real, ask once, with the exact decision, your recommendation, and what it
unblocks. Keep doing the parts that do not depend on it.

Being able to do something is not permission to do it, and no model can grant itself access.
One of our instruction files banned sign-ins outright; another kept a narrow sign-in flow the
owner had delegated. We restated that delegation, unchanged and with its limits, wherever the
ban appeared. A delegation covers only the exact flow it names, never another account,
service, or purpose. Claude Code's docs warn that a model may follow either of two
conflicting instructions, so keep each exception next to every copy of its rule.

## A limit stops one route, not all work

A usage limit or outage blocks only the affected tool and account. Independent work can
continue on another tool the owner already approved for this work and already signed in,
once you have confirmed it has room. Unknown room counts as none. If the brief lists a usage
limit as a stop, that stop wins: stop and ask, even if another route is open.

Another app or model is not automatically separate room. Cursor's current plans, for
example, share one usage pool across the editor, command line, cloud agents, and more; its
older plans split usage differently. Confirm which account is billed and which pool the
other route draws on.

This is not permission to switch accounts, organizations, or seats, buy credits, or resume
work someone deliberately paused. Moving the interrupted draft itself is a recovery: stop the
old writer and any queued retry, check what already happened, and continue in one place
([steps](ORCHESTRATION.md#before-interrupted-work-continues)). If another model family
continues it, every family whose work remains in the draft is a writer and cannot review it.
If no approved reviewer is left, hold the review.

## Keep rules, capabilities, and old failures apart

Four questions often get blended:

- **May we?** The owner's rules.
- **Is it supported?** The vendor's current documentation.
- **Can our setup do it?** A safe test on the installed version.
- **What failed, and when?** A dated incident.

Our notes had turned one dated failure of a review route into a belief that such reviews
could not run here at all. A different route that our rules already allowed was checked,
worked, and was documented. The failed route stays forbidden by our rules, and we did not
re-test it. A passing check on one route never loosens the rule on another, and an outdated
reason never licenses bypassing a rule.

## Size skills and checks to the job

Keep always-loaded instructions short, and put procedures in skills that load when needed.
Claude Code's guidance recommends this, and both Claude Code and Codex load a skill's full
text only when it is used. Caveats from the docs: descriptions of skills a model can pick by
itself still use context every session; Claude Code's imports organize a long file but do
not shrink what loads; and same-name, invocation, and reload rules differ between tools. We
have not finished slimming our own core files, and we measured no saving.

We also narrowed our test-first and debugging skills, and this kit's versions now match:

- New behavior and bug fixes start from a meaningful failing test where one is possible; a
  failing test or check you already have counts. A small, confirmed cause can skip the full
  investigation, not that step. Where no meaningful test applies, such as a formatting or
  configuration change, say so.
- Do not delete or break working code to recreate a test-first history. Tests added
  afterwards show coverage. To show that one catches its target failure, see it fail against
  a known failing version or case, or an isolated change in a throwaway copy. Report honestly
  which tests came afterwards and which you saw fail.
- Match checks to the behavior you changed, keep every check the project requires, and find
  an unknown cause with evidence, never a guessed account or credential change.

## Measure what your hooks catch

Instructions guide; they do not enforce. Hooks (scripts a tool runs before or after an
action) can enforce some rules, but only as far as you have tested them. Codex's docs call
them a guardrail, not a complete boundary.

In synthetic tests, our text-matching shell guard blocked harmless commands, missed risky
ones, and silently allowed actions when it could not read its input. A warning that ran
after each action used an output field the tool no longer read, so the model never saw it.
We fixed the input handling and moved to the documented feedback format. The fixes were
independently reviewed and exercised in fresh sessions with made-up cases. Wider gaps
remain, and we do not call this a sandbox.

If you use hooks:

- Test through real tool calls: a case that should be blocked, one that should pass, and one
  with malformed input.
- Decide what should happen when the hook itself fails. Depending on the tool and the
  failure, the action may go ahead.
- A hook that runs after an action can warn or change what the model is shown, but it cannot
  undo the action.
- Write down what the hook does not cover.

## "Done" means the whole task

Say whether the whole request is complete, in progress, or waiting, and on whom. A passed
test, a review, or a closed session proves only its own step. Saved, reviewed, installed,
and published are separate states. Review the exact version you publish
([independent review](ORCHESTRATION.md#get-an-independent-review)); a pass is advice, not
permission to publish. Then read back what went live.

Parallel helpers suit independent parts, and each artifact keeps one writer. We published a
reviewed snapshot from a separate, authorized copy without pausing unrelated work, confirmed
the commit signature, hooks, scanners, and automated checks, and read back the published
contents. We left a busy shared folder as it was, rather than freeze everyone to tidy it. A
separate copy is not a way around permission or review: the same approvals and checks apply.

## Limits

- We found the pauses by keyword search over incomplete session records. The pattern
  exists; how often it happens is unknown.
- Nothing here measures time, cost, or token savings, or ranks vendors or models.
- Fresh sessions in several tools completed small local tasks and recognized key approval
  boundaries. That is bounded evidence, not proof that every tool loads these files or will
  behave this way later.
- Hook tests used made-up cases only. Nothing here is a security guarantee.

## Sources

Vendor pages checked October 27, 2026. They change; re-check a detail before relying on it.

| Point | Basis |
|---|---|
| Unneeded pauses, the conflicting rule, the stale failure note, guard misses and false alarms | The author's own sessions and synthetic tests, October 2026 |
| Approval carries through a task; a brief's stop wins; a limit stops one route; rules, capabilities, and incidents kept apart; right-sized tests and diagnosis; whole-task status | This kit's recommendations, not vendor requirements |
| Instruction files are context, not enforcement; conflicting instructions; imports do not reduce loaded context | Vendor docs: [Claude Code memory](https://code.claude.com/docs/en/memory) |
| Short core instructions; procedures in skills; "keep going" lines; limits lost when a chat is compacted | Vendor docs: [Claude Code best practices](https://code.claude.com/docs/en/best-practices) |
| Skill descriptions use context; full text loads on use; same-name and reload rules differ | Vendor docs: [Claude Code skills](https://code.claude.com/docs/en/skills); [Codex skills](https://learn.chatgpt.com/docs/build-skills) |
| Hooks can block before an action; after it, they cannot undo it but can change what the model is shown; failure behavior varies; a guardrail, not a complete boundary | Vendor docs: [Claude Code hooks](https://code.claude.com/docs/en/hooks); [Codex hooks](https://learn.chatgpt.com/docs/hooks) |
| One usage pool shared across apps on current plans; older plans differ | Vendor docs: [Cursor models and pricing](https://cursor.com/docs/models-and-pricing) |
