---
name: close
description: |
  Record this session in the shared memory folder. Use when: "/close", "wrap up",
  "done for today", "end session", or "that's it". Finishing a helper task is not
  a close. Helpers never write shared memory, even if a parent says "close".
version: 2.1.0
date: 2026-11-18
---

# Close Session

Leave the next session a clean starting point — in any tool.

**Close records. It does not start work, apply new rules, commit, or push.**

---

## Who may write shared memory

- **Helpers never write** `memory/handoff.md`, `memory/open.md`, daily logs, or `MEMORY.md`.
  Return results in chat (or a file the parent named). The parent records.
- If the user asks **this** session to close and no other closer is named, this session
  is the designated closer (typical when working alone). No extra ceremony.
- If someone else was named as closer, **stop** unless the user transfers that role to you.
- Written instructions are a convention, not a lock.
- Not knowing who owns an **unrelated** open row is not evidence of an active writer.
  Leave that row as-is.
- If you **see conflicting writes** (shared files changed since this close's last read),
  pause **all** shared-memory writes (log, handoff, `open.md`, `MEMORY.md`) and ask.
  There is no exception that still writes your own log block during a conflict.

---

## The Session Close Block (the one format every tool uses)

This is the **single source of truth** for how a session is recorded. The daily-log template
and `AGENTS.md` keep this block identical.

```markdown
## YYYY-MM-DD HH:MM — <short title> (<tool>)

**Outcome** — the result, in one or two plain sentences.

**Where** — the file, folder or link that holds the work.

**Next steps**
- <what is open and who owns it, or `- None`>
```

- Always include heading, Outcome, Where, and Next steps (`- None` is fine).
- A decision that was actually made during the session goes in `MEMORY.md` (Step 4). A blocker is a Next steps line.
- Time is local finish time. Add a zone if you move between timezones (`14:30 UTC`).
- **No session numbers.** The heading is the identity.

---

## Step 1: This session's log block

Recorded identity = **the heading + the log file first used for this block**.

- **New close:** if `memory/YYYY-MM-DD.md` for the **ending** date does not exist, create it
  from `memory/_TEMPLATE.md`. Append this block at the **bottom**.
- **Retry of an already-recorded close:** keep that **same file and same heading**, even if
  midnight has passed. Find the heading **anywhere** in that file. If the text is already
  identical, leave it. If this session's wording changed, update **only that block**.
  Never edit other blocks. Never append a second copy.

---

## Step 2: Winning session (same rule as `/start`)

Among recorded close headings:

1. Later finish time wins.
2. Equal or missing times → **lower block in the file wins**.

Rewrite `memory/handoff.md` **only if this block is the winner**.  
Retrying an older/upper block (including the same minute as a later heading) **must not**
replace a later session's handoff. If you are not the winner, leave handoff, say so, and
still update **this** block (when there is no conflicting write).

**Handoff-only leftovers:** if the current handoff lists next steps or carried items that are
not already rows in `open.md`, **do not replace the handoff** until those items exist in
`open.md` with their **original** ownership (Session = the old Last Session heading; do not
assign them to this session as a new current task). Do not drop them. Do not import them as
new work you just started. If you cannot preserve them that way, leave the handoff file unchanged.

Handoff is short navigation, not current-truth:

- last session title + date/time
- 1–3 next steps for *that* thread of work
- `Open work: see memory/open.md.` (no counts)

If next steps and `open.md` disagree, **`open.md` wins**.

---

## Step 3: `memory/open.md`

This file owns unfinished work. Do not replace it with last-session next steps.

You may:

- add rows **this session originated**
- update **named** rows the user transferred to this session ("continue the outline")

On a named transfer: keep the **same row** (no duplicate). Set `Session` to this session's
locator of the **same type** already on the row (heading vs heading, or thread ID vs thread ID).
Keep `Origin` as the previous locator if useful. You may mark that row `done`. Do not delete
rows. Leave **unrelated** rows untouched.

If the user did not name which items continue, ask. Do not take the whole table. Do not tell
them they must drop inherited work they asked to finish.

Compare locators consistently. Never treat a heading and a thread ID as the same key.

---

## Step 4: `MEMORY.md` only if already decided

Touch it only for a long-term fact that **already changed during this session**.
Do not make new decisions at close. Keep the file short.

---

## Step 5: Write or prepare paste — do not invent git

### If this tool can edit files

Re-read `memory/handoff.md`, `memory/open.md`, today's or the recorded log if it exists,
and (if you will touch it) `MEMORY.md`.
If those files **changed** since this close's last read, that is a conflicting write:
pause **all** shared-memory writes and ask. Do not still write your own log block.

If there is no conflict, write. Do not overwrite a newer handoff or someone else's
`open.md` rows. Named transfer is required before you retitle inherited rows.

**Do not** `git add .`. **Do not** commit or push unless the user already asked for that
**specific** action and named the files. Commit is not push.

### If this tool cannot edit files

Prepare exact text. Confirm: `Not saved — exact paste text prepared.`
Name each destination:

- `memory/YYYY-MM-DD.md` — this session's one close block (recorded file + heading)
- `memory/handoff.md` — **proposed** full file, only if Step 2 allows replacement
- `memory/open.md` — **proposed** row edits (full file only against a supplied unchanged copy)
- `MEMORY.md` — **proposed** lines, only if this session made a decision worth keeping (Step 4)

Replacement of a full file or full block is allowed only against that unchanged copy.
If the file may have changed: **stop** all shared-memory proposals except asking for
current contents. Retry of the same heading: propose replacing that block, do not duplicate.

---

## Confirm

```text
Session closed.
- Log: this session's block saved locally / prepared for paste (recorded file + heading kept on retry)
- Handoff: saved rewrite because this block won / left unchanged / proposed rewrite / proposed leave unchanged
- Open work: saved row changes / proposed row changes / none
- Long-term memory: saved yes/no / proposed yes/no
- Files: saved locally / Not saved — exact paste text prepared
- Git: none / committed (asked) / pushed (asked)
```

For unsaved paste, say **prepared** / **proposed**, never “updated” or “rewritten” as if the files changed.

Never say saved, committed, or pushed unless that actually happened.

---

`/ship` does not replace `/close`. After shipping, still close so the session is recorded.
Close does not commit unless the user asked to commit.
