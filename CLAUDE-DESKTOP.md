# Codex and Grok inside the Claude desktop app

You work in the Claude desktop app and want a second model to look at the same folder: a review from Grok, a second diagnosis from Codex. Two optional plugins make that a slash command. This page says how to install them, what each one does without asking, who pays, and what leaves your computer.

The kit itself stays plain Markdown. You need none of this to use it.

The tests behind this page ran on 18 November 2026 on a Mac with Claude Code 2.1.326, the Cursor CLI build 2026.11.17 and the Codex CLI 0.169.0. Nothing was run on Windows. Some statements come from reading a plugin's code, not from running it; the last section says which. Where the page quotes a vendor, it gives the page and the date.

## The two plugins

| Plugin | Whose code | What it gives you |
|---|---|---|
| `cursor` | This kit, in [`plugins/cursor`](plugins/cursor/README.md), MIT license | Ask a Grok model, through the Cursor CLI, for an answer or a review. Its commands load only when you type them |
| `codex` | OpenAI's own plugin, [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc), Apache License 2.0 | Ask Codex for a review or hand it a task. Not changed by this kit |

The kit's catalog points at one exact commit of OpenAI's plugin (version 1.0.6, commit `db52e28f4d9ded852ab3942cea316258ae4ef346`), the one examined for this page. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The `cursor` plugin is the narrower of the two. OpenAI's plugin can do more and asks less. Read the next section before you install either.

## Before you install

1. **Your files go to another company.** A request sends your question, and whatever the other model reads, to Cursor or to the provider your Codex is set up for (normally OpenAI). Follow your company's rule on which data may go to which vendor. If you have no rule yet, start in a folder with nothing private in it.
2. **You pay through your own accounts, and neither plugin shows a price.**
   - Cursor: the account your Cursor CLI is signed in to. `/cursor:setup` shows its team and plan. Cursor says: "Your remaining usage and next reset date are shown in your editor settings and under Usage at grok.com/dashboard." and "Buy credit when you choose, or turn on Auto Top-up to refill when your balance drops below a threshold you set." (cursor.com/docs/models-and-pricing, read 18 Nov 2026). If paid usage is switched on in your account, a request can cost money.
   - Codex: whatever your Codex is set up with. That can be a ChatGPT sign-in, an API key billed per use, or another provider. OpenAI says: "Run `codex login status` to see the active authentication method." (learn.chatgpt.com/docs/auth, read 18 Nov 2026).
3. **The folder is not a wall.** In our test a read-only Codex request read two files outside the test folder. Assume either tool can read what your user account can read.
4. **OpenAI's plugin can start without a `/codex:` command.** It installs a helper whose instructions say: "Do not wait for the user to explicitly ask for Codex. Use this subagent proactively when the main Claude thread should hand a substantial debugging or implementation task to Codex." and "Default to a write-capable Codex run by adding `--write` unless the user explicitly asks for read-only behavior or only wants review, diagnosis, or research without edits." (`agents/codex-rescue.md` at the pinned commit). So after you install it, Claude may send work to Codex, and Codex may change files in the project, when you did not type a Codex command. We did not test that path.
5. **OpenAI's plugin has a review gate that can run after every reply.** It is off for a folder where nobody turned it on. When it is on, a Codex review runs each time Claude finishes a turn, the setup turn included. Each one sends Claude's last reply to your Codex provider, the reply to the setup command included, spends a Codex run, and can keep Claude from finishing. `/codex:setup` reports its state and offers to turn it on; decline.
6. **While a `/codex:` command is running, more is allowed without asking.** Its commands pre-approve any Node command, and some also any Git or npm command, for that turn (`allowed-tools: Bash(node:*)` and similar in its command files). Anthropic's page says such a grant "clears when you send your next message" (code.claude.com/docs/en/skills, read 18 Nov 2026).

## One-time setup

You need a terminal for this part. If that is new to you, ask a technical teammate to do it with you once.

