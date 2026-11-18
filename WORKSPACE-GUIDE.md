# Build a portable workspace

For founders and tech-savvy people who want this folder to work in more than one
tool. Colleagues who only need a first task in bb should use
[BB-QUICKSTART.md](BB-QUICKSTART.md) instead.

**bb** organizes projects and conversations. The connected AI service (the
**tool**) provides access. The selected **model** does the work. You do not need
three subscriptions.

Written instructions are a convention. They do not enforce permissions.

Do not copy a private company’s internal machinery into this kit. Start small.

---

## Core files (what is true where)

| File | Holds |
|------|--------|
| [MASTER.md](MASTER.md) | How you want to be talked to; standing limits |
| [AGENTS.md](AGENTS.md) | Cross-tool operating rules |
| [START.md](START.md) | How a session begins |
| [skills/close/SKILL.md](skills/close/SKILL.md) | How a session is recorded |
| [MEMORY.md](MEMORY.md) | Long-term facts (keep short) |
| [memory/handoff.md](memory/handoff.md) | Last **winning** close — navigation, not current-truth |
| [memory/open.md](memory/open.md) | Unfinished work (wins if it disagrees with handoff) |
| `memory/YYYY-MM-DD.md` | That day’s session blocks |

Fill `MASTER.md` with your name and company in **your private copy**. Leave live
`MEMORY.md`, `handoff.md`, and `open.md` empty until they are real notes.

If `open.md` and handoff disagree, **open.md wins**.

---

## Customize only what you need

1. Copy this folder. Keep it private ([README.md](README.md)).
2. Put your name in `MASTER.md`. Do not pin a vendor’s current model ID there.
3. Point **one** tool at the folder (table below). Do not overwrite an existing
   rule file — add a pointer.
4. Run a real first task with a supplied goal. [examples/beginner.md](examples/beginner.md)
   is a copyable two-model walkthrough.
5. Add skills, agents, or extra context files only after you hit the same need
   twice.

---

## Connect a tool

| Tool | Pointer |
|------|---------|
| Claude Code | [examples/CLAUDE.md](examples/CLAUDE.md) — [memory](https://code.claude.com/docs/en/memory) |
| Cursor | [examples/cursor-rule.mdc](examples/cursor-rule.mdc) — [rules](https://cursor.com/docs/rules) |
| ChatGPT / chat-only | [examples/chatgpt-custom-instructions.md](examples/chatgpt-custom-instructions.md) — attach real files; Custom Instructions cannot read disk |
| Codex / repo tools | Root [AGENTS.md](AGENTS.md) — [docs](https://learn.chatgpt.com/docs/agent-configuration/agents-md) |
| bb | [BB-QUICKSTART.md](BB-QUICKSTART.md) (primary). Optional inject: workspace `.bb/AGENTS.md` ([bb configuration](https://github.com/get-bb/bb/blob/desktop-v0.49.0/docs/configuration.md)) |
| Anything else | `Read START.md and follow it` |

---

## One, two, or three roles

| You use | When |
|---------|------|
| **1 — head writes** | Everyday work. That same session wraps up if you say so and no other closer is named. |
| **2 — different family reviews** | Consequential drafts. Reviewer is read-only. Same family in another app does not count. You do not need a third paid seat. |
| **3 — optional executor or helpers** | When parts are independent and splitting saves time, or the head should not write files. The head may still write. Helpers never write shared memory and never close. |

Risk-proportional: a grocery list does not need a second family. A note that
will be sent or published does.

One writer of shared memory per close. Helpers return work in chat.

Choosing a mode, briefing helpers, costs, and recovering from interruptions:
[ORCHESTRATION.md](ORCHESTRATION.md). Which work stays with the lead:
[Place work by job class](ORCHESTRATION.md#place-work-by-job-class). Which model
for a request: [MODEL-CHOICE.md](MODEL-CHOICE.md).

---

## Bounded delegation (copy)

```text
Outcome: <what exists when this is done>
Allowed files/paths: <only these>
Done evidence: <what I will read to check>
Forbidden: sending, publishing, git push, other folders, live customer data
Do not write memory/handoff.md, memory/open.md, daily logs, or MEMORY.md.
Do not wrap up or /close.
```

Name the closer in the parent thread. Review is not permission to ship.

Fuller template (roles, budget, stop rule, restart point) with a filled example:
[examples/task-brief.md](examples/task-brief.md).

---

## Grow later

Add a skill, an agent card, or a `context/` note when you keep asking for the
same missing piece. Day-one skills are `start` and `close`. See
[skills/README.md](skills/README.md).

Keep always-loaded files short. When a rule file grows, move its reference detail to
a companion file that is read on demand, and leave a pointer.

A role such as a CTO can be called when needed instead of living in the always-loaded
rules: [examples/role.md](examples/role.md).

Connectors to your other tools: [CONNECTORS.md](CONNECTORS.md).
