---
name: update-package-locks
description: Use when refreshing package-lock.json files in ng-mocks.
---

# Update Package Locks

Use this skill for a fresh lockfile refresh or to regenerate a lockfile while resolving an existing dependency PR conflict, without permanently changing the repo's normal install flow.

This workflow is intentionally narrow. Follow the sequence exactly. Do not manually add tests, lint, local npm commands, rebases, or unrelated cleanup unless the user explicitly asks for them.

## Task List

Create a plain Markdown checklist that any AI agent can follow:

```md
- [ ] Identify whether this is a fresh refresh or an existing dependency PR conflict
- [ ] Create an isolated worktree from `upstream/main` or the existing PR branch
- [ ] For a PR conflict, merge `upstream/main` and keep the dependency PR's lockfile side as the regeneration base
- [ ] Temporarily change the relevant `compose.yml` service command line(s) from `npm install` to `npm update`
- [ ] Run the update wrapper pass with wrapper targets in batches of 2-4
- [ ] Restore `compose.yml` back to `npm install`
- [ ] Run the install wrapper pass with wrapper targets in batches of 2-4
- [ ] Commit the refreshed lockfiles with only the dependency or merge changes already in scope
- [ ] Push a fresh branch and create a PR, or push the existing PR branch
- [ ] Summarize the two wrapper passes and any npm warnings
```

## Workflow

1. Work in an isolated worktree:
   - For a fresh refresh, fetch the current base and create a new branch from `upstream/main`.
   - For an existing dependency PR conflict, fetch that PR branch into an isolated worktree, merge `upstream/main` without rewriting history, and keep the dependency PR's lockfile side as the regeneration base.
2. In that new worktree, inspect `compose.yml`.
3. Temporarily change only the affected `compose.yml` service command line(s) from `npm install` to `npm update`.
4. For a repo-wide refresh, derive the current wrapper targets from `compose.sh` and `compose.yml`, then run them in batches of 2-4 concurrent commands. If the user explicitly named one target, run only that target.
5. Restore the same service command line(s) back to `npm install`.
6. Run the same target set again in batches of 2-4 so the resulting lockfiles match the normal CI install flow.
7. Commit the refreshed `package-lock.json` files with only the dependency or merge changes already in scope, plus `.agents/skills/update-package-locks/SKILL.md` if this skill was intentionally edited.
8. For a fresh refresh, push the branch to a writable remote and create a PR against `upstream/main`. For an existing dependency PR, push back to that PR branch.

Do not use the current active worktree. A fresh refresh needs a new branch; an existing dependency PR conflict stays on its PR branch in an isolated worktree. Do not manually run `sh test.sh`, root tests, lint, TypeScript checks, local `npm install`, local `npm update`, or ad-hoc dependency commands as part of this workflow unless the user explicitly asks for them.

For a repo-wide refresh, the affected command lines are all service command entries in `compose.yml` that currently read `- install`. Change only those entries to `- update`, run the wrapper, then change those same entries back to `- install`. Do not edit `package.json`, shell scripts, or lockfiles by hand.

For repo-wide refreshes, derive targets from the current `compose.sh` and `compose.yml`; do not hardcode target names or rely on bare `sh compose.sh`. Run each target once per pass in batches of 2-4, with a unique `COMPOSE_PROJECT_NAME` per concurrent command. Clean each batch with `docker compose down -v` before starting the next one.

If a wrapper target fails because Docker reports exhausted address pools or Puppeteer reports a corrupt cache folder, clean up that target's compose project and rerun the same wrapper target with a fresh `COMPOSE_PROJECT_NAME`. Do not switch to local npm commands.

If several worktrees or agent sessions are active, use a unique compose namespace for every wrapper command:

```bash
COMPOSE_PROJECT_NAME=ngmocks_<unique> sh compose.sh <target>
```

## Commands

```bash
# Start from upstream/main in a new worktree.
git fetch upstream main
git worktree add -b codex/<lockfile-branch> ../<lockfile-worktree> upstream/main

# Resolve an existing dependency PR without rewriting its history.
git fetch upstream main <pr-branch>
git worktree add ../<pr-worktree> <pr-branch>
git merge --no-edit upstream/main
git checkout --ours path/to/package-lock.json # PR side when merging main into the PR branch

# Repo-wide lockfile refresh.
# Edit compose.yml to npm update, run current wrapper targets in batches of 2-4, then restore npm install and repeat the same batches.

# Specific target lockfile refresh, only when the user named a target.
# First edit that target's compose.yml service command to npm update.
COMPOSE_PROJECT_NAME=ngmocks_<unique> sh compose.sh <target>
# Then restore that target's compose.yml service command to npm install.
COMPOSE_PROJECT_NAME=ngmocks_<unique> sh compose.sh <target>

# Commit and publish after the wrapper sequence succeeds.
git add package-lock.json docs/package-lock.json tests-e2e/package-lock.json e2e/*/package-lock.json
git add .agents/skills/update-package-locks/SKILL.md # only if intentionally edited
git commit -m "chore: refresh package lockfiles"
git remote -v
git push -u origin codex/<lockfile-branch>
# Create a PR against upstream/main after the push succeeds.
```

## Validation

- The required validation for this skill is a successful wrapper-based update pass followed by a successful wrapper-based install pass.
- For a single target, run `sh compose.sh <target>` once while the service command is temporarily `npm update`, then run `sh compose.sh <target>` again after restoring `npm install`.
- For a repo-wide lock refresh, run every relevant wrapper target once with all relevant service commands temporarily set to `npm update`, then run every same target again after restoring all service commands to `npm install`.
- Repo-wide target runs may be concurrent in batches of 2-4. A batch is successful only when every target command exits successfully.
- Do not run `sh test.sh`, `npm test`, lint, or TypeScript checks as part of this skill's default validation.

## Guardrails

- Always use an isolated worktree: a new branch from current `upstream/main` for fresh work, or the existing PR branch for conflict resolution.
- Never delete lockfiles.
- Never hand-merge lockfile conflict blocks or rewrite dependency PR history.
- Never leave `compose.yml` in an `npm update` state after finishing.
- Never use local `npm install`, `npm update`, or ad-hoc `node` commands when the wrapper flow covers the task.
- If multiple worktrees, agent sessions, or concurrent wrapper targets are active, set a unique `COMPOSE_PROJECT_NAME` for each wrapper command.
- Clean up temporary compose projects with `docker compose down -v` after successful batches or failed transient Docker/Puppeteer setup runs.
- When committing or pushing, let the repository's normal git hooks run. Do not bypass hooks unless the user explicitly asks.
- Do not manually invoke extra validation beyond this skill; automated git hooks are the exception and should do their normal job.
- Push to a configured writable remote; never assume `upstream` accepts contributor branches.
