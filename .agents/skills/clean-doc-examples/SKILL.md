---
name: clean-doc-examples
description: Use when syncing or simplifying example code in docs/articles or README.md so embedded docs samples stay aligned with executable specs while removing compatibility noise from the published snippets.
---

# Clean Doc Examples

Use this skill when the task is to refresh and simplify documentation code examples without changing the real test sources unless explicitly requested.

## Task List

Create a plain Markdown checklist that AI Agent can follow:

```md
- [ ] Find the closest functional examples and read their specs and docs
- [ ] Inspect the affected docs, executable specs, and relevant non-bot history
- [ ] Choose a consistent Angular version and defaults for each published example
- [ ] Sync embedded docs samples with the current example tests when needed
- [ ] Simplify docs-only snippets for readability
- [ ] Run lightweight validation and summarize what changed
```

## Workflow

1. Before editing, follow [Spec and Documentation Examples](../../../AGENTS.md#spec-and-documentation-examples).
   Select references by component purpose and tested behavior across libraries, then read their specs and paired
   guides. Inspect `docs/articles`, `README.md`, and the matching executable specs under `examples`, `tests`, or
   `tests-e2e/src`. Record the reference paths and follow their structure, teaching order, and annotated examples.
2. If the task mentions history or doc drift, inspect recent non-bot commits that touched `examples` or docs:
   - `git log --no-merges --author='^(?!.*(renovate|dependabot)).*$' --perl-regexp -- examples tests tests-e2e/src docs/articles README.md`
3. If a docs page embeds or references a spec example, sync the snippet to the current source test before simplifying it for docs-only readability.
4. Keep the real spec files as the source of truth. Do not rewrite them unless the user explicitly asks.
5. Treat each published example as ordinary application/test code for an Angular version appropriate to the feature.
   Do not make docs snippets compile across the repository's entire spread matrix. Keep APIs, dependency syntax, and
   Angular defaults consistent within each example, and state its target version briefly when that matters to use it.
   Apply readability cleanup only in docs snippets:
   - remove compatibility-only casts such as `as never` or `as any`
   - remove redundant `standalone: true` and `standalone: false`; keep an explicit flag only when necessary for the
     chosen Angular version or when the flag itself is being taught
   - remove empty uniqueness-only methods such as `public someMarker() {}`
   - remove declarations and template bindings used solely to align old Angular engines, when they are unnecessary
     for the chosen version; preserve declarations involved in the behavior being taught
   - remove `TODO` comments and Angular version guards from docs snippets
   - if `ViewChild`, `ViewChildren`, `ContentChild`, or `ContentChildren` use `{}` as the second argument, remove that empty argument
   - remove `const assertion: any` helpers and use `jasmine` directly
   - prefer direct Jasmine examples in visible code; keep Jest alternatives only as comments when helpful
   - inline `@Injectable({ ... })` config instead of `const ...Args = [...]` plus `@Injectable(...args)`
   - replace old-version syntax and dependency fallbacks with ordinary equivalents supported by the chosen version,
     such as optional chaining for null guards and RxJS `of(value)` for a synchronous one-value observable
   - use direct, meaningful Jasmine assertions instead of compatibility or lint-workaround assertion scaffolding
   - do not replace removed compatibility code with per-version instructions to add or remove options in live examples;
     keep actual API availability, support boundaries, and migration guidance where relevant
6. Keep guide prose aligned with the simplified snippet, and compare the final examples and guide structure with the selected references.
7. For docs-only changes, validate with search-based checks and `git diff --check`. Skip wrapper tests unless the user specifically wants them or non-doc files changed.

## Validation

- For docs-only changes:
  - review snippets against their source files and use `rg` to search for the targeted cleanup patterns
  - run `git diff --check -- docs/articles README.md`
- Run formatting and any required docs build through existing repo npm scripts in Docker:
  - `COMPOSE_PROJECT_NAME=ngmocks_docs_<unique> docker compose run --rm ng-mocks npm run prettier:repo`
  - `COMPOSE_PROJECT_NAME=ngmocks_docs_<unique> docker compose run --rm ng-mocks npm run prettier:check`
  - `COMPOSE_PROJECT_NAME=ngmocks_docs_<unique> docker compose run --rm ng-mocks npm run build:docs`

## Guardrails

- Do not edit executable specs just to make docs prettier unless the user explicitly asked to change the tests too.
- Preserve the setup, observable behavior, and assertion meaning when simplifying published snippets; do not copy
  compatibility scaffolding back from the executable spread tests during a later sync.
- Do not claim docs are synced until embedded example blocks or referenced snippets have been checked against their executable specs.
- Prefer primary repo sources over memory: `examples`, `tests`, `tests-e2e/src`, `README.md`, `docs/articles`, and recent human-authored git history.
- If docs and executable behavior disagree, trust the current scripts/tests first and update the docs.
- For docs-only work, say explicitly in the final summary if wrapper tests were skipped.
- Follow `AGENTS.md`'s Docker-only execution rule. Never use local runtimes or custom snippet, AST, or generated-HTML
  validation scripts, including scripts run inside Docker.
- If an approved command fails or required tooling is missing, report the command, error, and remaining work to the
  user and discuss the solution before trying a workaround.
- Follow `AGENTS.md`'s worktree isolation rule. If a docs build cannot resolve a linked worktree's Git metadata, do not
  mount the primary checkout or its `.git` directory into Docker, run the build in that checkout, or change its branch.
  Report the failure and keep all work in the independent worktree.
