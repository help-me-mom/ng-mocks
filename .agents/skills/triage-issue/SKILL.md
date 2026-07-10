---
name: triage-issue
description: Use when triaging or fixing ng-mocks GitHub issues and bug reports in a dedicated worktree based on upstream/main, with a local issue-* regression test, a focused source fix, coverage validation, e2e matrix checks, a conventional commit message, and a pull request.
---

# Triage Issue

Use this workflow to turn a reported ng-mocks issue into a reproducible local test, a minimal fix, validated coverage, and publish-ready GitHub artifacts. Keep these instructions tool-neutral: prefer repo scripts, shell commands, and plain Markdown that any LLM, agent, or human contributor can follow.

## Task List

Create and maintain a plain Markdown checklist:

```md
- [ ] Inspect repo state, source-of-truth docs, and the GitHub issue
- [ ] Create a dedicated issue worktree from `upstream/main`
- [ ] Reproduce the bug with a local `issue-*` regression test
- [ ] Fix the implementation without changing the reproducer test
- [ ] Run coverage and affected e2e validation
- [ ] Prepare comments, commit message, and PR against `upstream/main`
```

## Workflow

1. Inspect the local repo before touching files:
   - `git status --short`
   - `git remote -v`
   - `git fetch upstream --prune`
   - read `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `compose.sh`, `test.sh`, `compose.yml`, `package.json`, `test-spread.conf`, and `test-spread-app.conf` when they affect the issue
2. Inspect issue context:
   - Use available GitHub access: `gh`, the GitHub web UI, the GitHub API, or any configured connector.
   - Prefer commands that are easy to reproduce, such as `gh issue view <issue-number> --repo help-me-mom/ng-mocks --comments`.
   - Search duplicates and related work with `gh issue list`, `gh pr list --search`, GitHub search, and local `git log --grep`.
   - Inspect prior fixes with similar symptoms: `git log --no-merges --oneline --all -- 'tests/issue-*' 'tests-e2e/src/issue-*' 'e2e/*/src/tests/issue-*'`.
3. Create a dedicated worktree before changing files:
   - default branch name: `issues/<issue-number>`
   - default worktree path: `../ng-mocks-issue-<issue-number>`
   - default base: latest `upstream/main`
   - default compose namespace: `COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp>`
   - do not perform issue triage edits in the original checkout
   - do not discard unrelated local changes in the original checkout; the worktree isolates the issue branch from them

   ```bash
   git fetch upstream --prune
   git worktree list
   git worktree add -b issues/<issue-number> ../ng-mocks-issue-<issue-number> upstream/main
   cd ../ng-mocks-issue-<issue-number>
   git status --short
   ```

   If `issues/<issue-number>` or the default worktree path already exists, inspect it with `git worktree list`, `git status --short`, and `git log --oneline --decorate --max-count=10`. Reuse it only when it is already the dedicated worktree for this issue. Otherwise create a timestamped branch and path from `upstream/main`, for example `issues/<issue-number>-<timestamp>` and `../ng-mocks-issue-<issue-number>-<timestamp>`.

4. Reproduce before fixing:
   - Add the smallest local test that fails on the current implementation and passes only after the real fix.
   - Keep the test focused on the reported behavior, not the eventual implementation detail.
   - After the failing repro is captured, do not weaken or rewrite it to fit the fix. Mechanical compile fixes are acceptable only when they preserve the same failure.
5. Fix narrowly:
   - Change source code after the reproducer exists.
   - Prefer existing ng-mocks helpers and patterns over new abstractions.
   - Add code comments only for non-obvious Angular behavior, compatibility constraints, or private API handling.
   - Do not hide failures with skips, broad version exclusions, relaxed assertions, or coverage ignores unless the issue truly cannot be represented otherwise.

## Test Placement

Choose the location by runtime surface:

- `tests/issue-<issue-number>/test.spec.ts`: default for core library regressions. These files are spread into versioned Angular e2e projects through `test-spread.conf`.
- `tests-e2e/src/issue-<issue-number>/test.spec.ts`: use for external library integration, Angular features that cannot compile across the spread matrix, or app-level behavior covered by `tests-e2e`.
- `e2e/jest/src/tests/issue-<issue-number>/test.spec.ts`: use for Jest-only behavior, Jest snapshots, or `jest.mock` interactions.
- `e2e/jasmine/src/tests/issue-<issue-number>/test.spec.ts`: use for Jasmine-only behavior.
- `e2e/min/src/tests/issue-<issue-number>/test.spec.ts`: use for package/minified consumer behavior.

When adding a spread test:

- Give selectors, classes, and marker methods issue-specific names where collisions are possible.
- Match nearby compatibility style, including `VERSION.major` guards and metadata casts such as `['standalone' as never]` when older TypeScript or Angular targets still parse the file.
- If a file imports APIs unavailable in older Angular targets, gate it in `test-spread.conf` with `versions=` or `features=` instead of relying only on runtime guards.
- Prefer one `describe('issue-<number>')` suite with assertions that prove the reported failure and the expected behavior.
- Add an in-file `// @see https://github.com/help-me-mom/ng-mocks/issues/<issue-number>` link near the regression suite. For subtle regressions, add a short comment block that explains the reported failure, the root cause, and the fix so future readers do not need to reconstruct the issue from the PR.

