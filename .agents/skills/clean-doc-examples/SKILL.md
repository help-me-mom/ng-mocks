---
name: clean-doc-examples
description: Sync Angular examples in docs/articles or README.md with executable specs and remove compatibility-only code from published snippets.
---

# Clean Doc Examples

Use this skill when writing or updating published Angular examples. Keep the examples aligned with executable
specs while making the article readable for its intended Angular version.

## Task List

Create and maintain a plain Markdown checklist:

```md
- [ ] Find the closest functional examples and read their specs and docs
- [ ] Identify the source spec and the article's testing or mocking purpose
- [ ] Choose a consistent Angular version and defaults for each published example
- [ ] Sync the snippets and remove compatibility-only code
- [ ] Run lightweight validation and summarize what changed
```

## Workflow

1. Read the closest functional specs and their articles, following
   [Spec and Documentation Examples](../../../AGENTS.md#spec-and-documentation-examples). Record why those
   references apply and follow their teaching order, tool links, comments, and assertion flow. If the pattern
   remains unclear, inspect human-authored history with `git log --no-merges --oneline -- <relevant-paths>`.
2. Identify the article's purpose and source spec. Keep testing a real declaration distinct from mocking a
   dependency, and use separate articles for independent API use cases. Clearly identify classic and signal
   variants. Core examples belong in `examples/<ExampleName>/test.spec.ts`, with files such as `signals.spec.ts`
   beside them; integration examples belong in the relevant `tests-e2e/src` suite.
3. Choose one appropriate Angular version for each published example. Keep APIs, syntax, dependencies, and
   defaults consistent. State the version when it affects how readers use the example.
4. Sync each snippet with its current executable spec, then apply the cleanup below. Preserve setup, observable
   behavior, and meaningful assertions. If the task is docs-only, do not change the executable spec to simplify
   the article.
5. Compare the finished article with its references and source spec. Check source links after moving or renaming
   specs, and add new guides to the sidebar. Do not add backlinks to existing articles unless requested or their
   content needs correction.

## Published Snippet Cleanup

- Remove redundant `standalone: true` or `standalone: false`. Keep the flag when the chosen Angular version
  requires it or the article teaches it.
- Remove compatibility casts, Angular version or compiler guards, and compatibility `TODO` comments.
- Remove marker methods, declarations, and template bindings used only to accommodate the spread matrix.
  Preserve declarations and bindings involved in the behavior being taught.
- Remove empty query options such as the second argument in `@ContentChild(Child, {})`.
- Use ordinary syntax available in the chosen version, such as optional chaining and RxJS `of(value)`, instead
  of older-version fallbacks. Write decorator metadata directly, such as `@Injectable({ ... })`.
- Use direct Jasmine assertions. Remove assertion aliases such as `const assertion: any` and lint workarounds;
  include a Jest alternative only as a comment when useful.
- Keep actual API availability and migration guidance, but do not replace removed compatibility code with
  per-version instructions to patch the live example.

## Validation

Review snippets and source links manually, use `rg` for targeted cleanup checks, and run:

```bash
git diff --check -- docs/articles README.md
COMPOSE_PROJECT_NAME=ngmocks_docs_<unique> docker compose run --rm ng-mocks npm run prettier:repo
COMPOSE_PROJECT_NAME=ngmocks_docs_<unique> docker compose run --rm ng-mocks npm run prettier:check
```

When a docs build is needed, use the existing Docker command:

```bash
COMPOSE_PROJECT_NAME=ngmocks_docs_<unique> docker compose run --rm ng-mocks npm run build:docs
```

For docs-only changes, wrapper tests may be skipped; say so in the final summary. If executable files also
changed, follow the runbook's validation requirements for those files.

## Guardrails

- Keep necessary compatibility machinery in executable specs. A later docs sync must not copy it back into the
  article or weaken version coverage.
- Trust current scripts and tests when prose disagrees with executable behavior; correct the prose.
- Follow [Docker-Only Execution](../../../AGENTS.md#docker-only-execution). Do not invent snippet or generated-HTML
  validation scripts, including scripts run inside Docker.
- Follow [Worktree Isolation](../../../AGENTS.md#worktree-isolation). A docs build failure does not justify
  mounting the primary checkout or its Git metadata, running the build there, or changing its branch.
- Report a failed command, its error, and remaining work before discussing a workaround. Do not claim validation
  passed or snippets were synced without completing the relevant checks.
