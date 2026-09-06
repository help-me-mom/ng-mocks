# ng-mocks Agent Runbook

## Source of Truth

- Keep agent guidance aligned with the current repository files:
  - `README.md`
  - `CONTRIBUTING.md`
  - `docs/articles/index.md`
  - `compose.sh`
  - `test.sh`
  - `compose.yml`
  - `package.json`
  - `.commitlintrc.yml`
  - `.releaserc.yml`
  - `semantic-release-release-notes.mjs`
  - `test-spread.conf`
  - `test-spread-app.conf`
- If docs and executable files disagree, trust the current scripts and config first, then update the docs.

## AI Agents Compatibility

- This repository should work cleanly with as many LLMs and coding agents as practical, including OpenAI/Codex, Claude, and OpenCode.
- Keep LLM-related repo guidance and config LLM-agnostic by default. Avoid vendor-specific metadata, planning syntax, tool names, or assumptions unless a file is explicitly scoped to one platform.
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

## Docker-Only Execution

- For dependency installation, lockfile refreshes, library and docs builds, tests, formatting, linting, type checks,
  and other executable validation, use only the existing repo entry points and Docker images configured in `compose.yml`:
  - `sh compose.sh <target>`
  - `sh test.sh <target>`
  - `docker compose run --rm <service> npm run <existing-script>` for a script already in that project's `package.json`
- Never invoke local Python, Node.js, npm, npx, nvm, or another host runtime to perform these operations, including
  diagnostics. Invoke the existing wrappers as provided; do not extract or reimplement their steps locally.
- Do not write custom Python, JavaScript, Bash, or shell logic, temporary scripts, inline probes, or replacement
  runners to build, test, or check the repo. Running that custom logic inside Docker is also prohibited. Add requested
  regression tests to the existing suites and execute them through the existing repo commands.
- Ordinary file inspection and editing, searches with `rg`, and Git/GitHub operations remain available; they do not
  authorize custom executable validation.
- If an approved command fails or the available tooling cannot perform a required operation, report the command,
  error, and remaining work to the user and discuss the solution before trying a workaround. Do not silently switch
  runtimes or images, bypass hooks or checks, add temporary Compose overrides, or create new validation tooling.
- If multiple worktrees or agent sessions run in parallel, set a unique compose namespace:
  - `COMPOSE_PROJECT_NAME=ngmocks_<unique> sh compose.sh <target>`
  - `COMPOSE_PROJECT_NAME=ngmocks_<unique> sh test.sh <target>`

## Worktree Isolation

- Perform issue edits, dependency installation, builds, tests, checks, and commits in the issue's independent worktree
  and branch. Do not use the primary project checkout as a working directory or change its working files or branch.
- Run the existing Docker commands from that worktree so their bind mounts and generated files belong to it.
- Do not mount the primary checkout or its `.git` directory into a worktree's containers to repair tooling failures.
  A linked worktree's normal Git metadata sharing does not authorize using the primary checkout as a build workspace
  or adding it as a Docker mount.
- If a tool cannot work with the isolated worktree, report the error and discuss a supported solution with the user.
  Do not move execution to the primary checkout or weaken the isolation to make a check pass.

## Angular CLI Cache

- Modern versioned Angular projects retain `.angular/cache` in the bind-mounted `e2e/a<major>` workspace across
  containers. Rebuilding and copying `ng-mocks` does not guarantee that the Angular CLI invalidates previously
  compiled test bundles.
- For each affected target whose CLI supports `ng cache`, clear the cache inside Docker before the final
  `sh test.sh a<major>` validation. Use the same `COMPOSE_PROJECT_NAME` for both commands:

  ```bash
  COMPOSE_PROJECT_NAME=ngmocks_<unique> docker compose run --rm a<major> npm run ng -- cache clean
  COMPOSE_PROJECT_NAME=ngmocks_<unique> sh test.sh a<major>
  ```

- If a compatibility result contradicts the current source or a focused reproducer, inspect the package copied to
  `e2e/a<major>/node_modules/ng-mocks`, clear the target cache, and rerun the wrapper before changing the source or
  weakening the test.

## Local npm / nvm Flows

