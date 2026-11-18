# Choose the model, keep your allowance

For anyone who picks a model in a message box. No coding.

A subscription gives you a usage allowance, not unlimited use. This page covers which model
and reasoning level to choose for a request, what uses the allowance up, what you can see,
and what to do at a limit. If you run helpers and reviewers across several models, the
fuller version is [Place work by job class](ORCHESTRATION.md#place-work-by-job-class).

Checked on November 18, 2026 against bb 0.49.0 and the vendor pages listed
[at the end](#where-this-comes-from). The examples use Claude plans, because that is where the
questions came from. Apps and plans change; re-check a detail before relying on it.

---

## The short version

1. Use the smallest current model that can do the request. Step up one size after a failed
   check. The top model is for hard reasoning, not for fetching.
2. On Claude, start at a medium reasoning level and raise it when the work is hard to
   check. Other vendors name their own starting level.
3. Keep Fast mode off unless the wait matters and the extra spend is approved.
4. One goal per thread. Start a new thread when the goal changes.
5. Look at your usage before a big job.
6. When a limit stops you, read which limit it names. The answer depends on it. bb may
   queue a retry of the same message; look for it above the message box. It does not move
   your work to another model. If the stopped request was writing, sending or paying, stop
   it and check what already happened before anything continues.

---

## Pick the model for the request

| The request | Start with | Reasoning level on Claude |
|---|---|---|
| **Routine.** Look something up, list, extract, reformat, translate, or summarize a text you will skim to check | The vendor's smallest current model | Low or medium |
| **Everyday.** Draft a document or a message, research, analyze, compare | The vendor's balanced current model | Medium for a draft you can check at a glance. High when you compare sources or a mistake would be costly |
| **Hard.** Conflicting evidence, many instructions that depend on each other, long work with many steps, or a judgment you cannot easily check | The vendor's large model | High |
| **Hardest reasoning.** A hard problem where the large model's answer still fails your check | The top model your plan includes | High |

The last column is for Claude models. Other vendors advise differently for their own models:
OpenAI's page says of its small model, "For Luna, start with High."

Example (fiction): "Extract the dates from this lease and quote the line for each" is routine.
"These two letters give different move-in dates; explain which is right and why" is everyday
at a high reasoning level, or hard. Sending the conclusion to the tenant is not a model
choice at all: the responsible person checks it against the sources first.

Three habits make the table work:

- **Start low and step up on evidence.** If the answer fails your check, ask for one repair.
  If that fails too, move one row up. Do not start at the top "to be safe".
- **Say what done looks like.** A request with a clear check ("a table with these four
  columns", "at most one page", "quote the source for every claim") lets a smaller model
  succeed.
- **Choose by what you can check.** Can you say where a wrong answer would be caught? Then
  start small. Start on the stronger model for unclear work you cannot easily check.

A stronger model does not replace a review. Work that leaves the company is checked against
its sources by the person responsible, whichever model wrote it
([independent review](ORCHESTRATION.md#get-an-independent-review)).

The names behind each row change with every release. The names on the day this page was
checked are in [Today's names](#todays-names).

Why it matters: a larger model uses more of the same allowance for the same request.
Anthropic's guidance for Claude plans says a large model "uses meaningfully more of your
quota" than the mid-size one. Claude Code's documentation puts it this way: the mid-size
model "handles most coding tasks well and costs less", and the large one is for "complex
architectural decisions or multi-step reasoning".

**Check that the top model is in your plan.** On some seat types the top model is not part of
the included allowance at all and is billed from the first request. Anthropic's page says
of Team Standard seats and Pro plans: "Fable models aren't included in your plan's usage
limits." Ask your workspace owner which seat you have before you select it.

---

## Reasoning level and Fast mode

These are two separate switches, and neither is the model.

**Reasoning level** (some apps say *effort*) is how long the model thinks before it answers.
A higher level uses more of your allowance; Anthropic's page on usage limits says "Higher
effort uses more tokens." The level names and the right starting point belong to each model.
For the Claude models above, medium is a sound start for a draft you can check, and Claude
Code's documentation warns that the highest level "is prone to overthinking". Other vendors
advise differently, as the OpenAI example under the table shows. Read the vendor's page for
the model you use. bb starts a new thread at medium unless your project
remembers another setting.

**Fast mode** answers sooner for a higher price. Not every model has it. In Claude Code,
when the model you are on does not support it, "turning it on also switches your model", so
check which model you end up on. On Claude subscriptions Fast mode is "available via usage
credits only and not included in the subscription rate limits", so it spends money on top of
the plan, and on a team plan it is the organization's money. Codex counts its Fast speed as
a multiple of the normal allowance, and the multiple differs by model; read its pricing
table before you turn it on. Leave Fast off. Turn it on only when the wait matters, you know
which model and which price you are agreeing to, and whoever pays has agreed.

---

## Keep threads short

In a Claude thread, a long conversation is sent again with every request. Claude Code's
documentation says it "sends your full conversation with every request", so "a one-line
question in a session that has been open all day still draws usage for the whole
conversation". In the kit author's own records from August to November 10, 2026, between 94
and 98 percent of all counted tokens were this kind of re-read of earlier context
([November field notes](FIELD-NOTES-2026-11.md)). Those are token counts on one person's
machines, not a measure of anyone's plan allowance.

- **One goal per thread.** A new goal gets a new thread.
- **Start over at a natural break.** When a long piece of work continues tomorrow, save three
  things to a file: what is done, where it is, and what comes next. Start a new thread from
  that file. In bb, **Handoff to new thread** at the bottom of the model picker prepares a new
  thread that refers to the old one; you choose the provider and model, add what to continue,
  and send.
- **Point, do not paste.** Name the file and the part you need instead of pasting the whole
  document into the chat.
- **Send bulk reading to a helper.** A separate thread on a small model reads the long
  material and returns a short summary with the places it found things. The helper's own
  requests still count against your allowance.
- **See what fills the thread before you switch tools off.** Connected tools add some text
  to a conversation. `/usage` and `/context` in a Claude thread show what is actually taking
  space.

---

## See your usage

What you can see is the meter of the whole subscription, not the cost of one request.

- **Plan meters.** Start with Claude's Settings → Usage. It shows how much of each limit you
  have used and when it resets: on most plans a five-hour session and a week, and on some
  plans a separate weekly meter for the top model. Plans differ, so read the bars your own
  plan shows. The meters cover everything you do on that subscription, in every Claude app
  and on every model.
- **Inside a thread.** Where the app offers it, type `/usage` in a Claude thread and send it.
  In a bb 0.49.0 thread on the Claude provider, on the author's team seat on November 18,
  2026, it printed the plan meters and a breakdown of what had been driving usage, headed
  "Approximate · sessions on this machine only · shares overlap". That breakdown comes from
  local history on one computer, and its shares can add up to more than 100 percent.
- **One request.** No screen or command shows "this request used N percent of my week". For a
  rough estimate, take a fresh reading of the meter, run the request with nothing else
  running, and take a fresh reading again before the meter resets. A change of zero can hide
  a small request. A reading may not be fresh: Claude Code's documentation says that when it
  cannot load your plan limits, `/usage` shows the last bars it loaded within the past 60
  minutes, with a "Showing last-known usage" note.
- **Not the same thing.** A thread's context meter shows how full that one conversation is.
  It says nothing about how much of your plan is left.

---

## When you hit a limit

**Read which limit the message names.** The right move depends on it.

| The message names | What it means | What helps |
|---|---|---|
| The session (five-hour) limit or the weekly limit | The allowance shared by every model on your seat is used up. Claude Code's documentation: "a seat-based usage window on a subscription plan, shared across all models" | Another Claude model does not bring access back. Wait for the reset shown in the message |
| One model or model family | Only that model's own allowance is used up | Switch to a model outside that family, while the shared allowance lasts |
| A spend limit or a budget | Paid usage credits reached a cap your organization set | Ask the workspace owner |

Before the limit, a smaller model and a lower reasoning level make the same allowance last
longer. Other vendors count differently; read their page.

**What bb does (0.49.0).** bb's retry plugin is on in a fresh installation and reacts to
failed Claude and Codex turns. When the error is a session or weekly limit with a known
reset time, it may queue a retry of the failed message in the same thread, with the model
you had selected, to run shortly after the reset. It does not queue one for a credit or
spend limit, for a limit with no known reset, for a reset farther away than the configured
maximum wait (six hours unless someone changed it), or when the feature that sent the
message declines the retry. A message gets at most four automatic retries. A queued retry
shows above the message box with its reason and time. **Look for it; do not assume it is
there.**

The retry does not summarize the conversation, start another thread, or choose a different
provider. It also does not look at what the stopped request had already done: the plugin's
guide says "prior output or tool activity does not prevent a retry". A workspace owner can
separately set up a pool of accounts for one provider; that is a different feature and is
off unless someone configured it.

**What you can do.**

1. **A question that changes nothing: wait.** A queued retry runs by itself. If nothing is
   queued, send the question again after the reset.
2. **A request that was writing, sending, paying or changing a record: stop and check
   first, also when you stay in the same thread.** A retry may already be running. In this
   order: stop the thread if it is working again; cancel any queued retry, or ask the
   workspace owner to; confirm the thread is idle; look at the destination to see what
   already happened; then continue once, from that point
   ([recovery steps](ORCHESTRATION.md#before-interrupted-work-continues)).
3. **Before you move unfinished work anywhere else, do the same.** The old thread is
   stopped, its queued retry is cancelled, and it is idle before anything starts elsewhere.
4. **Continue in one place.** Use only a tool your workspace owner already approved for this
   material, that is already signed in, and that has room. Write the note of what is done and
   what is next yourself if the stopped model cannot. Then use Handoff to new thread, or start
   a new thread from the note. If another model family continues a draft, it counts as a
   writer of that draft and cannot be its independent reviewer.
5. **Do not** sign in to another account, switch seats, or buy credits on your own. That is
   the owner's decision.

**Summarizing is not a limit.** When a conversation gets too long for the model's context
window, the app summarizes ("compacts") the older part. That is about length. A warning about
it is, in the words of Claude Code's documentation, "not a usage limit".

---

## Older models in the picker

A model picker keeps earlier generations selectable. Some vendors mark them ("Previous
generation", "Legacy"); others list them beside the current ones with no mark.

- **For routine work, start with the current small model your plan includes.**
- **An earlier model is not the cheaper choice by default.** It draws on the same shared
  limits, and its generation number alone does not predict its price or its usage. On
  Anthropic's price list on the day of this check, each current model cost no more per token
  than the earlier models of its size, and the current small model cost a fraction of the one
  before it. Price lists are not plan allowances, but nothing there suggests that going back a
  generation saves anything.
- **Pick an earlier model only for a reason you have tested,** such as a saved procedure that
  was checked against that exact model.
- **When a new generation appears,** update your dated note of names. The table at the top of
  this page stays the same.

---

## Today's names

A snapshot of November 18, 2026: the descriptions shown by the bb 0.49.0 model catalog on the
kit author's machine, in quotation marks. It is an example of the dated note worth keeping,
not advice for your plan. Read your own picker.

| Row | Claude | OpenAI (Codex) |
|---|---|---|
| Routine | Haiku 5.5: "Fastest for quick answers" | GPT-6 Luna: "Fast and affordable model for easier tasks" (OpenAI says to start it at High) |
| Everyday | Sonnet 5.5: "Most efficient for simpler tasks" | GPT-6.2 Sol: "Fast, go-to model for coding and everyday work" |
| Hard | Opus 5.5: "For complex work and everyday tasks" (the catalog's default) | GPT-6.2 Astra: "Our most capable model for complex coding and professional work" |
| Hardest reasoning | Fable 5.2: "For your toughest challenges" (check that your seat includes it) | GPT-6.2 Astra |

Through Cursor the author uses one model family, Grok (Grok 4.7 that day), for routine and
everyday helper work at a medium or high reasoning level.

The same catalogs also listed earlier generations that day: for example Sonnet 4.6 and
Opus 4.8 for Claude, with no mark, and GPT-6.1 Sol for Codex, marked "Previous generation".

---

## Where this comes from

Vendor pages read on November 18, 2026; bb behaviour checked on version 0.49.0 the same day.
They change; re-check a detail before relying on it.

| Point | Basis |
|---|---|
| Session and weekly limits; shared across models and the vendor's apps; model and reasoning level affect usage | Vendor help: [Anthropic, how usage and length limits work](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work) |
| What each limit message means; switching models; a summarizing warning is not a usage limit; the full conversation is sent with every request; what `/usage` shows, how approximate it is, and how old its bars can be | Vendor docs: [Claude Code costs](https://code.claude.com/docs/en/costs) |
| A larger model uses more of the quota | Vendor help: [Anthropic, models, usage and limits in Claude Code](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code) |
| Whether the top model is included in a plan or seat | Vendor help: [Anthropic, Claude Fable models on your plan](https://support.claude.com/en/articles/15424964-claude-fable-models-on-your-plan) |
| Fast mode on Claude is billed through usage credits and can switch the model; Codex Fast multiplies usage by a factor that differs by model | Vendor docs: [Claude Code fast mode](https://code.claude.com/docs/en/fast-mode); [OpenAI, Codex pricing](https://learn.chatgpt.com/docs/pricing) |
| Reasoning levels and the caution about the highest one; OpenAI's starting levels | Vendor docs: [Claude Code model configuration](https://code.claude.com/docs/en/model-config); [OpenAI, Codex models](https://learn.chatgpt.com/docs/models) |
| Per-token prices of current and earlier Claude models | Vendor docs: [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing) |
| `/usage` inside a bb thread | Sent as the only message of a new bb 0.49.0 thread on the Claude provider, on one team seat, November 18, 2026. It printed three plan meters and the local breakdown. One account and one version; the command itself is Claude Code's ([commands](https://code.claude.com/docs/en/commands)) |
| The automatic retry: which failures it covers, that credit and spend limits are not retried, its four retries and its maximum wait; Handoff to new thread; the account pool | bb 0.49.0: [threads guide](https://github.com/get-bb/bb/blob/desktop-v0.49.0/packages/templates/src/templates/bb-guide-threads.md), [plugins guide](https://github.com/get-bb/bb/blob/desktop-v0.49.0/packages/templates/src/templates/bb-guide-plugins.md), [provider-retry skill](https://github.com/get-bb/bb/blob/desktop-v0.49.0/plugins/provider-retry/skills/provider-retry/SKILL.md) |
| Model descriptions in "Today's names" | The bb 0.49.0 model catalog on the author's machine, November 18, 2026 |
| Re-reading as 94 to 98 percent of counted tokens | The author's own usage records, August to November 10, 2026. Not a benchmark |
| The four rows, starting low, one goal per thread, the saved note | This kit's recommendation, not a vendor requirement |

No speed, quality, or cost benefit is promised here.
