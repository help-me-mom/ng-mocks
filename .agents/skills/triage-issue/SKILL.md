---
name: triage-issue
description: Use when triaging or fixing ng-mocks GitHub issues and bug reports in a dedicated worktree based on upstream/main, with a local issue-* regression test, a focused source fix, coverage validation, e2e matrix checks, a conventional commit message, and a pull request.
---

# Triage Issue

Use this workflow to turn a reported ng-mocks issue into a reproducible local test, a minimal fix, validated coverage, and publish-ready GitHub artifacts. Keep these instructions tool-neutral: prefer repo scripts, shell commands, and plain Markdown that any LLM, agent, or human contributor can follow.

For a docs-only issue, follow the example and documentation steps. Add runtime changes only for a demonstrated
behavior gap; a request for documentation does not require inventing a source fix.

## Task List

Create and maintain a plain Markdown checklist:

```md
- [ ] Inspect repo state, source-of-truth docs, and the GitHub issue
- [ ] Create a dedicated issue worktree from `upstream/main`
- [ ] Find the closest functional examples and read their specs and docs before implementing
- [ ] Reproduce the bug with a local `issue-*` regression test
- [ ] Fix the implementation without changing the reproducer test
- [ ] Clear affected Angular CLI caches and run coverage and e2e validation
- [ ] Update the matching docs and review them against the executable examples
- [ ] Prepare the commit and PR against `upstream/main`
- [ ] Verify the requested CI status on the current PR commit
```

## Workflow