1. Install and sign in to the tools you want to use, following each vendor's own instructions: the Cursor CLI for Grok (its documentation is at cursor.com/docs/cli/using) and the Codex CLI for Codex (signing in is described at learn.chatgpt.com/docs/auth). Both plugins also need Node.js.
2. Add the kit's catalog and install the plugin you want. You do not need both:

   ```bash
   claude plugin marketplace add GusevV1987/ai-workspace-kit
   claude plugin install cursor@ai-workspace-kit
   claude plugin install codex@ai-workspace-kit
   ```

   Anthropic's page says: "The terminal, the desktop app's local sessions, and the VS Code extension on one computer read the same settings files, so a plugin you install at user scope in any of them is available in the other two." (code.claude.com/docs/en/discover-plugins, read 18 Nov 2026). That page describes a plugin browser in the desktop app (the **+** button next to the prompt box) for catalogs you have already added. It does not describe adding a catalog from inside the app, which is why this step uses the terminal.
3. Open the desktop app, the **Code** tab, a local session in your project folder. Type `/` and look for `/cursor:setup` and `/codex:setup`. Run the one you installed. Each reports whether its tool is installed and signed in. The Codex one can show your account's e-mail address on screen.

A catalog like this one does not update by itself: "Off by default: every other marketplace, including the community marketplace, third-party marketplaces, and local development marketplaces." (same page). To update later, run `claude plugin marketplace update ai-workspace-kit` and then `claude plugin update cursor@ai-workspace-kit`. To remove a plugin, run `claude plugin uninstall cursor@ai-workspace-kit`.

Plugins are not available in cloud sessions or in WSL sessions (code.claude.com/docs/en/desktop, read 18 Nov 2026).

## Use Manual mode

The desktop app has permission modes. In **Manual** mode "Claude asks before editing files or running commands." In **Auto** mode a background check decides instead of you, and in **Bypass permissions** mode "Claude runs without permission prompts" (code.claude.com/docs/en/desktop, read 18 Nov 2026).

Every "asks you first" on this page means the app's own permission prompt in Manual mode. Auto and Bypass remove that prompt. When the app asks about a plugin command, allow it once. If you choose to always allow it, later requests run without asking.

## Grok: the `cursor` plugin

It has seven commands: `/cursor:setup`, `/cursor:models`, `/cursor:task`, `/cursor:review`, `/cursor:status`, `/cursor:result` and `/cursor:cancel`. Claude does not load them by itself; they load when you type them. The plugin contains no helper that starts on its own. That is what the plugin controls. Its two scripts are ordinary Node programs, so a rule you saved, or another plugin, can allow Claude to run them without asking; see "One exception" below.

Start with the model list. Model names differ by account and change often:

```text
/cursor:models
```

Then ask. Name the model each time, or save one with `/cursor:setup --default-model <id>`:

```text
/cursor:review --model <id>
/cursor:task --model <id> "Read notes.md and name the biggest risk in one sentence."
```

**What runs without asking.** A read-only question or review, on a model you named, in the folder Claude is working in at that moment (normally the folder you opened). The plugin starts Cursor in its read-only mode, in which the model does not edit files. It has no built-in model and it refuses `auto`.

**What asks you first.** Each of these needs an option that you type. With the option, the request runs through a second script that this plugin does not pre-approve, so in Manual mode the app shows you the exact command and waits. Without the option no prompt appears. What happens then depends on the option; the last column says which.

| You add | What it allows | Without it |
|---|---|---|
| `--write` | Cursor may change files in the project | The request still runs, read-only, and uses a model run. If it asked for a change, the answer says no file was changed |
| `--trust-workspace` | Cursor may run in a folder it has not been told to trust. Cursor requires this once for a new folder | In such a folder Cursor is started and refuses. The plugin prints one sentence that names the option, and no answer comes back |
| `--allow-fast` | A model whose id ends in `-fast`. The plugin does not know what a model costs; check Cursor's pricing page first | With such an id the command stops before Cursor is started, with one sentence that names the option |
| `--workspace <folder>` | Working in a folder other than the current one | The request runs in the current folder |
| `--allow-hooks` | Running in a folder that has its own Cursor hooks file (`.cursor/hooks.json`). This applies to every command that starts Cursor: `setup`, `models`, `task` and `review` | In such a folder the command stops before Cursor is started, with one sentence that names the option |

