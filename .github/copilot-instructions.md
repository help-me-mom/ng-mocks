# ng-mocks Copilot Instructions

## What this project is

`ng-mocks` is an Angular testing library that mocks Components, Directives, Pipes, Modules, Services, and Tokens to simplify unit/integration testing. It supports Angular 5–20+ and works with both Jasmine and Jest.

The library source lives in `libs/ng-mocks/src/lib/`. Tests live in `tests/` and `examples/`. The `e2e/` directory contains isolated Angular app projects (one per Angular version, e.g. `e2e/a20/`) used for cross-version integration testing.

---

## Commands

```bash
# Install all dependencies (requires bash/WSL + Docker on Windows)
sh ./compose.sh

# Run full test suite (Karma + Jasmine, headless Chrome)
nvm use && npm run test

# Run a single test file or folder
KARMA_SUITE=./tests/mock-component/**/*.ts npm run test
KARMA_SUITE=./tests/issue-1165/**/*.ts npm run test

# Watch mode with browser UI
npm run test:watch

# Debug in Chrome DevTools
npm run test:debug

# Lint
npm run lint
npm run lint:fix

# Type-check without emitting
npm run ts:check

# Build the library
npm run build
```

> On Windows: development requires Git Bash / WSL. Run `nvm use` before test commands to activate the correct Node version.

---

## Architecture

### Source (`libs/ng-mocks/src/lib/`)

Each top-level folder maps to a public API surface:

| Folder            | Purpose                                                                      |
| ----------------- | ---------------------------------------------------------------------------- |
| `mock-builder/`   | `MockBuilder` — fluent API for `TestBed` configuration with mocking          |
| `mock-component/` | `MockComponent` — auto-generates mock components                             |
| `mock-directive/` | `MockDirective`                                                              |
| `mock-pipe/`      | `MockPipe`                                                                   |
| `mock-module/`    | `MockModule`                                                                 |
| `mock-service/`   | `MockService`                                                                |
| `mock-provider/`  | `MockProvider`                                                               |
| `mock-render/`    | `MockRender` / `MockRenderFactory` — renders components with minimal setup   |
| `mock-instance/`  | `MockInstance` — sets up spy return values / custom implementations per test |
| `mock-helper/`    | `ngMocks.*` helper API (find, input, output, trigger, click, crawl, etc.)    |
| `common/`         | Shared internals: reflection, Angular metadata, tokens, type guards          |
| `resolve/`        | Dependency resolution logic used by MockBuilder                              |

### File naming conventions inside `lib/`

- `func.*` — pure functions (no side effects, no class)
- `core.*` — foundational utilities (reflection, config, tokens)
- `decorate.*` — Angular decorator helpers
- `error.*` — error-throwing helpers
- `*.spec.ts` — internal unit tests (included in coverage run)
- `*.fixtures.ts` — test fixture data (excluded from coverage instrumentation)

### Test layout

- `tests/[feature-name]/test.spec.ts` — feature tests (e.g. `tests/mock-component/`, `tests/ng-mocks-find/`)
- `tests/issue-[number]/` — regression tests tied to specific GitHub issues
- `examples/[FeatureName]/test.*.spec.ts` — documented usage examples; `spec.*.fixtures.ts` files hold the fixtures for each example
- `tests-performance/` — performance benchmarks (run with `KARMA_SUITE=perf`)
- `tests-failures/` — tests that verify expected failure cases

---

## Key conventions

### Backward-compatibility syntax

Tests that must run across Angular versions use a workaround for the `standalone` property:

```typescript
@Component({
  selector: 'target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'target',
})
```

Use this pattern when adding components/directives/pipes to test files that run in the root test suite.

### Typical test structure

```typescript
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

describe('feature', () => {
  beforeEach(() => MockBuilder(ComponentUnderTest, HostModule));

  it('does something', () => {
    const fixture = MockRender(ComponentUnderTest);
    const el = ngMocks.find('selector');
    expect(ngMocks.formatText(fixture)).toContain('expected');
  });
});
```

### Adding a regression test for a GitHub issue

Create `tests/issue-[number]/test.spec.ts`. If the test needs fixture declarations, put them in `tests/issue-[number]/test.spec.ts` inline or in a `*.fixtures.ts` file in the same directory.

### Adding an Angular version to e2e

Follow the step-by-step instructions in `CONTRIBUTING.md` under "How to add a new Angular version". The pattern is: copy `e2e/a<N>/` as `e2e/a<N+1>/`, then update references in `package.json`, `compose.yml`, `compose.sh`, `test.sh`, `.github/dependabot.yml`, and `.circleci/config.yml`.

### Running e2e against a specific Angular version

```bash
# Install and run e2e for Angular 20
npm run e2e:a          # full (installs + tests all versions)
sh test.sh a20         # run tests for a specific version (bash)
```