1. Inspect the local repo before touching files:
   - `git status --short`
   - `git remote -v`
   - `git fetch upstream --prune`
   - read `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `compose.sh`, `test.sh`, `compose.yml`, `package.json`,
     `test-spread.conf`, and `test-spread-app.conf` when they affect the issue
   - read `.commitlintrc.yml`, `.releaserc.yml`, and `semantic-release-release-notes.mjs` when the work changes release
     behavior or the correct release classification is unclear
2. Inspect issue context:
   - Use available GitHub access: `gh`, the GitHub web UI, the GitHub API, or any configured connector.
   - Prefer commands that are easy to reproduce, such as `gh issue view <issue-number> --repo help-me-mom/ng-mocks --comments`.
   - Search duplicates and related work with `gh issue list`, `gh pr list --search`, GitHub search, and local `git log --grep`.
   - Follow [Spec and Documentation Examples](../../../AGENTS.md#spec-and-documentation-examples): read the
     closest functional specs and their articles, record the reference paths, and use their structure and style.
     Consult analogous human-authored history when the pattern remains unclear.
   - Inspect prior fixes with similar symptoms: `git log --no-merges --oneline --all -- 'tests/issue-*' 'tests-e2e/src/issue-*' 'e2e/*/src/tests/issue-*'`.
3. Create a dedicated worktree before changing files:
   - default branch name: `issues/<issue-number>`
   - default worktree path: `../ng-mocks-issue-<issue-number>`
   - default base: latest `upstream/main`
   - default compose namespace: `COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp>`
   - do not perform issue triage edits in the original checkout
   - do not discard unrelated local changes in the original checkout; the worktree isolates the issue branch from them
   - run installs, builds, tests, checks, and commits from the issue worktree; do not use the original checkout as a
     fallback working directory or change its branch
   - do not mount the original checkout or its `.git` directory into the worktree's Docker containers; report linked
     Git metadata failures and discuss a supported solution without weakening worktree isolation

   ```bash
   git fetch upstream --prune
   git worktree list
   git worktree add -b issues/<issue-number> ../ng-mocks-issue-<issue-number> upstream/main
   cd ../ng-mocks-issue-<issue-number>
   git status --short
   ```

   If `issues/<issue-number>` or the default worktree path already exists, inspect it with `git worktree list`, `git status --short`, and `git log --oneline --decorate --max-count=10`. Reuse it only when it is already the dedicated worktree for this issue. Otherwise create a timestamped branch and path from `upstream/main`, for example `issues/<issue-number>-<timestamp>` and `../ng-mocks-issue-<issue-number>-<timestamp>`.

   If Git hooks fail because Docker cannot access a linked worktree's external Git metadata, report the failure
   and discuss using a self-contained clone as the independent issue worktree. For that solution, clone into a new
   issue directory, configure `upstream`, and create the issue branch there. Preserve the original worktree, stage
   the intended patch, and transfer it with `git diff --cached --binary` and `git apply --index`. Run `sh compose.sh root`
   in the new checkout to install its dependencies and hooks. Do not mount the primary checkout's Git metadata or
   disable hooks; the root `lint:staged` and `commitlint` scripts let those checks run inside Docker.

   ```bash
   git clone --origin upstream --branch main https://github.com/help-me-mom/ng-mocks.git ../ng-mocks-issue-<issue-number>-pr
   cd ../ng-mocks-issue-<issue-number>-pr
   git switch -c issues/<issue-number> upstream/main
   COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> sh compose.sh root
   ```

4. Reproduce before fixing:
   - Add the smallest local test that fails on the current implementation and passes only after the real fix.
   - Keep the test focused on the reported behavior, not the eventual implementation detail.
   - After the failing repro is captured, do not weaken or rewrite it to fit the fix. Mechanical compile fixes are acceptable only when they preserve the same failure.
5. Fix narrowly:
   - Change source code after the reproducer exists.
   - Prefer existing ng-mocks helpers and patterns over new abstractions.
   - Add code comments only for non-obvious Angular behavior, compatibility constraints, or private API handling.
   - Do not hide failures with skips, broad version exclusions, relaxed assertions, or coverage ignores unless the issue truly cannot be represented otherwise.
6. Update and review documentation:
   - Keep testing a real declaration and mocking a dependency clear, with separate articles for independent APIs.
     Identify decorator and signal variants where both exist.
   - Follow the [docs-example skill](../clean-doc-examples/SKILL.md) when syncing published snippets. Keep them
     readable for the stated Angular version and preserve the executable specs' coverage.
   - Use sidebar navigation for new guides; do not add incidental backlinks to existing articles.

## Test Placement

| Purpose                        | Location                                                         |
| ------------------------------ | ---------------------------------------------------------------- |
| Documented core use case       | `examples/<ExampleName>/test.spec.ts`                            |
| Variant of that example        | A file such as `examples/<ExampleName>/signals.spec.ts`          |
| Focused library regression     | `tests/issue-<number>/test.spec.ts`                              |
| External integration           | The matching suite under `tests-e2e/src`                         |
| Runner or packaging regression | The matching suite under `e2e/jest`, `e2e/jasmine`, or `e2e/min` |

Core examples belong in `examples`, including compiler-dependent variants; do not put them in
`tests-e2e/src/app`. Follow neighboring filenames and suite names. Keep issue reproducers under
`describe('issue-<number>')`, with an `@see` issue link and a short root-cause comment when needed.

Follow [Test Style](../../../AGENTS.md#test-style): static imports, inline setup and assertions, and no test helpers.
Use `test-spread.conf` for actual API, version, and environment boundaries. Keep classic and modern APIs in
separate files when their boundaries differ. For APIs that need Angular compilation, follow the existing
compiler-metadata check pattern and confirm the compiled spread runners execute the cases.

Retain compatibility syntax only where an included target needs it. Do not copy legacy runtime version skips
or add marker methods without a concrete need.

## Validation

Run validation from the dedicated issue worktree. Use repo wrappers for required validation. Use a unique `COMPOSE_PROJECT_NAME` when another worktree or automation session might be active.

Choose checks using [Validation Expectations](../../../AGENTS.md#validation-expectations). The commands below
apply to source fixes; docs-only or guidance-only edits may skip wrapper tests with an explicit final summary.

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

Modern versioned Angular projects retain `.angular/cache` in the bind-mounted `e2e/a<major>` workspace across
containers. For each affected target whose CLI supports `ng cache`, clear the cache inside Docker before its final
run after source changes. Run `compose.sh` first when the target dependencies have not been prepared:

```bash
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> sh compose.sh a<major>
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> \
  docker compose run --rm a<major> npm run ng -- cache clean
