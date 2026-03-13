---
name: rebase-to-upstream
description: Use when replaying the current local branch onto upstream/main, or onto another provided remote branch, by stashing local changes, resetting to the target branch, and cherry-picking missing commits back one by one.
---

# Rebase To Upstream

Use this skill when the current local branch should be replayed onto `upstream/main`.

`upstream/main` is the default target, but the same process should work with any provided remote branch such as `origin/main` or `upstream/release`.

## Task List

Start with a plain Markdown checklist that AI Agent can track. For example:

```md
- [ ] Inspect the current branch, target branch, and local changes
- [ ] Stash local changes if needed and create a backup branch
- [ ] Reset the current branch to the target branch
- [ ] Cherry-pick missing commits from the backup branch one by one
- [ ] Resolve source, manifest, and lockfile conflicts with the repo rules
- [ ] Re-apply any stash and resolve conflicts with the same rules
- [ ] Run the required validation and summarize the final branch state
```

## Workflow

1. Inspect the current branch, working tree, and target branch.
2. If local changes exist, stash them before rewriting the branch.
3. Create a backup branch from the current branch before any reset.
4. Fetch the target remote and hard-reset the current branch to the target ref. The default target is `upstream/main`, but it may be overridden.
5. Cherry-pick the missing commits from the backup branch back onto the current branch one by one.
6. If conflicts appear:
   - resolve normal source conflicts first,
   - for dependency manifest conflicts such as `package.json`, compare both sides entry by entry and keep the highest version for each dependency key,
   - never accept or reject an entire dependency conflict block just because the first dependency in that block is higher,
   - leave lockfiles for the end,
   - for lockfile conflicts, do not hand-edit the conflict markers,
   - reject the remote or target-branch side of the conflicted lockfile for the affected project, then regenerate that project with the wrapper-based `npm update` flow followed by the normal wrapper-based `npm install` flow.
7. After the missing commits have been replayed, apply the stash if one exists and resolve any conflicts with the same rules.
8. Delete the backup branch
9. Run the relevant wrapper-based validation and summarize the result.

## Commands

```bash
# Default target, override if needed
TARGET_REF=${TARGET_REF:-upstream/main}
CURRENT_BRANCH=$(git branch --show-current)
BACKUP_BRANCH="backup/${CURRENT_BRANCH//\//-}"

git fetch --all --prune
printf '%s\n' "$CURRENT_BRANCH"
git status --short
git log --oneline --decorate --graph --max-count=20

# Stash local changes only if they exist, for example:
git stash push -u -m "rebase-to-upstream: $CURRENT_BRANCH"

# Create a safety branch before resetting
git branch "$BACKUP_BRANCH"

# Reset the current branch to the target ref
git reset --hard "$TARGET_REF"

# Inspect missing commits from the backup branch
git cherry -v "$TARGET_REF" "$BACKUP_BRANCH"
git log --reverse --format=%H "$TARGET_REF".."$BACKUP_BRANCH"

# Replay commits one by one
git cherry-pick <commit>
git cherry-pick --continue

# Lockfile conflict handling during cherry-pick: keep the replayed change,
# drop the target-branch side, and never edit package-lock conflicts by hand
git checkout --theirs path/to/package-lock.json
git add path/to/package-lock.json

# Regenerate only the affected project's dependencies and lockfile through wrappers:
# 1) temporarily switch that service command in compose.yml from npm install to npm update
sh compose.sh <target>
# 2) restore compose.yml to the normal npm install command
sh compose.sh <target>

# Re-apply stashed local work if a stash was created
git stash list
git stash apply <stash-ref>

# Validation
sh test.sh <target>
```

## Conflict Rules

- Always resolve lockfiles last.
- For dependency manifest conflicts such as `package.json`, compare both sides dependency by dependency and keep the highest version for each key.
- Never resolve a whole dependency conflict block based only on the first dependency in that block.
- For `package-lock.json` conflicts, reject the remote or target-branch side, then regenerate the affected target with the wrapper-based `npm update` flow followed by the normal wrapper-based `npm install` flow.
- Do not manually merge `package-lock.json` conflict markers.
- Use the same conflict strategy when applying the stash after the cherry-picks are done.

## Validation

- `sh test.sh <target>` for each project or suite whose files changed during the replay
- Run `sh test.sh root` only when root files changed
- Run `sh test.sh e2e` only when `tests-e2e` or shared e2e files changed

## Guardrails

- This skill is intentionally branch-agnostic: it should work from any current local branch.
- `upstream/main` is only the default target. Allow an override when the user provides another remote branch.
- Always create the backup branch before `git reset --hard`.
- Only stash when local changes actually exist.
- Use repo wrappers to regenerate lockfiles; do not run ad-hoc local `npm update` or `npm install` for this workflow.
