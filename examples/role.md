# A role, called when you need it

On trial in the author's workspace since November 2026. This kit's recommendation, not a vendor requirement.

A role is a job with decision rights. It stays out of the files every session loads. Call it with a command your tool already has, or with a sentence:

`Take the operations-lead role: read roles/operations-lead/ROLE.md and follow it.`

Use your role's name and path. A worker you start does not take the role. Give it a brief.

## Files

Each role has its own folder, for example `roles/operations-lead/`. Every path below is inside that folder, so two roles never share a state file.

`ROLE.md` holds what the role owns, what it does not own, its standing priorities, the start of a session, and the end of a session.

`CONTEXT.md` is a short table. Load the fewest rows that cover the task, then stop.

| The task is about | Load, in this order; stop when you have enough |
|---|---|
| The Friday huddle pack | The current huddle draft, then the open follow-up |
| A shelf or a returns sheet | That item's note only |

`memory/STATE.md` is where things stand. Give it a size limit, overwrite it, and keep one line per item: state, next step, owner, date, and a pointer. Detail stays in the project record.

`memory/DECISIONS.md` is one line per decision: date, decision, why, and what would reopen it.

`memory/LESSONS.md` is written only after a real incident, as "when you see X, do Y", and it names the incident.

## Before you hand back

Write the memory files before you hand back. If the tool cannot write them, say so and list the lines to add. Roles stay out of the always-loaded rules.

## Example: operations lead (fiction)

This role owns the office's recurring routines: the Friday huddle pack, the toner shelf, and the returns-sheet draft. It does not own hiring, spending, or anything a customer will see.

Standing priorities: the Friday huddle happens; one real item is finished before a new tool is built; the owner hears the outcome.

Start by reading `roles/operations-lead/memory/STATE.md`, then only the `CONTEXT.md` rows this task needs. End by updating state, adding a decision line if one was made, and adding a lesson only after something actually broke.
