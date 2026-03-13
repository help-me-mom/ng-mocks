---
name: update-package-locks
description: Use when refreshing package-lock.json files in ng-mocks.
---

# Update Package Locks

Use this skill when the task is to refresh lockfiles without permanently changing the repo's normal install flow.

## Task List

Create a plain Markdown checklist that AI Agent can follow:

```md
- [ ] Identify which lockfiles and compose services need to change
- [ ] Run `npm update` wrapper to update dependencies
- [ ] Run `npm install` wrapper flow to normalize lockfiles
- [ ] Run the required validation and summarize the results
```

## Workflow

1. Identify the affected targets.
2. Inspect the corresponding service command in `compose.yml`.
3. Temporarily change only the relevant service from `npm install` to `npm update`.
4. Run `sh compose.sh <target>` to refresh dependencies.
5. Restore `compose.yml` back to `npm install`.
6. Run `sh compose.sh <target>` again so the resulting lockfile matches the normal CI install flow.
7. Run the affected tests with `sh test.sh <target>`.

## Commands

```bash
# Root lockfile
sh compose.sh root
sh test.sh root

# tests-e2e lockfile
sh compose.sh e2e
sh test.sh e2e

# Specific target lockfile
sh compose.sh <target>
sh test.sh <target>
```

## Validation

- `sh test.sh root` for root lockfile changes
- `sh test.sh e2e` for `tests-e2e` lockfile changes
- `sh test.sh <target>` for each versioned or special target that changed

## Guardrails

- Never delete lockfiles.
- Never leave `compose.yml` in an `npm update` state after finishing.
- Never use local `npm install`, `npm update`, or ad-hoc `node` commands when the wrapper flow covers the task.
- If multiple worktrees are active, set a unique `COMPOSE_PROJECT_NAME`.
