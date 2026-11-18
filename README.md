# AI Workspace Kit

**Shared memory, clear ownership, and reliable handoffs for founders and teams using AI.**

Formerly **AI Memory Kit**.

**Portable working context for AI** — markdown files in a folder you keep.
A file-capable tool can read them. A chat-only tool needs you to attach or paste
the contents. Nothing here is auto-read or auto-synced into every AI.

> Companion to: [Every LLM is a genius with amnesia](https://gusevv1987.substack.com/p/every-llm-is-a-genius-with-amnesia)

No framework. No database. No vendor lock-in.

**bb** organizes projects and conversations. The connected AI service (the
**tool**) provides access. The selected **model** does the work. You do not need
three subscriptions.

---

## Two ways in

### 1. Work in bb (team path)

For colleagues who need a first useful task across models, in bb.

**Start here:** [BB-QUICKSTART.md](BB-QUICKSTART.md)

After bb and a provider are set up, run the supplied fictional office task,
get a second-family review, and wrap up locally. No coding.

### 2. Build a portable workspace (founder path)

For people wiring this folder into several tools and growing it on purpose.

**Start here:** [WORKSPACE-GUIDE.md](WORKSPACE-GUIDE.md)

Same files, tool-agnostic. Customize only what you need. [QUICKSTART.md](QUICKSTART.md)
is a short map of both paths and existing tool links.

---

## After a first task

| You want to | Read |
|---|---|
| Choose a model for a request, understand a usage limit, see your usage | [MODEL-CHOICE.md](MODEL-CHOICE.md) |
| Use a reviewer or helpers across several models | [ORCHESTRATION.md](ORCHESTRATION.md) |
| Let a model reach your chat, mail, calendar, or documents safely | [CONNECTORS.md](CONNECTORS.md) |
| Ask Codex or Grok for a review from inside the Claude desktop app | [CLAUDE-DESKTOP.md](CLAUDE-DESKTOP.md) |

These pages are background for people who already work this way. They are not a third way in.

The kit itself is Markdown. The one exception is optional: [CLAUDE-DESKTOP.md](CLAUDE-DESKTOP.md) describes two Claude Code plugins, one small adapter kept in [`plugins/cursor`](plugins/cursor/README.md) and one that OpenAI publishes. You can use everything else without installing either.

---

## Field notes

**November 2026:** [Spend the top model on judgment](FIELD-NOTES-2026-11.md). Which work
stays with the most capable model, and what the author measured. Read it after a first
task; it is background, not a third way in.

**October 2026:** [Let approved work finish](FIELD-NOTES.md). When AI agents should keep
going, which steps stay with a person, and what changed in this kit. Read it after a first
task; it is background, not a third way in.

---

## Keep personalized copies private

Treat these files as **public templates**. Keep your filled-in copy private;
do not assume it is private automatically.

- Do not put passwords, keys, or credential files here.
- Team or customer data belongs only in approved tools and workspaces.
- Before you share any copy, review **every file**, its metadata, and any git
  history you keep. `.gitignore` does not protect content already tracked or
  already in history.

Written instructions are not a lock. They do not grant access a tool does not have.

---

## How it works (short)

Start reads [START.md](START.md). Close follows [skills/close/SKILL.md](skills/close/SKILL.md).
Unfinished work lives in [memory/open.md](memory/open.md). Paste is **not saved**
until you put it in the folder. Git is not required to wrap up.

Two-model walkthrough (file-capable or attach/paste): [examples/beginner.md](examples/beginner.md).

After a first task: [combine a transcript and an image](examples/multimodal-huddle.md),
check the result, and resume from a saved checkpoint. Fictional inputs; no audio setup.

After your first task, if work needs a reviewer or helpers for independent parts, read
[ORCHESTRATION.md](ORCHESTRATION.md). Copyable brief: [examples/task-brief.md](examples/task-brief.md).

---

## License

MIT. See [LICENSE](LICENSE).

*Built by [Vladimir Gusev](https://gusev.ai).*