**What trusting a folder means.** Cursor says: "Project hooks run in any trusted workspace" (cursor.com/docs/hooks, read 18 Nov 2026) and "Non-interactive runs in untrusted workspaces fail with guidance unless `--trust` (or `--force`) is passed." (cursor.com/docs/cli/changelog, read 18 Nov 2026). A hook is a program the folder tells Cursor to run. Read-only mode limits the model, not a hook. Trust only a folder whose contents you know. Your own Cursor settings outside the project, such as hooks in `~/.cursor/hooks.json` and servers you approved in Cursor, apply to every run, and the plugin does not limit them.

**Who types the options.** Claude types the command for you, and the scripts cannot tell whether an option came from you or from Claude. The plugin's instructions tell Claude never to add one of these options and never to choose a model. In a run of an earlier version Claude added two options by itself. That is why they now sit behind the permission prompt: if Claude adds one anyway, you are asked. The model name has no such lock, so check the "requested model" line in each answer. If a read-only request cannot be done read-only, the answer says so and the request ends there.

**One exception.** During a turn that starts with a `/codex:` command, OpenAI's plugin pre-approves any Node command, and both scripts are Node programs. The prompt described above is not guaranteed in that turn. The same is true if you saved a rule that always allows Node commands.

**Long jobs.** Add `--background` and the plugin prints a job id at once. Then use `/cursor:status`, `/cursor:result <job id>` and `/cursor:cancel <job id>`. In one of our runs a review took 218 seconds, longer than Claude Code waited for one command. If the wait ends first, run `/cursor:status` and use only an id it prints.

**What the answer tells you.** The model you asked for, and that the served model is not verified. The plugin shows the model label the Cursor CLI reports. It cannot prove which model answered. The answer is Cursor's own text, with control characters removed and very long output cut, so it can contain anything from the files Cursor read. When a run fails, the plugin shows its own fixed sentence, none of the Cursor program's error text, and no answer text from a run that ended with a failure. If Cursor had already written part of an answer when the run ended without a result, that part is shown, followed by the plugin's sentence that the run did not complete. Do not treat it as a formal independent review; see [skills/review](skills/review/SKILL.md).

**Records.** Requests and answers for every project are kept in one folder on your computer, `~/.claude/cursor-companion/`. Each record holds your request, Cursor's answer, the model you asked for and the label Cursor reported, the folder path, the times, the plugin's own job id, Cursor's session id and request id, your home folder path, the path of the Cursor program, and the process ids of the run. `/cursor:setup` also shows the version of the Cursor program. The plugin shows a job only in the folder that started it. Any program running under your account can read those files. Deleting the folder removes the plugin's copies. It does not remove what Cursor itself keeps.

**From Cursor we use only Grok models.** Cursor's page says: "Third-party models like Claude, GPT, and Gemini aren't part of the included pool." (cursor.com/docs/models-and-pricing, read 18 Nov 2026). The plugin does not enforce this. The model you name is your choice.

## Codex: OpenAI's plugin

