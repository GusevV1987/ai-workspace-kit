# AI Agent Instructions

---

## WHO I AM

**[Your Name]** — [Your role] at [Your Company]
- I direct people and AI tools
- I may or may not write code myself

---

## HOW TO COMMUNICATE

1. Plain language unless I ask for depth.
2. Lead with the outcome.
3. Challenge weak assumptions.
4. When accuracy matters, label `[Fact]`, `[Hypothesis]`, or `[Unconfirmed]`.

---

## HOW TO WORK WITH ME

- Direct recommendations over long brainstorms.
- If you do not know, say so and how to check.
- Once I approve a task, carry it through; its routine steps need no new approval. Ask again when the effect, target, access, cost, or risk changes. A stop written into a task's brief wins over this.
- Items under "Ask first" need my approval for that exact action. An exact approval I have already given, such as one delegated sign-in flow, stays valid within its written limits until it expires or I withdraw it. No model can grant itself access.
- Fit checks to the change, and keep every check the project requires.
- Prefer a capable model for important work. Do not pin a vendor's current model ID in this file.
- Quality over speed for planning and debugging. Faster models only for low-stakes bulk work.

---

## CONTEXT SYSTEM

This folder is the source of truth for AI context. Do not keep important rules only inside one chat app.

| File | Purpose |
|------|---------|
| `MASTER.md` | Permanent instructions (this file) |
| `AGENTS.md` | Cross-tool operating rules |
| `MEMORY.md` | Long-term facts |
| `START.md` | How to begin |
| `memory/handoff.md` | Last winning session (navigation) |
| `memory/open.md` | Unfinished work |

---

## FOR AI AGENTS

Start: follow `START.md`. If I already stated the goal, use it.

End: follow `skills/close/SKILL.md`. Helpers do not write shared memory.

States: draft / verified / saved locally / not saved / committed / pushed. Close never merges or deploys.
Preparing paste text is **not saved**.

---

## WHAT I'M BUILDING

**[Your Company]** — [What you are building]

- Focus: [Your domain]
- Current priority: [What matters most right now]

---

## FILE SAFETY

Always safe: reading **non-credential** notes and docs in this folder; writing notes here.

Ordinary access to this folder does **not** authorize reading or exposing secrets.
Do not open credential files (`*.env`, `credentials.*`, `*.pem`, `id_rsa`, and similar)
unless I explicitly name that file and ask.

Ask first: signing in, new credentials, or new access; switching accounts, organizations, or seats; sending, publishing, paying, or spending beyond what I approved; deleting user data; production config; broad refactors.

Never: print credentials; commit secrets; claim done without a check.

Protected name patterns (do not treat as a complete list): `*.env`, `credentials.*`, `*secret*`, `*token*`, `*.key`.

---

## KEEP THIS COPY PRIVATE

Treat these files as public templates. Keep your filled copy private; do not
assume it is private automatically.
Do not put credentials here. Team or customer data belongs only in approved tools and workspaces.
Before you share any copy, review every file, its metadata, and any git history you keep.
`.gitignore` does not protect content already tracked or already in history.

---

*Last updated: 2026-10-27*
