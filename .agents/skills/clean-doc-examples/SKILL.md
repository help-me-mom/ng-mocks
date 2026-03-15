---
name: clean-doc-examples
description: Use when syncing or simplifying example code in docs/articles or README.md so embedded docs samples stay aligned with examples tests while removing compatibility noise from the published snippets.
---

# Clean Doc Examples

Use this skill when the task is to refresh and simplify documentation code examples without changing the real test sources unless explicitly requested.

## Task List

Create a plain Markdown checklist that AI Agent can follow:

```md
- [ ] Inspect the affected docs, examples, and recent non-bot history
- [ ] Sync embedded docs samples with the current example tests when needed
- [ ] Simplify docs-only snippets for readability
- [ ] Run lightweight validation and summarize what changed
```

## Workflow

1. Inspect `docs/articles`, `README.md`, and the matching files under `examples`.
2. If the task mentions history or doc drift, inspect recent non-bot commits that touched `examples` or docs:
   - `git log --no-merges --author='^(?!.*(renovate|dependabot)).*$' --perl-regexp -- examples docs/articles README.md`
3. If a docs page embeds a live example block from `examples/...`, sync the block to the current source test before simplifying it for docs-only readability.
4. Keep the real `examples/*.spec.ts` files as source-of-truth tests. Do not rewrite them unless the user explicitly asks.
5. Apply readability cleanup only in docs snippets:
   - remove compatibility-only casts such as `as never` or `as any`
   - remove `standalone: false`
   - remove empty uniqueness-only methods such as `public someMarker() {}`
   - remove `TODO` comments and Angular version guards from docs snippets
   - if `ViewChild`, `ViewChildren`, `ContentChild`, or `ContentChildren` use `{}` as the second argument, remove that empty argument
   - remove `const assertion: any` helpers and use `jasmine` directly
   - prefer direct Jasmine examples in visible code; keep Jest alternatives only as comments when helpful
   - inline `@Injectable({ ... })` config instead of `const ...Args = [...]` plus `@Injectable(...args)`
6. Keep guide prose aligned with the simplified snippet if behavior changed materially.
7. For docs-only changes, validate with search-based checks and `git diff --check`. Skip wrapper tests unless the user specifically wants them or non-doc files changed.

## Validation

- For docs-only changes:
  - search for the targeted cleanup patterns to confirm they are gone
  - run `git diff --check -- docs/articles README.md`

## Guardrails

- Do not edit real `examples` tests just to make docs prettier unless the user explicitly asked to change the tests too.
- Do not claim docs are synced until embedded example blocks or referenced snippets have been checked against `examples`.
- Prefer primary repo sources over memory: `examples`, `README.md`, `docs/articles`, and recent human-authored git history.
- If docs and executable behavior disagree, trust the current scripts/tests first and update the docs.
- For docs-only work, say explicitly in the final summary if wrapper tests were skipped.