## Validation

Run validation from the dedicated issue worktree. Use repo wrappers for required validation. Use a unique `COMPOSE_PROJECT_NAME` when another worktree or automation session might be active.

```bash
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> sh compose.sh root
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> sh test.sh root
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> sh test.sh coverage
```

For a tight reproduction loop after dependencies are installed, a targeted container run is acceptable, but it does not replace wrapper validation:

```bash
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> \
  docker compose run --rm -e KARMA_SUITE='./tests/issue-<issue-number>/**/*.ts' ng-mocks npm run test
```

Run affected e2e targets:

- If `tests/issue-*` changed, run every target whose `test-spread.conf` rules include that file when feasible.
- At minimum for broad spread coverage, run the oldest included target, an Angular 9 target when the file reaches View Engine/Ivy crossover coverage, the first target for any feature gate, and the latest target.
- Current representative major targets are `a5`, `a9`, `a14`, `a17`, `a20`, and `a22`; skip targets that `test-spread.conf` excludes for this file.
- Run `jasmine`, `jest`, `min`, or `nx` when the issue touches runner behavior, packaging, snapshots, minified consumption, or Nx integration.
- If `tests-e2e/src` changed, run `sh test.sh e2e`.
- If files under a specific `e2e/<target>` project changed, run `sh compose.sh <target>` when dependencies changed and `sh test.sh <target>` afterward.

Before committing:

```bash
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> docker compose run --rm ng-mocks npm run prettier:repo
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> docker compose run --rm ng-mocks npm run prettier:check
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> docker compose run --rm ng-mocks npm run lint
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> docker compose run --rm ng-mocks npm run ts:check
```

Coverage expectations:

- Treat `sh test.sh coverage` as required for source fixes.
- Inspect changed source files in `test-reports/coverage/lcov.info` or the generated HTML report if coverage is uncertain.
- The PR should keep project and patch coverage at 100%. If Codecov later reports uncovered patch lines, add assertions before updating the PR.

## Comments, Commit, PR

Use the same concise structure for issue comments, PR descriptions, and non-trivial commit bodies. Keep validation details internal to the agent run and final user summary; do not put validation commands, logs, or results in GitHub comments, commit bodies, or PR descriptions.

```md
Why:

- The reported failure happens when ...

What:

- Added `tests/issue-<issue-number>/test.spec.ts` to reproduce ...
- Changed `libs/ng-mocks/...` so ...

Where:

- `tests/issue-<issue-number>/test.spec.ts`
- `libs/ng-mocks/src/lib/...`
```

Commit message rules:

- Use conventional commits accepted by `.commitlintrc.yml`.
- Prefer `fix(<scope>): <imperative summary> #<issue-number>` for bug fixes, or `test(<scope>): ...` only for test-only changes.
- Keep the issue number in the subject when it improves traceability.
- Add a body with `Why`, `What`, and `Where` when the fix is subtle.

PR rules:

- Open the PR against `help-me-mom/ng-mocks` base `main`, from the pushed issue branch.
- Confirm the PR branch was created in the dedicated worktree from `upstream/main`.
- Include `Closes #<issue-number>` or `Fixes #<issue-number>` in the PR body.
- Describe the problem and how it was fixed; omit validation commands and results.
- Link related issues, duplicate reports, and previous PRs when they influenced the fix.
- Do not commit, push, post GitHub comments, or create a PR when the requester explicitly asks to review locally first.

## Guardrails

- Do not start with a source fix before a failing local reproduction exists unless the bug is already covered by an existing failing test.
- Do not triage issue fixes in the original checkout; create or reuse a dedicated worktree based on `upstream/main` first.
- Do not change the reproducer after fixing source behavior, except for mechanical compatibility edits that preserve the original failure.
- Do not delete or regenerate lockfiles for ordinary issue fixes. If dependency refresh is required, use the `update-package-locks` skill.
- Do not claim full matrix validation unless every affected target was run. State skipped targets and why.
- Trust current scripts and config over stale docs, then update docs if the issue changes documented compatibility.
- Keep the final patch scoped to the issue. Avoid unrelated refactors, formatting churn, and dependency changes.
