---
name: review
description: "Pre-landing code review. Catches structural issues that tests miss — scope drift, SQL safety, race conditions, trust boundary violations. Use when asked to review a PR, check a diff, or before merging."
version: 1.1.0
date: 2026-11-18
---

# Review

This skill is the writer's own pre-landing check of its own change, so it may fix
mechanical issues. It is not the independent review in
[ORCHESTRATION.md](../../ORCHESTRATION.md#get-an-independent-review), where the reviewer
is a different family, starts fresh, and edits nothing.

## The Rule

Read the full diff before flagging anything. Verify every claim — no "probably handled" language. Every finding must have an action.

## When to Use

- Before merging or landing code changes
- When asked to "review this PR", "check my diff", or "code review"
- After completing a feature, before calling it done

## The 5 Steps

### Step 1: Understand the Change

1. **Get the diff** -- read the full set of changes against the base branch.
2. **Identify the intent** -- what is this change trying to accomplish? Check commit messages, PR description, any linked issues or TODO items.
3. **Map the blast radius** -- which files changed, which systems are affected, what could break downstream.

### Step 2: Scope Check

Compare stated intent against actual files changed:

- **CLEAN** -- changes match the stated purpose, nothing extra
- **DRIFT DETECTED** -- files changed that don't relate to the stated purpose
- **REQUIREMENTS MISSING** -- stated goals not fully addressed by the changes

Flag scope drift immediately. Unrelated changes in a PR are a common source of hidden bugs.

### Step 3: Two-Pass Review

**Pass 1 — Critical issues** (must fix before merge):

| Category | What to look for |
|----------|-----------------|
| SQL safety | Raw queries, missing parameterization, injection risk |
| Race conditions | Shared state without locks, concurrent access patterns |
| Trust boundaries | Unsanitized user input, LLM output used as commands |
| Auth/authz gaps | Missing permission checks, token exposure |
| Data loss risk | Destructive operations without confirmation, missing backups |
| Error handling | Silent failures, swallowed exceptions, missing rollback |
| Enum completeness | Switch/case without default, missing status values |

**Pass 2 — Informational** (improve but don't block):

| Category | What to look for |
|----------|-----------------|
| Side effects | Functions that modify state unexpectedly |
| Magic values | Hardcoded strings, numbers without explanation |
| Dead code | Unreachable branches, unused imports |
| Test gaps | Changed behavior not covered by tests |
| Naming | Misleading names, inconsistent conventions |

### Step 4: Fix or Flag

Every finding gets one of two treatments:

| Classification | Action |
|---|---|
| **AUTO-FIX** | Mechanical issues (typos, formatting, missing imports) — fix directly, one-line summary |
| **ASK** | Judgment calls, design questions, ambiguous trade-offs — present to user with context |

When you are the writer checking your own change, do not leave read-only commentary. Every issue either gets fixed or gets a decision request. When you review someone else's work, return findings only.

### Step 5: Documentation Check

- Are docs (README, comments, API docs) still accurate after these changes?
- If code behavior changed, do the docs reflect it?
- Flag stale documentation — don't silently leave it wrong.

## What This Skill Does NOT Do

- **Does not commit, push, or create PRs** -- that's `/ship`
- **Does not run the full test suite** -- that's `/verify-before-done`
- **Does not debug failing tests** -- that's `/investigate`

## Key Principles

- Read first, judge second — understand the full change before flagging anything
- Verify every claim with evidence from the code
- Critical issues block; informational issues inform
- Prefer fixing over commenting when the fix is obvious and safe
- Scope discipline: review what changed, not the whole codebase
