---
name: triage-angular-upgrade-prs
description: Use when ng-mocks fails on an Angular dependency PR and you need to create an isolated worktree, inspect PR CI logs, reproduce the failure, diff Angular implementation changes, patch ng-mocks without changing tests, and validate backward compatibility plus coverage.
---

# Triage Angular Upgrade PRs

Use this skill for Angular dependency PRs where CI starts failing because Angular changed runtime behavior and ng-mocks must stay compatible across supported versions.

## Task List

Create a plain Markdown checklist that works in any agent UI:

```md
- [ ] Inspect the PR metadata, changed files, and failing CI jobs
- [ ] Create an isolated worktree from the PR branch and bootstrap the affected target
- [ ] Reproduce the failure locally with wrapper commands
- [ ] Compare the old and new Angular implementation to identify the behavioral change
- [ ] Patch ng-mocks without changing tests and keep compatibility with earlier Angular versions
- [ ] Add focused regression coverage for the new compatibility path
- [ ] Run target, backward-compatibility, and coverage validation
- [ ] Summarize the Angular change, the ng-mocks fix, and any remaining risks
```

## Workflow

1. Inspect the PR and identify the affected Angular target and dependency bump.
2. Read the failing CI job logs before changing code so the reproduction target is clear.
3. Create a dedicated worktree from the PR branch. If the main checkout is dirty, leave it alone.
4. Use a unique `COMPOSE_PROJECT_NAME` for the worktree, then run `sh compose.sh <target>` if that target has not been bootstrapped yet.
5. Reproduce with `sh test.sh <target>` and capture the first failing assertions.
6. Diff Angular's implementation, not just public changelog text. Find the code path that changed and explain why ng-mocks no longer attaches or intercepts behavior correctly.
7. Fix ng-mocks itself. Do not patch or weaken tests to fit the regression.
8. Keep the fix version-agnostic when possible. Prefer handling both the old eager Angular shape and the new lazy Angular shape in the same code path.
9. Add regression tests that exercise the new compatibility branch and keep coverage on the changed code at 100%.
10. Validate the failing target, at least one previous Angular target that shares the behavior, and `sh test.sh coverage`.

## Commands

```bash
# Inspect the PR and failing jobs
gh pr view <pr-number> --json number,title,url,headRefName,baseRefName,files,statusCheckRollup
gh run list --branch <head-ref> --limit 10
gh run view <run-id> --log-failed

# Create an isolated worktree from the PR branch
git fetch origin <head-ref>
git worktree add ../ng-mocks-pr-<pr-number> -b pr-<pr-number>-<slug> origin/<head-ref>

# Worktree-local wrapper flow
COMPOSE_PROJECT_NAME=ngmocks_pr<pr-number> sh compose.sh <target>
COMPOSE_PROJECT_NAME=ngmocks_pr<pr-number> sh test.sh <target>
COMPOSE_PROJECT_NAME=ngmocks_pr<pr-number> sh test.sh <previous-target>
COMPOSE_PROJECT_NAME=ngmocks_pr<pr-number> sh test.sh coverage

# Optional Angular implementation diff in a temp folder
mkdir -p /tmp/ngmocks-angular-diff && cd /tmp/ngmocks-angular-diff
npm pack @angular/forms@<old-version> @angular/forms@<new-version>
tar -xzf angular-forms-<old-version>.tgz
mv package package-old
tar -xzf angular-forms-<new-version>.tgz
mv package package-new
diff -ru package-old package-new
```

## Validation

- `COMPOSE_PROJECT_NAME=<unique> sh test.sh <target>` for the failing Angular target
- `COMPOSE_PROJECT_NAME=<unique> sh test.sh <previous-target>` for at least one earlier Angular target that exercises the same code path
- `COMPOSE_PROJECT_NAME=<unique> sh test.sh coverage` after the regression tests are in place

## Guardrails

- Do not change tests just to match Angular's new behavior; fix ng-mocks.
- Do not assume the CI failure is a dependency-install issue when the failing assertions point to Angular runtime changes.
- Do not ship Angular-version-specific hacks unless a shared compatibility path is impossible.
- Do not edit, refresh, or commit any `package-lock.json` files as part of this workflow. If bootstrap creates lockfile drift, restore it before finishing.
- Do not disturb unrelated local changes in the main checkout; keep the work in the PR worktree.
- Do not use ad-hoc local installs when the wrapper flow covers bootstrap and validation.
- If the change would extend official Angular support beyond the documented matrix, update the docs and compatibility tables together with the implementation.
