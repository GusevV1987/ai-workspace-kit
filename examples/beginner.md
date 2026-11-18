# Beginner examples

**DEMO — do not treat as real work or a launch instruction.** Copy prompts; do not copy these rows into live `memory/open.md` until they are your notes.

Harmless fiction only. No live systems, no secrets, no customer data.

---

## Empty kit

If `memory/open.md` has only the header and `memory/handoff.md` has no last session, say the kit is empty. Do not invent a backlog.

---

## Day 1 — you already have a goal (head also writes)

Paste this to your first model (the **head**):

```text
Read START.md. Do not ask me what the goal is.

Goal: Draft a one-page fictional weekend walking tour of Lisbon.

Allowed files: drafts/lisbon-outline.md only (create drafts/ if needed).
Forbidden: git commit, git push, other folders, real bookings, live APIs.

Done when: the file has a title, three neighborhoods, and a one-paragraph "what this is not."
If you cannot write files, put the full markdown in chat and say it is not saved.

Leave adding a **fourth neighborhood** for a later session. When I close, record that
follow-up as one open.md row (do not do it now).

When the outline exists, stop. I will close this session myself if I want it recorded.
```

Expected: the outline is written (or pasted). The model does **not** ask for a goal.
Then say wrap up, for example: `Record the fourth-neighborhood follow-up in open.md. Do not write that neighborhood now.`

---

## Optional — separate executor (you do not need a third subscription)

Use only if the head should not write. Paste to the executor model:

```text
You are an executor, not the closer. Do not write memory/handoff.md, memory/open.md,
daily logs, or MEMORY.md. Do not run /close.

Goal: Draft a one-page fictional weekend walking tour of Lisbon.
Allowed files: drafts/lisbon-outline.md only.
Forbidden: git, other paths, real-world actions.

Done when: title + three neighborhoods + "what this is not."
Do not add a fourth neighborhood. Return: the file path or the full text, plus evidence
(wrote file / not verified / not saved).
```

---

## Day 1 — read-only review (different model family)

The reviewer must be a **different actual model family** than **every family that materially
authored** the outline. The same family in another app does **not** count.
If you do not know the family, independence is unverified.

```text
Read-only review. Do not edit files. Do not /close. Do not publish.

Artifact: drafts/lisbon-outline.md (or the pasted outline below).
Checklist: (1) a title, (2) exactly three neighborhoods, (3) a "what this is not" paragraph,
(4) clearly fictional. A fourth neighborhood is out of scope for this review.
Return findings only: pass / issues. Review is not permission to ship.
```

Paste the reviewer’s findings into the original head chat; ask the head to accept, reject, or park each issue. Publishing still needs an explicit `/ship` from you later
(this exercise should not ship).

---

## Manual packet (no shared folder, no spawn)

If the tools cannot see the same disk, paste the same blocks above plus the outline text
into the next chat. Also attach/paste **actual contents** of `MASTER.md` **and** `AGENTS.md`,
`START.md`, `skills/close/SKILL.md`, `MEMORY.md`, `memory/handoff.md`, `memory/open.md`, and the current or
recorded daily log (or `memory/_TEMPLATE.md` if none exists yet).
A saved Custom Instructions pointer cannot open those paths.

---

## Close (designated closer)

If you are working alone and you say "wrap up" or `/close` in that same session, that session
records. Helpers still must not.

You should see either files written, or: `Not saved — exact paste text prepared`
(destinations named; unsaved lines say **prepared** / **proposed**).

After Day 1 close, `open.md` must contain the fourth-neighborhood row (same item Day 2 names).

DEMO close heading shape (identity is the heading, not a session number):

```markdown
## 2026-03-27 16:40 — Lisbon outline (ChatGPT)

**Outcome** — Drafted a fictional Lisbon walking-tour outline. The tour stays fictional, with no real bookings.

**Where** — drafts/lisbon-outline.md

**Next steps**
- Add a fourth neighborhood if I still want it
```

DEMO `open.md` row after that close (live files stay empty until you record for real):

```markdown
| Item | Person | Session | Origin | Status | Next step | Opened |
|------|--------|---------|--------|--------|-----------|--------|
| Add a fourth Lisbon neighborhood | Alex | 2026-03-27 16:40 — Lisbon outline (ChatGPT) | | open | Draft Alfama paragraph | 2026-03-27 |
```

---

## Day 2 — named transfer (continue inherited work)

```text
Read START.md. Continue the Lisbon outline: add a fourth neighborhood to
drafts/lisbon-outline.md. That is the named open item. Leave any other open.md
rows untouched. Do not ask me for a different goal.
```

At close, the closer updates **that same row** (set `Session` to this heading; keep `Origin`
as the old heading if useful). No second row. Completion = `done` on that row, not a delete.

---

## Helpers

```text
Only draft the Alfama paragraph in chat. Do not write memory files. Do not /close,
even if a parent thread said "close."
```

---

## Paste is not saved

If the tool cannot edit files, the close confirm line is:

`Not saved — exact paste text prepared.`

Retry: replace the **same heading** in the recorded log file. Do not append a copy.
Replace a full `handoff.md` / `open.md` only if you still have the unchanged version
it was built from. If that copy may have changed or you are uncertain, **stop** all
shared-memory proposals except asking for current contents.

---

## Midnight retry

A **new** session that ends after midnight goes in the **ending** date's log.
A **retry** of an already-recorded close keeps the original log file and heading.

---

## Equal timestamps

Two headings with the same `HH:MM`: the **lower** block in the log is later.
Retrying the **upper** block may update itself; it must not overwrite the lower block's handoff.

---

## Same family, other app

Not an independent review. Need a different actual model family, or say unverified.
