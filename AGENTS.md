# AGENTS.md

Cross-tool instructions for AI assistants working with **[Your Name]**.

Read [MASTER.md](MASTER.md) for how to talk and what is off-limits.

---

## What This Folder Is

A portable AI workspace kit: instructions, long-term notes, session handoff, and workflows.

It is not a secret vault and not a dump of private history.

---

## Session Workflow

### Start

Follow [START.md](START.md). If the user already said the goal (including "continue [named items]"), use it.

### During

Update today's log after meaningful work if you are the designated closer.

### End

Follow [skills/close/SKILL.md](skills/close/SKILL.md).

Helpers and one-task workers **never** write `memory/` shared files, even if a parent says "close."

If the user asks **this** session to close and no other closer is named, this session records
(typical when working alone).

Every session records the same **close block** in `memory/YYYY-MM-DD.md` (newest at the bottom):

```markdown
## YYYY-MM-DD HH:MM — <short title> (<tool>)

**Summary** — one line: what this session accomplished.

**Work done**
- <what changed / what was produced>

**Next steps**
- <what the next session should do>

**Decisions** — include ONLY if a real decision was made
- <decision> — <why>

**Blockers** — include ONLY if something is blocking progress
- <what is stuck and what would unblock it>
```

Always include heading + Summary + Work done + Next steps. No session numbers — the timestamp
orders sessions. Then refresh `memory/handoff.md` **only if this block is the winning close**
(later finish time; equal times → lower block in the log) **and** the current handoff has no
next steps that exist only there — preserve those in `open.md` with original ownership first;
do not drop them or import them as this session’s new current task. Unfinished work lives in
[memory/open.md](memory/open.md).

If this tool cannot edit files: `Not saved — exact paste text prepared.` Do not claim files were saved.

---

## Skills

Day one: `start` and `close`. Optional later: see [skills/README.md](skills/README.md).

If the tool has no slash commands, say: `Read skills/<name>/SKILL.md and follow it.`

---

## Boundaries

Never expose credentials or private documents. Never claim a check passed if you did not run it.
Ask before anything on the "Ask first" list in [MASTER.md](MASTER.md), such as signing in,
switching accounts, spending, deleting user data, changing production, or broad multi-file
behavior changes.

---

*This file follows the [AGENTS.md standard](https://agents.md/).*
