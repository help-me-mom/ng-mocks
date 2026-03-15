# ng-mocks Agent Runbook

## Source of Truth

- Keep agent guidance aligned with the current repository files:
  - `README.md`
  - `CONTRIBUTING.md`
  - `compose.sh`
  - `test.sh`
  - `compose.yml`
  - `package.json`
- If docs and executable files disagree, trust the current scripts and config first, then update the docs.

## AI Agents Compatibility

- This repository should work cleanly with both Codex and OpenCode.
- When a repo skill applies, translate its workflow into a plain Markdown task list before doing substantial work.
- Use simple checkboxes or numbered items that render anywhere. Avoid agent-specific planning syntax in repo guidance.
- A good default task list is:

  ```md
  - [ ] Inspect the current repo state and source-of-truth docs
  - [ ] Apply the focused changes
  - [ ] Run the required validation
  - [ ] Summarize results, risks, and follow-ups
  ```

- Keep the task list updated as work progresses. If scope changes, rewrite the list so it still matches the real task.

## Wrapper-First Workflow

- For dependency bootstrap, lockfile refreshes, and test execution, use the repo wrappers instead of ad-hoc local installs:
  - `sh compose.sh <target>`
  - `sh test.sh <target>`
- If multiple worktrees or agent sessions run in parallel, set a unique compose namespace:
  - `COMPOSE_PROJECT_NAME=ngmocks_<unique> sh compose.sh <target>`
  - `COMPOSE_PROJECT_NAME=ngmocks_<unique> sh test.sh <target>`

## Local npm / nvm Flows

- `CONTRIBUTING.md` still documents local `nvm use`, `npm run test`, and `npm run test:debug` flows.
- Treat those as human debugging or fallback instructions, not the default automation path for agents.
- Release steps and IE/manual debugging remain local/manual workflows.

## Compatibility Guidance

- `ng-mocks` currently documents support for Angular 5 through Angular 20.
- Angular 5-8 are pre-Ivy.
- Angular 9-11 have both View Engine and Ivy coverage in the repo scripts.
- Angular 12-20 are Ivy-only in the current repo setup.
- Standalone, signals, and defer support must match the compatibility tables in `README.md` and `docs/articles/index.md`.
- Do not claim support beyond those tables unless you update the tables and the implementation together.

## Code Quality Commands

- Run root quality checks through the main service container:
  - `docker compose run --rm ng-mocks npm run prettier:repo`
  - `docker compose run --rm ng-mocks npm run prettier:check`
  - `docker compose run --rm ng-mocks npm run lint`
  - `docker compose run --rm ng-mocks npm run ts:check`
- If multiple worktrees are active, prefix direct `docker compose` commands with the same `COMPOSE_PROJECT_NAME` you use for wrappers so the checks stay inside that worktree's compose project.
- Run Prettier before `git commit`.

## Lockfiles and Dependency Refresh

- Keep this section short on purpose. The step-by-step workflow belongs in the repo skill `.agents/skills/update-package-locks/SKILL.md`.
- The runbook only needs the guardrail:
  - never delete `package-lock.json` files to regenerate them
  - for lockfile conflicts, do not hand-merge the conflict block; reject the remote lockfile side for the affected project, then run the wrapper-based update flow and the normal wrapper-based install flow for that same target
  - use the lockfile skill when a refresh is actually required
  - if multiple worktrees are active, use a unique `COMPOSE_PROJECT_NAME`

## Angular Major and E2E Maintenance

- Start with `CONTRIBUTING.md` for Angular major and e2e maintenance tasks.
- If `CONTRIBUTING.md` and the current repo layout disagree, trust the current files and update the docs as part of the work.

## Validation Expectations

- Minimum validation after code, dependency, or workflow changes:
  1. Run `sh test.sh <target>` for each project or suite whose files changed
  2. Run `sh test.sh root` only when root files changed
  3. Run `sh test.sh e2e` only when `tests-e2e` or shared e2e files changed
  4. Run `sh test.sh coverage` when core behavior or coverage-sensitive code changes
- For docs-only or agent-guidance-only changes, tests may be skipped, but say so explicitly in the final summary.

## Git Safety

- Do not use destructive git commands such as `git reset --hard` or force-push unless the user explicitly asked for history rewriting.
- For rebases or conflict-heavy work, inspect branch state first and prefer recoverable steps.
- If rewrite work is necessary, create a safety branch before destructive operations whenever possible.

## Expectations for Repo Skills

- Keep `.agents/skills/*/SKILL.md` synchronized with this runbook and the actual scripts.
- Every repo skill should include:
  1. When to use it
  2. A plain Markdown task list template
  3. Exact repo commands
  4. Required validation
  5. Safety guardrails
