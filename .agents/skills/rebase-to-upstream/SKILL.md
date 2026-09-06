---
name: rebase-to-upstream
description: Use when replaying the current local branch onto upstream/main, or onto another provided remote branch, by stashing local changes, resetting to the target branch, and cherry-picking missing commits back one by one.
---

# Rebase To Upstream

Use this skill when the current local branch should be replayed onto `upstream/main`.

`upstream/main` is the default target, but the same process should work with any provided remote branch such as `origin/main` or `upstream/release`.

## Task List

```md
- [ ] Inspect the current branch, target branch, and local changes
- [ ] Stash local changes if needed
- [ ] Create a backup branch before resetting
- [ ] Reset the current branch to the target ref (e.g., upstream/main)
- [ ] Cherry-pick missing commits from the backup branch one by one
  - For each commit with conflicts: resolve source, then manifests, then lockfiles
  - For package.json conflicts: compare each dependency individually and keep the highest semantic version (e.g., 11.11.1 > 11.11.0, 21.2.0 > 20.3.2)
  - After resolving lockfile conflicts: regenerate via wrapper before committing
- [ ] Re-apply any stash and resolve conflicts with the same rules
- [ ] Read the updated repo guidance and apply it to the replayed changes
- [ ] Delete the backup branch
- [ ] Run validation and summarize the final branch state
```

## Workflow

### 1. Inspect Current State

```bash
TARGET_REF=${TARGET_REF:-upstream/main}
CURRENT_BRANCH=$(git branch --show-current)
BACKUP_BRANCH="backup/${CURRENT_BRANCH//\//-}"

git fetch --all --prune
printf '%s\n' "$CURRENT_BRANCH"
git status --short
git log --oneline --decorate --graph --max-count=20
```

### 2. Stash if Needed, Then Create a Backup

Only stash if there are actual local changes:

```bash
# Check for changes first
git status --short

# Only if the output is not empty
git stash push -u -m "rebase-to-upstream: $CURRENT_BRANCH"

# Always create a backup branch before any destructive operation.
git branch "$BACKUP_BRANCH"
```

### 3. Reset to Target

```bash
git reset --hard "$TARGET_REF"
```

### 4. Identify Missing Commits

```bash
git cherry -v "$TARGET_REF" "$BACKUP_BRANCH"
git log --reverse --cherry-pick --right-only --format=%H "$TARGET_REF...$BACKUP_BRANCH"
```

### 5. Cherry-Pick Commits One by One

For each commit:

```bash
git cherry-pick <commit-hash>
```

If conflicts occur, resolve them in this order:

#### Step 5a: Resolve Source Files

- Resolve using standard merge conflict resolution
- Stage resolved files: `git add <path>`

#### Step 5b: Resolve Manifests (package.json)

- Compare both sides **dependency-by-dependency** (not block-by-block)
- For each dependency key, resolve versions using **semantic version comparison**:
  - Parse versions as `major.minor.patch` (ignore pre-release tags like `-alpha`, `-beta`)
  - Compare major first, then minor, then patch
  - Keep the **highest** version number for that specific dependency
- Examples:
  - `"npm": "11.11.0"` vs `"npm": "11.11.1"` → keep `11.11.1` (patch is higher)
  - `"ng-packagr": "20.3.2"` vs `"ng-packagr": "21.2.0"` → keep `21.2.0` (major is higher)
  - `"rxjs": "7.8.0"` vs `"rxjs": "7.5.0"` → keep `7.8.0` (minor is higher)
- **CRITICAL**: Do NOT use `git checkout --theirs` or `git checkout --ours` for package.json conflicts. These commands accept/reject the entire conflict block, which will incorrectly resolve some dependencies. You must manually edit the file to keep the highest version for each individual dependency.
- Stage resolved files: `git add <path>`

#### Step 5c: Resolve Lockfiles (package-lock.json)

- Do NOT manually edit or merge conflict markers
- Accept the cherry-picked side: `git checkout --theirs path/to/package-lock.json`
- **Regenerate immediately via wrapper before committing:**

  ```bash
  # Standard flow: just run npm install via wrapper for affected project.
  COMPOSE_PROJECT_NAME=ngmocks_rebase_<unique> sh compose.sh <affected-target>

  ```

- If the wrapper fails, report the command, error, and remaining work to the user and discuss the solution before
  trying a workaround. Use the `update-package-locks` skill when a lockfile refresh is agreed as the next step.
- Stage the regenerated lockfile: `git add path/to/package-lock.json`

#### Step 5d: Complete the Cherry-Pick

```bash
git cherry-pick --continue
# Or if no auto-commit: git commit -m "original commit message"
```

### 6. Apply Stash (if one was created)

```bash
git stash list
git stash apply <stash-ref>

# If conflicts occur, resolve using the same rules as step 5
# Regenerate lockfiles via wrapper before committing if needed
```

### 7. Cleanup

```bash
git branch -d "$BACKUP_BRANCH"
# If rebased commit hashes make the safe delete fail, inspect the output first:
git cherry -v HEAD "$BACKUP_BRANCH"
# Delete forcibly only after every listed commit is marked `-`.
git branch -D "$BACKUP_BRANCH"
```

### 8. Validation

Read `AGENTS.md` and the relevant repo skills from the updated branch, even when replaying commits produced
no conflicts. Review the branch's implementation, specs, and docs against those instructions and the closest
current examples. Apply required style or workflow changes before running validation or updating the PR.

Run validation for affected targets:

```bash
COMPOSE_PROJECT_NAME=ngmocks_rebase_<unique> sh test.sh <affected-target> # For specific project/suite changes
COMPOSE_PROJECT_NAME=ngmocks_rebase_<unique> sh test.sh root # Only when root files changed
COMPOSE_PROJECT_NAME=ngmocks_rebase_<unique> sh test.sh e2e # Only when tests-e2e or shared e2e files changed
```

## Conflict Resolution Quick Reference

When conflicts occur during cherry-pick, resolve in this order:

1. **Source files**: Standard merge resolution
2. **package.json**: Manual edit per dependency (see Step 5b)
3. **package-lock.json**: `git checkout --theirs` then regenerate via wrapper (see Step 5c)

## Guardrails

- This skill is branch-agnostic: works from any current local branch
- `upstream/main` is only the default target; override when user provides another remote branch
- Always create backup branch before `git reset --hard`
- Only stash when local changes actually exist (check with `git status --short`)
- Follow `AGENTS.md`'s Docker-only execution rule for all installs, builds, tests, and checks. Never use local runtimes
  or custom validation scripts, including inside Docker, and never bypass hooks or checks.
- Use a unique `COMPOSE_PROJECT_NAME` whenever another worktree or agent session may be active.
- **Regenerate lockfiles immediately after resolving conflicts, before committing each cherry-pick** - this keeps each commit atomic and correct
