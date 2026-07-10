---
name: update-node-version
description: Use when updating major Node.js versions across ng-mocks projects, including CI/CD, .nvmrc, Docker images, npm compatibility, @types/node, and wrapper-based validation.
---

# Update Node Version

Use this skill when the request is to update major Node.js version across some or all of the repository.

## Task List

Begin with a plain Markdown checklist that works in AI Agent:

```md
- [ ] Identify which projects should move to the new Node line
- [ ] Inspect all current Node, npm, Docker, and type-version declarations
- [ ] Update the affected config and package files together
- [ ] Re-bootstrap dependencies with wrapper commands
- [ ] Run wrapper-based validation on every changed target
- [ ] Summarize the new version mapping and any compatibility limits
```

## Workflow

1. Determine the scope:
   - projects which don't belong to a particular angular major version,
   - specific versioned Angular fixtures,
   - or the whole repo.
2. Inspect the current version mapping in:
   - root `.nvmrc`, `docs/.nvmrc`, `tests-e2e/.nvmrc`, and affected `e2e/*/.nvmrc`
   - `compose.yml`
   - `.circleci/config.yml` and any CI workflow that pins a Node version
   - root, docs, tests-e2e, and affected e2e `package.json` files
3. Keep related version declarations aligned:
   - Docker image tag
   - `.nvmrc`
   - `npm` version
   - `engines.npm`
   - `@types/node` where applicable
4. Do not assume every Angular fixture can move to the newest Node major. Preserve per-target compatibility unless the task explicitly changes that support boundary.
5. Re-bootstrap changed targets with `sh compose.sh <target>`.
6. Validate with `sh test.sh` for root, e2e, and every changed target.
7. If changing dependency metadata requires a lockfile refresh, use the `update-package-locks` skill instead of an ad-hoc npm command.

## Commands

```bash
# Bootstrap changed targets with a unique compose namespace.
COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh compose.sh root
COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh compose.sh e2e
COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh compose.sh <target>
COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh compose.sh docs

# Validate changed targets.
COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh test.sh root
COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh test.sh e2e
COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh test.sh <target>
COMPOSE_PROJECT_NAME=ngmocks_node_<unique> docker compose run --rm docs npm run build
```

## Validation

- `COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh test.sh root`
- `COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh test.sh e2e`
- `COMPOSE_PROJECT_NAME=ngmocks_node_<unique> sh test.sh <target>` for each target whose Node line changed
- `COMPOSE_PROJECT_NAME=ngmocks_node_<unique> docker compose run --rm docs npm run build` when the docs Node line changed

## Guardrails

- Never assume the root Node version should also be used by every legacy Angular fixture.
- Never use local `npm install`, `npm update`, or ad-hoc `node` commands for validation when wrapper commands exist.
- Keep npm compatibility aligned with the chosen Node version.
- Use one unique `COMPOSE_PROJECT_NAME` for all commands in the same worktree.
- If a commit is requested for a pure Node-image update, use `chore(docker): updating node images`.