- `CONTRIBUTING.md` still documents local `nvm use`, `npm run test`, and `npm run test:debug` flows.
- Those are human-only instructions, not an authorized fallback for agents. The Docker-only execution rule also
  applies to agent diagnostics.
- Release steps and IE/manual debugging remain human local/manual workflows.

## Compatibility Guidance

- `ng-mocks` currently documents support for Angular 5 through Angular 22.
- Angular 5-8 are pre-Ivy.
- Angular 9-11 have both View Engine and Ivy coverage in the repo scripts.
- Angular 12-22 are Ivy-only in the current repo setup.
- Use `view-engine-zoned`, `ivy-zoned`, and `ivy-zoneless` as the compatibility profile names. Angular 5-8 use
  `view-engine-zoned`; Angular 9-11 use both zoned engine profiles; Angular 12-19 use `ivy-zoned`; and Angular 20-22
  use both Ivy profiles.
- Standalone, signals, and defer support must match the compatibility tables in `README.md` and `docs/articles/index.md`.
- Do not claim support beyond those tables unless you update the tables and the implementation together.
- When enabling new recommended lint rules, keep fixes that remain compatible with the supported Angular, Node.js, and ES targets. Disable rules that require newer framework APIs or runtime features, and leave a short reason beside the override.

## Package Metadata

- Keep the `description` value in `libs/ng-mocks/package.json` at 255 characters or fewer, including spaces and
  punctuation. Preserve this limit whenever updating the description.
- List Angular major versions individually in the description for search visibility; do not compress them into
  ranges. If space is needed, omit older versions from the description without changing the documented support.

## Spec and Documentation Examples

### Learn from existing examples

- Before editing specs or docs, read the closest functional specs and their matching articles. Choose by behavior:
  tables for rows and columns, form controls for input and validation, query examples for projected dependencies.
  Search across library boundaries when the feature has no direct example; a nearby file alone is not a reference.
  Compare bindings, rendered content, and kept or mocked dependencies.
- Start in `examples` and `tests` for core behavior, or `tests-e2e/src` and
  `docs/articles/guides/libraries` for integrations. Search by behavior as well as API names.
- Record the reference paths and why they apply. Follow their filenames, suite names, setup, ng-mocks helpers,
  inline assertions, and comments. Follow the articles' teaching order, tool links, and annotated examples.
- If those references do not settle a pattern, inspect analogous local history or merged non-bot PRs. Explain
  necessary departures, and compare the finished changes with the references before reporting completion.

### Place and name executable specs

- Put documented core use cases in `examples/<ExampleName>`. Use `test.spec.ts` for the classic case and a named
  variant such as `signals.spec.ts` beside it. Match existing suite names, such as `ExampleName:signals`.
- Put focused library regressions in `tests/issue-<number>` and integration cases in the appropriate
  `tests-e2e/src` suite. Do not put core example specs in `tests-e2e/src/app`.
- Follow `Test Style` for per-file version, feature, environment, and compiler constraints.

### Write the articles

- Distinguish testing a real declaration from mocking it as a dependency. Give independent API use cases separate
  articles and clearly identify decorator and signal examples. For content queries, keep separate testing and
  mocking articles for both `ContentChild` and `ContentChildren`, with both approaches in each article.
- Write each published example as ordinary code for one appropriate Angular version. Keep APIs, syntax, and
  defaults consistent, and state the version briefly when readers need it to use the example.
- Preserve the tested setup, behavior, and meaningful assertions. Remove compatibility-only flags, casts, guards,
  marker methods, and fallback syntax from the article. Keep options required by the example's Angular version
  or taught by the article. Keep compatibility machinery in executable specs, without per-version patch
  instructions in the live example. Use the [docs-example skill](.agents/skills/clean-doc-examples/SKILL.md).
- Check embedded snippets and source links against the executable specs before finishing.
- Use the sidebar to introduce guides. Do not add backlinks to existing articles unless requested; edit existing
  articles when their documented behavior changes or their content needs correction.

## Test Style

- Never add helper functions in tests. Keep setup, actions, and assertions inline, even when a short block is
  repeated, so the regression remains clear across spread targets.
- Prefer static ES imports. For APIs unavailable in older Angular targets, gate the file in `test-spread.conf`
  with `versions=` or `features=`. Do not bypass TypeScript compatibility with dynamic imports or runtime skips.