COMPOSE_PROJECT_NAME=ngmocks_issue<issue-number>_<timestamp> sh test.sh a<major>
```

Do not infer a source regression from output that may have reused an older compiled bundle. If a result contradicts
the current source or the focused reproducer, inspect `e2e/a<major>/node_modules/ng-mocks`, clear the target cache,
and rerun the wrapper before changing implementation or test code.

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

Use this concise structure for pull request descriptions. Use equivalent prose in issue comments or non-trivial commit
bodies only when it helps that artifact. Prefer `Impact` for user-visible or maintainer outcomes and `Where` when the
affected locations are more informative. Keep validation details internal to the agent run and final user summary; do
not put validation commands, logs, or results in GitHub comments, commit bodies, or PR descriptions.

```md
## Why

- The reported failure happens when ...

## What

- Added `tests/issue-<issue-number>/test.spec.ts` to reproduce ...
- Changed `libs/ng-mocks/...` so ...

## Impact

- Callers now ... while ... remains unchanged.
```

Commit message rules:

- Follow the canonical `Commit and Release Semantics` section in `AGENTS.md`. Make every local commit accurate; make
  the PR title express the aggregate and highest release effect. Align them on a single-commit branch.
- Prefer `fix(<scope>): <imperative summary> #<issue-number>` for fixes to published behavior, or
  `test(<scope>): ...` for test-only changes. Classify release, build, and internal work by the AGENTS.md matrix.
- Keep the issue number in the subject when it improves traceability.
- Add a body with `Why`, `What`, and `Impact` or `Where` when the fix is subtle.

PR rules:

- Open the PR against `help-me-mom/ng-mocks` base `main`, from the pushed issue branch.
- Confirm the PR branch was created in the dedicated worktree from `upstream/main`.
- Use a conventional PR title that summarizes the complete change and its highest release effect.
- Include `Closes #<issue-number>` or `Fixes #<issue-number>` when this PR completes the reported issue. Use
  `Related to`, `Follow-up to`, or equivalent wording when it should not close the reference.
- Describe the root cause, focused fix, regression coverage, documentation changes, and impact as applicable; omit
  validation commands and results.
- Link related issues, duplicate reports, and previous PRs when they influenced the fix.
- Do not commit, push, post GitHub comments, or create a PR when the requester explicitly asks to review locally first.
- Follow [Validation Expectations](../../../AGENTS.md#validation-expectations) when reporting CI status.
  If green CI is requested, verify all required checks on the pushed commit before handing back the PR.

## Guardrails

- Do not start with a source fix before a failing local reproduction exists unless the bug is already covered by an existing failing test.
- Do not triage issue fixes in the original checkout; create or reuse a dedicated worktree based on `upstream/main` first.
- Do not change the reproducer after fixing source behavior, except for mechanical compatibility edits that preserve the original failure.
- Do not delete or regenerate lockfiles for ordinary issue fixes. If dependency refresh is required, use the `update-package-locks` skill.
- Follow `AGENTS.md`'s Docker-only execution rule: use the existing wrappers or repo Compose services running existing
  npm scripts for installs, builds, tests, and checks. Never use local runtimes or custom validation scripts, even for
  diagnostics or inside Docker.
- If an approved command fails or required tooling is missing, report the command, error, and remaining work to the
  user and discuss the solution before trying a workaround. Do not bypass hooks or checks.
- Do not claim full matrix validation unless every affected target was run. State skipped targets and why.
- Trust current scripts and config over stale docs, then update docs if the issue changes documented compatibility.
- Keep the final patch scoped to the issue. Avoid unrelated refactors, formatting churn, and dependency changes.
