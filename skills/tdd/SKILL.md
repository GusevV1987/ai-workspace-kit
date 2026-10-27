---
name: tdd
description: "Use when adding new behavior or fixing a bug where a meaningful failing test is possible — write that test first; for code that already exists, add proportionate tests and label them honestly."
version: 1.1.0
date: 2026-10-27
---

# Test-Driven Development (TDD)

## The Rule

Write the test first. Watch it fail. Write minimal code. Watch it pass.

Use that order for new behavior and bug fixes whenever a meaningful failing test is possible. A failing test or check you already have that shows the bug can serve as the failing step. Where no meaningful automated test applies, such as a formatting or configuration change, say so and use the checks that fit; every check the project requires still runs. If working code already exists without tests, keep it: do not delete it, or break a shared or live copy, to recreate a test-first history. Follow "Code That Already Exists" below.

## When to Use

**Use TDD for** (when a meaningful failing test is possible):
- New features
- Bug fixes
- Behavior changes
- Refactoring existing code (first cover its current behavior with tests; see "Code That Already Exists")

**When TDD is optional** (say so; use proportionate checks and still run every check the project requires):
- Throwaway prototypes you will discard
- Auto-generated code
- Configuration files
- Pure visual/styling changes with no logic

## The RED-GREEN-REFACTOR Cycle

### RED -- Write a Failing Test

Write one small test that describes what the code should do.

**A good test:**
- Tests one specific behavior (if the name has "and" in it, split into two tests)
- Has a clear, descriptive name (not "test1" or "it works")
- Uses real code, not fakes/mocks (unless absolutely necessary)
- Shows how the code should be used

Run the test. Confirm it fails because the feature is missing, not because of a typo.

If the test passes immediately, you are testing something that already exists.

### GREEN -- Write Minimal Code

Write the simplest code that makes the test pass. Nothing more.

Do not add features the test does not require. Do not optimize. Do not build "for the future."

Run the test. Confirm it passes. Confirm no other tests broke.

### REFACTOR -- Clean Up

Now that everything passes, improve the code:
- Remove duplication
- Improve names
- Extract helper functions

Keep running tests after each change. They must stay green.

Then go back to RED with the next behavior you need.

## Code That Already Exists

Working code without tests is a gap to close, not a mistake to erase. Do not delete it, and never change a shared or live working copy just to manufacture a test-first history.

1. Write meaningful tests for the behavior that matters, using real code where you can. Passing tests show coverage, not yet that a test would catch the failure it targets.
2. Where it is suitable, get that evidence directly: see the test fail against a known failing version or case, such as the original bug, or against an isolated, reversible change in a throwaway copy. A boundary or negative case that has only passed against the current code is coverage, not that evidence.
3. In your handoff, say which tests were written after the code and which of them you saw fail. Name any remaining gap plainly.
4. For the next change to that code, start at RED.

## What Counts as a Good Test

| Quality | Good | Bad |
|---------|------|-----|
| Focused | Tests one thing | Tests five things at once |
| Named clearly | "rejects empty email" | "test1" or "validation" |
| Tests behavior | What the code does | How the code is built internally |
| Uses real code | Calls actual functions | Mocks everything |

## Common Mistakes

1. **Writing new code before its test** -- a test written afterwards passes immediately; until you see it fail when the behavior is wrong, it shows coverage, not that it catches the failure it targets.
2. **Deleting or breaking working code to restart test-first** -- it puts working code at risk and adds no evidence. Keep it and follow "Code That Already Exists."
3. **Writing too much code at once** -- if you wrote more than a few lines, you skipped a RED step.
4. **Testing implementation instead of behavior** -- test what the code does, not how it is built.
5. **Skipping the "watch it fail" step for new behavior** -- if you never saw it fail, you do not know if it tests anything.

## When Stuck

| Problem | What it means |
|---------|--------------|
| Cannot figure out how to test it | Design is unclear -- simplify the interface first |
| Test requires too much setup | Code is too tangled -- break it into smaller parts |
| Must fake/mock everything | Code depends on too many things -- reduce dependencies |
| Test is more complex than the code | Split the test or simplify the design |

## Before Marking Work Complete

- Every new or changed behavior has a meaningful test, or a proportionate check for a low-impact change
- For new behavior, you watched each test fail for the right reason (missing behavior, not a typo)
- New behavior was written test-first, with only enough code to pass each test
- For tests added after the code, your handoff labels them as written afterwards and says which ones you saw fail; the rest count as coverage only
- Where no meaningful automated test applied, your handoff says so
- All tests pass with no errors or warnings, and every check the project requires has run and passed

If any of these are not true, say so plainly in your handoff. Do not delete or break working code to redo the order.