OpenAI maintains this plugin; its own description is in its [README](https://github.com/openai/codex-plugin-cc/blob/db52e28f4d9ded852ab3942cea316258ae4ef346/README.md). This is what a careful user should know about version 1.0.6. Each point says whether we ran it or read it in the code.

1. **`/codex:rescue` can change files, and it does not ask first.** The plugin starts Codex with approvals off, and a rescue is write-capable unless your request says otherwise. When you want an opinion, say so in the request: "Read-only: do not change any file." Use it in a folder under version control, so you can see and undo what changed. *Run: one read-only rescue, with a model and a reasoning level named; no file changed.*
2. **A read-only rescue still reads widely.** In that run it read two instruction files outside the test folder, and their text went into the Codex request. *Run.*
3. **`/codex:review` does not change files, and you cannot aim it.** It needs a Git repository. It runs in Codex's read-only mode on the model and the reasoning level your Codex is already set to. You can add `--model <id>`. There is no option for the reasoning level, and the answer does not name the model that ran. *Read in the code; not run, because the reasoning level could not be set for the test.*
4. **Leave the review gate off.** See point 5 of "Before you install". A plain `/codex:setup` reports the gate and does not turn it off; `/codex:setup --disable-review-gate` does. *Plain setup run in a new folder: the gate was off and stayed off. The switch itself: read in the code.*
5. **`/codex:transfer` hands this conversation to Codex.** It imports the Claude session's transcript into a Codex thread on your computer that you can continue with `codex resume`. Continuing that thread sends its content to your Codex provider, like any Codex conversation. We did not check what is sent at the moment of import. Treat everything pasted or read in the conversation as shared once you transfer it. *Read in the code and in OpenAI's README; not run.*
6. **Type only an id or a documented option after `status`, `result`, `cancel` and `transfer`.** These four commands place what you type into a shell line. With Claude Code 2.1.326 in its default permission mode, our attempts to add a second command were refused or treated as plain text, and nothing extra ran. We did not test a mode that skips permission prompts. *Run: seven attempts on `status`, `result` and `cancel`.*
7. **Records.** Job files, with the request and the result, are kept under `~/.claude/plugins/data/` in a folder whose name starts with `codex`, or in a temporary folder when that one is not available. The plugin removes a session's job files when the session ends. Codex keeps its own conversation history, which the plugin does not remove. *Location seen in the run; the rest read in the code.*

None of this is a defect report against OpenAI. It is how version 1.0.6 works, and 1.0.6 was the newest version on 18 November 2026.

## A safe first try

1. Make a new folder with two short text files that contain nothing private. Name one of them `notes.md`. Open the folder in the desktop app's Code tab, in Manual mode. Ask Claude to make it a Git repository and commit the two files. Our Codex run used a Git repository, and `/codex:review` needs one.
2. Run `/cursor:setup`, then `/cursor:models`, then `/cursor:task --model <id> "Summarize notes.md in one sentence."` The answer will say Cursor does not trust the folder yet. Repeat the command with `--trust-workspace` and approve the command the app shows.
3. Run `/codex:setup`. When it offers the review gate, decline. Then run `/codex:rescue Read-only: do not change any file. Read notes.md and name the biggest risk in one sentence.`
4. Look at what came back, and at your usage at each vendor. Then decide whether to use it on real work.

## What was run, and what was not

- Run: install of both plugins from a local copy of this catalog into an empty configuration folder; all seven `cursor` commands through Claude Code with default permissions, with the approval stood in for by a saved allow rule; a plain request with no `/cursor:` command, which started nothing; each refusal named above, in a run where nobody could approve; a folder with an empty hooks file, refused without `--allow-hooks` and run with it; one read-only Codex rescue; `/codex:setup` and `/codex:status`; the Codex plugin's handling of typed text. The `cursor` plugin's automated tests cover the remaining cases with a stand-in for the Cursor program.
- Read in the code only: `/codex:review`, `/codex:adversarial-review`, `/codex:transfer`, the review gate switched on, the helper that starts Codex on its own.
- Not tested at all: Windows; the look of the permission prompt in the desktop app itself; any mode that skips permission prompts; a folder whose Cursor hook actually runs a program.

Related pages: [MODEL-CHOICE.md](MODEL-CHOICE.md) for which model to pick and how to read a usage limit, [CONNECTORS.md](CONNECTORS.md) for letting a model reach your mail, chat or documents, [ORCHESTRATION.md](ORCHESTRATION.md) for when a second model is worth it.
