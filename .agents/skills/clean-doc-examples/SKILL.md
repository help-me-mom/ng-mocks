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
- [ ] Sync snippets and live-example links, and remove compatibility-only code
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
   specs, and add new guides beside related articles in `docs/sidebars.js`.
   Include both `Try it on CodeSandbox` and `Try it on StackBlitz`
   links for each executable example, following the existing file-path and suite-filter URL patterns.
   Live examples are required: `ng-mocks-sandbox` is updated after release, so its current contents or Angular
   version must not block links to new examples. Do not add backlinks to existing articles unless requested
   or their content needs correction.

## Form Guide Structure

Use this structure for the simple form interaction guides, following
[`native-inputs.md`](../../../docs/articles/guides/native-inputs.md) and
[`ng-model.md`](../../../docs/articles/guides/ng-model.md):

1. Show the component or directive under test and its template first. Make the relationship between the
   element, binding and component property visible before showing test code.
2. Explain `MockBuilder` in a separate test-setup section using `beforeEach`. Keep the subsequent example's
   rendering and interactions inside `it`; omit repeated imports from these focused snippets.
3. Show render → find → read → change → assert in one code block, with blank lines and simple comments between
   actions. Explain required settling or change detection where it matters. Put any update-on-blur/submit
   caveat near the beginning of this section, qualified for the actual binding rather than copied to every host.
4. Follow with short recipes for relevant control types, then a complete example and its source and live links.
   Cover every published recipe in `examples/`, including clearing values and control-specific behavior.
   Additional regression cases need not all appear in the article.

Keep guides about ordinary values focused on those interactions. Put custom-control mocking, validation and
other independent subjects in their respective articles. Keep related guides beside one another in the existing
How to test or How to mock sidebar group according to what the test demonstrates.

For simple native selectors, demonstrate the direct call and the already-found element alternative:

```ts
// Find the input to read its current value.
const input = ngMocks.find('[name="inputName"]');

// Change the value.
ngMocks.change('[name="inputName"]', 'Grace');
// or ngMocks.change(input, 'Grace');
```

When selection needs a binding reference, find the host once with
`ngMocks.reveal(['formField', component.f.inputValue])` and reuse that variable. Pass the bound field tree
without calling it. A shared binding, such as a radio group, needs an option-specific selector or narrower scope.
Do not add test IDs when existing names or binding references identify the intended host. An HTML `name`
selector and an Angular template reference such as `#input` serve different purposes; the latter can be needed
by the component's event handler even when the test selects by name.

Preserve names in existing specs; use `inputValue` and `inputName` for new independent state and HTML-name
examples. Review repeated control tables and prose together so supported arguments, clearing values and
timing agree with the executable specs and API docs. When shortening an article, relocate still-relevant
guidance rather than silently dropping an original request.

## Published Snippet Cleanup

- Preserve simple comments explaining what happens and why setup, timing, or assertions matter. Keep these
  explanations in both the article and executable example; do not replace them with step labels alone.
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

When a docs build is needed, use the Docker wrapper from the worktree root:

```bash
COMPOSE_PROJECT_NAME=ngmocks_docs_<unique> sh test.sh docs
```

The wrapper gives Docusaurus read-only access to the current worktree's Git history so last-update authors
and dates remain available. It builds into `dist/docs` without rebuilding the library.

For docs-only changes, wrapper tests may be skipped; say so in the final summary. If executable files also
changed, follow the runbook's validation requirements for those files.

## Guardrails

- Keep necessary compatibility machinery in executable specs. A later docs sync must not copy it back into the
  article or weaken version coverage.
- Trust current scripts and tests when prose disagrees with executable behavior; correct the prose.
- Follow [Docker-Only Execution](../../../AGENTS.md#docker-only-execution). Do not invent snippet or generated-HTML
  validation scripts, including scripts run inside Docker.
- Follow [Worktree Isolation](../../../AGENTS.md#worktree-isolation). A docs build failure does not justify
  mounting primary working files, running the build there, or changing its branch. Use `sh test.sh docs` for
  the supported read-only Git metadata mount; do not disable last-update metadata to work around a Git error.
- Report a failed command, its error, and remaining work before discussing a workaround. Do not claim validation
  passed or snippets were synced without completing the relevant checks.
