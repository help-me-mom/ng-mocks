# ng-mocks Agent Runbook

## Scope

This file documents practical rules for contributors/agents working on `ng-mocks`, especially Angular/e2e integration updates.
The library has many projects for integrational testing, the projects are in `e2e` and in `tests-e2e` directories.
The library a project with documentation in `docs`.

## Required Test Execution

- Use Docker wrappers from repo root:
  - `sh compose.sh <target>` for dependency/bootstrap setup.
  - `sh test.sh <target>` for tests.
- **NEVER** run tests via local `npm`.

## Update all package-lock.json

- Temporarily change `compose.yml` line from `npm install` to `npm update`.
- Run `sh compose.sh` to update dependencies to fresh possible versions.
- Restore `compose.yml` to have `npm install` back.
- Run `sh compose.sh` to sync lock file for CI/CD.

## Angular Major Version Upgrade Workflow

- Update versions explicitly in `tests-e2e/package.json` (Angular + third-party libs).
- Keep lock files; do **not** delete them.
- If major-version install fails in compose flow:
  - Temporarily change the relevant `compose.yml` line from `npm install` to `npm update`.
  - Run `sh compose.sh e2e`.
  - Revert `compose.yml` back to `npm install`.
  - Run `sh compose.sh e2e` again to normalize lockfile resolution.

## Node Version Upgrade Workflow

When asked to "update node version in all projects", use this sequence:

1. Identify target Node:
   - Use latest **even** stable Node release from `https://nodejs.org/dist/index.json`.
   - For Docker image tags, use the latest available `satantime/puppeteer-node` tag.
2. Keep version alignment:
   - `nvm` major must match Docker major.
   - `nvm` minor/patch may be higher than Docker minor/patch, but never lower.
   - In corresponding `package.json` files, `@types/node` major must match Node/Docker major.
   - Check that `npm` version works with the chosen `node` version, update `npm` version if needed.
3. Update Node runtime declarations:
   - In `e2e` directory, major version change is possible on projects which don't belong to particular angular version.
   - Search for `.nvmrc`, `compose.yml`, `package.json`, `.circleci/config.yml` and other possible files.
4. Validation:
   - Run bootstrap via Docker wrappers for changed targets (`sh compose.sh <target>`).
   - Run required test wrappers (`sh test.sh root`, `sh test.sh e2e`, and targeted suites).
   - Ensure that in all projects in all files major versions match each other: `docker`, `nvm`, `@types/node`, `npm`.
5. Commit:
   - When all checks are successful commit the changes with the message `chore(docker): updating node images`.

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
