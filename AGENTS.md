# ng-mocks Agent Runbook

## Scope

This file documents practical rules for contributors/agents working on `ng-mocks`, especially Angular/e2e integration updates.

## Required Test Execution

- Use Docker wrappers from repo root:
  - `sh compose.sh <target>` for dependency/bootstrap setup.
  - `sh test.sh <target>` for tests.
- For `tests-e2e`, always run tests via Docker:
  - `sh test.sh e2e`
- Do **not** run e2e via local `npm run test`.

## e2e / Angular Major Upgrade Workflow

- Update versions explicitly in `tests-e2e/package.json` (Angular + third-party libs).
- Keep lock files; do **not** delete them.
- If major-version install fails in compose flow:
  - Temporarily change the relevant `compose.yml` line from `npm install` to `npm update`.
  - Run `sh compose.sh e2e`.
  - Revert `compose.yml` back to `npm install`.
  - Run `sh compose.sh e2e` again to normalize lockfile resolution.

## Test Intent Constraints

- `ng-mocks` tests verify ng-mocks behavior; do not remove or dilute `ngMocks` API usage in tests.
- Preserve existing use-cases in `tests-e2e`; fix compatibility while keeping semantic intent unchanged.
- Follow test style/patterns from `libs`, `tests`, and `examples`.
- Avoid direct testing of private internals when public behavior can cover the scenario.

## Library-Specific Notes

- PrimeNG regressions: check prior fixes in git history for that test and apply the same adaptation pattern.
- Angular 20 fallback handling exists for render/hide query scanning edge cases; keep type contracts explicit (avoid defensive optional chains where contract guarantees presence).

## Parallel Execution Rule

- Parallelization is allowed for speed, but run only one command per unique Docker service at a time.
- Never queue overlapping commands for the same service name, or earlier runs may be superseded.

## Minimum Validation Checklist

After non-trivial e2e/framework changes:

1. `sh test.sh root`
2. `sh test.sh e2e`
3. Targeted version suites affected by the change (and broader matrix if requested).
4. `sh test.sh coverage` when coverage impact is expected.

## Code Quality Commands

- Format: `npm run prettier:repo`
- Lint: `npm run lint`