- Some root tests only transpile TypeScript. When an API requires Angular's compiler transform, follow the
  existing compiler-metadata check pattern and verify that compiled spread targets execute the real cases.
  This runner check does not replace the file's Angular version or feature gate.
- Keep the direct reproducer for an issue in `tests/issue-<number>` when that is the appropriate runtime surface. Add
  an in-file `@see` issue link near the suite and a concise root-cause comment when the failure is subtle. Put broader
  adjacent-policy audits in the relevant feature suite instead of expanding the issue test indefinitely.
- Gate spread tests at each API's actual introduction version, feature, and environment boundary, not only the
  reporter's Angular version. Split independently testable APIs when they have different compatibility boundaries;
  keep a cohesive regression at the first common boundary when it necessarily combines them.
- For framework-internal or multi-branch fixes, pair a focused source-unit spec with a real-Angular spread regression.
  Assert the reported outcome as well as preserved behavior and the absence of the relevant side effects.
- When a spread test depends on Zone.js, gate it with `environments=zoned` in `test-spread.conf` so the zoned and
  zoneless corpora remain isolated without project-specific exclusions.
- Keep CI-facing root test scripts named `test:<project>[:<es>]:<profile>`. Keep project-level profile script and
  config suffixes aligned with the same profile names; generic `test` scripts should run every supported profile.

## Code Quality Commands

- Run root quality checks through the main service container:
  - `docker compose run --rm ng-mocks npm run prettier:repo`
  - `docker compose run --rm ng-mocks npm run prettier:check`
  - `docker compose run --rm ng-mocks npm run lint`
  - `docker compose run --rm ng-mocks npm run ts:check`
- If multiple worktrees are active, prefix direct `docker compose` commands with the same `COMPOSE_PROJECT_NAME` you use for wrappers so the checks stay inside that worktree's compose project.
- Run Prettier before `git commit`.
- For tooling migrations, use official packages and their exported presets. Remove direct subpackages only when the official umbrella package replaces them and the repository no longer imports them.

## Lockfiles and Dependency Refresh

- Keep this section short on purpose. The step-by-step workflow belongs in the repo skill `.agents/skills/update-package-locks/SKILL.md`.
- The runbook only needs the guardrail:
  - never delete `package-lock.json` files to regenerate them
  - for lockfile conflicts, do not hand-merge the conflict block; keep the dependency PR's lockfile side as the regeneration base, then run the wrapper-based update and install passes for that target
  - resolve an existing dependency PR in an isolated worktree on that PR branch and push the result back to the same PR without rewriting history
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
- Report CI status for the current PR head. When the task requires green CI, wait for all required jobs and
  resolve failures within scope, or report the specific blocker. Do not infer success from local checks or a
  previous green commit.

## Commit and Release Semantics

- Make every local commit subject conventional and accurate for that commit. For squash merges, make the PR title a
  conventional summary of the complete PR and its highest release effect; align it with the local subject on a
  single-commit branch. GitHub normally uses that title for the squash commit.
- Use `type(optional-scope): imperative summary`: keep the type lowercase, preserve established scope casing such as
  `MockBuilder`, `TestBed`, or `README`, and do not end the subject with a period.
- `.commitlintrc.yml` accepts `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`,
  and `test`. Choose the type from the effect represented by that subject, whether it describes an individual commit
  or an aggregate PR, not merely the files touched and not the desired release outcome.

  | Commit form                                                             | Use it when                                                 | semantic-release result |
  | ----------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
  | `feat(<scope>): ...`                                                    | The published package gains a user-visible capability       | minor                   |
  | `fix(<scope>): ...`                                                     | Published behavior is corrected                             | patch                   |
  | `perf(<scope>): ...`                                                    | Published runtime performance improves                      | patch                   |
  | recognized `revert: ...`                                                | A commit from an earlier release is conventionally reverted | patch                   |
  | `docs(README): ...`                                                     | The packaged root README changes                            | patch                   |
  | `build`, `chore`, `ci`, other `docs`, `refactor`, `style`, or `test`    | The change should wait for another release trigger          | no release              |
  | any allowed type except `docs(README)` with a `BREAKING CHANGE:` footer | Published compatibility is intentionally broken             | major                   |

