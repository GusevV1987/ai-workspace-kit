# Field notes: spend the top model on judgment

*November 18, 2026. Lessons from the kit author's own AI workspace. Not a benchmark.*

For teammates and fellow founders who already hand work to AI. New to the kit? Start with
[work in bb](BB-QUICKSTART.md) or [build a portable workspace](WORKSPACE-GUIDE.md).

A colleague asked four questions. Is there a rule for which model to use? Can I see what one
request cost me? Does the app move my work to another model at a limit? Do the older models
in the list matter? The answers are in [MODEL-CHOICE.md](MODEL-CHOICE.md). These notes say
what the author measured in his own work, what he changed, and what is still unproven.

**In this kit:** a teammate page on [choosing a model](MODEL-CHOICE.md);
[job classes and five rules](ORCHESTRATION.md#place-work-by-job-class) for work across
several models; the [order of work](MASTER.md#order-of-work) in the rules template; a
three-line [session note](skills/close/SKILL.md); a [role template](examples/role.md);
and a page on [connectors](CONNECTORS.md). If you keep a filled-in copy, carry the new lines
across by hand.

## What we measured

One person's machines, August to November 10, 2026. These are token counts and requested
settings, not bills, and a requested setting is not proof of what a vendor served.

- **Most tokens were re-reading.** In every month, 94 to 98 percent of all counted tokens
  were cached re-reads of earlier context, and 0.3 to 1.5 percent were output.
- **Long lead conversations held most of the tokens.** On one vendor, tokens rose 7.0 times from August
  to October while requests rose 2.9 times: the difference was context per request. In one
  two-week stretch, five lead conversations that each ran 11 to 14 days used 62 percent of
  that vendor's tokens.
- **Top settings had become a habit.** Counting the first setting requested by every bb
  thread in October: 237 of 286 threads on one provider asked for its top reasoning level
  with the fast tier, 234 of 308 on a second asked for its flagship model, and only 65 of
  715 on the third asked for a small or mid-size model.
- **One setting overrode every choice.** A machine-wide setting forced the top reasoning
  level on every session of one tool, whatever the picker or the brief asked for. The picker
  kept showing the requested level, so nothing looked wrong.

## What we changed

Between November 10 and 14:

- **A lead and job classes.** The most capable model leads and keeps the hard work. The rest
  is placed by job class, under five rules
  ([Place work by job class](ORCHESTRATION.md#place-work-by-job-class)).
- **Rules name no model.** Model names left the rule files for one dated note
  ([Today's names](MODEL-CHOICE.md#todays-names) shows the shape). When a new model
  generation arrived a few days later, the rules did not change; the note did.
- **The forced setting was removed,** with a one-line self-check that shows a requested level
  now runs.
- **Meters are read before delegating,** as one word per subscription: room to spend, on
  pace, running hot, at the limit, or unknown. Unknown is not room.

## The first week after, honestly

In the week of November 11 to 17, the same machine counted about 70 percent fewer tokens
than in the week of November 3 to 9. The work was not the same, one seat appears in the
first week's records and not in the second, and requests whose machine was unknown are left
out of both weeks. We do not call it a saving, in tokens or in money.

Two counts moved in the direction the rules intend. Requests on one vendor's small and
mid-size models went from 13 of 5,958 to 325 of 5,547. The top model's share of that
vendor's tokens went from about a fifth to about four fifths. That fits a lead that now
runs on the top model, which is the rule: spend the top model on judgment, do not avoid it.
The records do not show what caused either change.

## Order of work

Name the outcome and the first real item. Get that one item through the whole path, rough,
with what already exists. Only then harden. "We are a startup, not an enterprise." Routine
technical choices are the agent's. Secrets, personal data, deletions, money, anything sent
or published, and live systems keep their checks. In this kit:
[ORDER OF WORK](MASTER.md#order-of-work) and
[Size the job before you build](ORCHESTRATION.md#size-the-job-before-you-build).

## Three deletions

On November 15 three habits stopped. Removing a step was cheaper than automating it.

- **Rule wording.** The owner's yes, on a plain before-and-after, replaced a second-model
  review of rule text. Code and settings in the same change keep their own review tier
  ([Review, tests, or skip](ORCHESTRATION.md#review-tests-or-skip)).
- **The session note.** It became three lines: outcome, where, next steps
  ([close](skills/close/SKILL.md)). Detail lives in the file the "where" line names.
- **The carry-over ritual.** Sessions no longer copy every old open item forward at start.
  An open item lives in its project record or task tracker and is picked up when it is the
  goal. That is the author's own adapted setup, where a task tracker holds the list. This
  kit's start and close steps still use [memory/open.md](memory/open.md); keep it unless you
  adapt those steps.

In the author's workspace the shared folder also updates itself from its remote at session
start. It never overwrites a local edit: when an edit collides, it stops and names the file.

## Roles on demand

A role such as a CTO is called when needed and stays out of the always-loaded rules. It
loads the smallest context that covers the task and keeps a small memory of its own: a state
page with a size limit, a decisions list, and lessons written only after real incidents. On
trial since November 13. Template: [examples/role.md](examples/role.md).

## One communication file

One file that every tool reads holds how the owner wants answers: the result first; for
multi-step work, whether the whole request is complete, in progress, or waiting; and at
hand-back an Actions block with the actions only the owner can take, at most one optional
suggestion, or "No action needed." This kit puts those lines in
[HOW TO COMMUNICATE](MASTER.md#how-to-communicate).

## Three apps, one way of working

The same roles run in bb, in the Claude desktop app and in Codex: a head, helpers with their
own briefs, and a reviewer from another model family
([The same roles in every app](ORCHESTRATION.md#the-same-roles-in-every-app)). Files cross
between apps. A chat crosses only when a tool copies it, and that needs its own approval.

## Limits

- Quality, time, and the effect of each rule on its own are not measured.
- The counts come from one person's machines and his mix of work. They show a pattern in that
  work, not what anyone else will see.
- Token counts are not plan allowances. Nothing here says how much of a subscription a
  request uses.

## Sources

| Point | Basis |
|---|---|
| Token shares, tokens against requests, the long conversations, the settings bb threads asked for, the forced setting | The author's own usage records and thread logs, August to November 10, 2026. Token counts and requested settings, not bills and not proof of what was served |
| The week after | The same machine, November 11 to 17 against November 3 to 9. Not a saving |
| Job classes, the five rules, the order of work, the three deletions, roles, the communication lines | This kit's recommendations, not vendor requirements |
| Limits, models, usage meters and bb's retry | [MODEL-CHOICE.md](MODEL-CHOICE.md#where-this-comes-from) |
