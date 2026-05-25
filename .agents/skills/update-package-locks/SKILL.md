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
- [ ] Confirm the update and install wrapper passes completed
- [ ] Summarize results, risks, and follow-ups
```

## Workflow

1. Identify the affected targets.
2. Inspect the corresponding service command in `compose.yml`.
3. Temporarily change only the relevant service from `npm install` to `npm update`.
4. Run `sh compose.sh <target>` to refresh dependencies.
5. Restore `compose.yml` back to `npm install`.
6. Run `sh compose.sh <target>` again so the resulting lockfile matches the normal CI install flow.
7. Do not run `sh test.sh <target>` for this pure lockfile refresh workflow unless the user explicitly asks for tests or the task includes non-lockfile code changes that need test coverage.

## Commands

```bash
# Root lockfile
sh compose.sh root

# tests-e2e lockfile
sh compose.sh e2e

# Specific target lockfile
sh compose.sh <target>
```

## Validation

- The required validation for this skill is a successful wrapper-based update pass followed by a successful wrapper-based install pass.
- For a single target, that means `sh compose.sh <target>` once while the service command is temporarily `npm update`, then `sh compose.sh <target>` again after restoring `npm install`.
- For a repo-wide lock refresh, that means running `sh compose.sh` once with all relevant service commands temporarily set to `npm update`, then running `sh compose.sh` again after restoring all service commands to `npm install`.
- Do not run `sh test.sh` as part of this skill's default validation.

## Guardrails

- Never delete lockfiles.
- Never leave `compose.yml` in an `npm update` state after finishing.
- Never use local `npm install`, `npm update`, or ad-hoc `node` commands when the wrapper flow covers the task.
- If multiple worktrees are active, set a unique `COMPOSE_PROJECT_NAME`.