- A release-silent commit does not start a release by itself and is normally omitted from generated notes. Changes it
  makes to packaged inputs still ship once another commit triggers a package release. Use an accurate silent type for
  CI, tests, internal
  refactors, dependencies, agent guidance, or release tooling that does not change the published package. For
  example, a semantic-release configuration repair should use `build(release): ...`, not `fix(release): ...`.
- A conventional revert of an already released commit produces a patch. An original commit and its matching revert in
  the same unreleased range cancel each other; a plain `revert: ...` without `This reverts commit <hash>` is silent.
- `[skip release]` and `[release skip]` remove a commit from release analysis regardless of its type or footer. Use
  those markers only with explicit maintainer direction for an exceptional generated or duplicate commit, never to
  hide the release required by a user-visible change.
- Do not downgrade a user-visible fix or feature to a silent type to avoid a release. If one PR contains several
  related effects, select the type for the highest required release.
- semantic-release uses the Angular commit parser. Use the canonical `BREAKING CHANGE:` footer for a major release;
  do not rely on the `!` shorthand or `BREAKING-CHANGE:` because those forms do not trigger a major release here.
  The custom `docs(README)` rule always resolves to patch when it matches, so it must not label a breaking source or
  API change; the default Angular release notes still omit that docs entry.
- For squash merges, ensure the resulting commit subject uses the conventional PR title. True merges and rebase merges
  can also retain child commit messages. The highest release trigger among commits remaining after release-skip and
  revert-pair filtering wins.
- Keep commit headers and footer lines at 100 characters or fewer because commitlint enforces those limits. Wrap
  commit body prose at 100 characters as a repository convention even though the configured body limit is relaxed.
  Leave room in a PR title for GitHub's automatic ` (#<pr-number>)` suffix on the squash commit.

## Pull Request Quality

- Follow `Spec and Documentation Examples` before changing specs or docs. If current guidance and the selected
  examples still leave a pattern unclear, inspect analogous local history or recent merged non-bot PRs. Prefer human-authored examples over generated dependency-update text.
- Keep implementation narrow and follow `Test Style` for issue reproducers, compatibility gates, layered coverage,
  and preservation assertions.
- Update API docs, compatibility tables, or migration guidance in the same PR when the documented public contract,
  tested support claim, or a material upgrade path changes. Internal fixes that restore the documented contract do not
  require public docs. For a shipped behavior change likely to require user code or test updates, add migration
  guidance with affected versions, before/after examples, the safe update path, and explicitly unaffected cases.
- Update `AGENTS.md` and the relevant repo skill only when current guidance is wrong or missing and the lesson is
  repository-wide, repeated, or exposed by an actual workflow failure.
- For build, packaging, and release-tooling bugs, validate the final generated artifact or loaded configuration with
  existing repo commands in Docker when available. If the required check is missing, discuss it with the user before
  adding tooling; do not invent an ad-hoc assertion or probe.
- Use a conventional PR title that summarizes the complete PR and accurately predicts the squash commit's release
  effect. Keep issue comments, pull request descriptions, and non-trivial commit bodies focused on the problem and how
  it was fixed.
- Include the reported issue number in the title when it improves traceability and still fits the 100-character commit
  header limit. Use the closing keyword in the PR body.
- Prefer these PR body sections, using level-two Markdown headings:
  - `Why`: explain the reported symptom and root cause, including relevant issue or prior-PR context.
  - `What`: summarize the focused behavior, regression coverage, and documentation changes rather than listing raw
    diffs.
  - `Impact`: state the user or maintainer outcome, important preserved behavior or non-goals, and whether public docs
    changed or were unnecessary.
  - Use `Where` instead of `Impact` when the affected locations give reviewers more useful context than an outcome
    section.
- Use `Fixes #...` or `Closes #...` for a completed issue. Use `Related to #...`, `Follow-up to #...`, or equivalent
  wording when the PR should not close the referenced issue.
- Pull request descriptions may be detailed; commitlint's line limits do not apply to them. Do not include validation
  blocks, exact validation commands, logs, or local test results in PR descriptions or commit bodies. Treat those
  details as internal agent run notes unless the user asks to publish them.

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
