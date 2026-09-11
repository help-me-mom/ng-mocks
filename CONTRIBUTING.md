# How to contribute to ng-mocks

The best way would be to discuss an issue or an improvement first:

- [start a discussion on GitHub](https://github.com/help-me-mom/ng-mocks/discussions/new/choose)
- [report an issue on GitHub](https://github.com/help-me-mom/ng-mocks/issues)
- [chat on gitter](https://gitter.im/ng-mocks/community)

* [update docs](#update-docs)
* [Requirements on Mac](#requirements-on-mac)
* [Requirements on Linux](#requirements-on-linux)
* [Requirements on Windows](#requirements-on-windows)

## Update docs

To update docs, simply go to the page you want to edit on [https://ng-mocks.sudo.eu/](https://ng-mocks.sudo.eu/)
and click on the "Edit this page" link at the bottom of the page.

## Prerequisites for development

### Requirements on Mac

- install `docker`: https://hub.docker.com
- install `compose`: https://docs.docker.com/compose/install/
- install `nvm`: https://github.com/nvm-sh/nvm#installing-and-updating

### Requirements on Linux

- install `docker`: https://hub.docker.com
- install `compose`: https://docs.docker.com/compose/install/
- install `nvm`: https://github.com/nvm-sh/nvm#installing-and-updating

### Requirements on Windows

- install `Git BASH`: https://gitforwindows.org
- install `docker` for `WSL`: https://docs.docker.com/desktop/windows/wsl/
- install `compose`: https://docs.docker.com/compose/install/
- install `nvm`: https://github.com/nvm-sh/nvm#installing-and-updating

## Development

To develop `ng-mocks` you need to use `bash` and `WSL` in case if you are on Windows.

### Signed commits for pull requests

Pull requests need signed commits. Unsigned commits can be blocked by the repository settings,
so please configure commit signing before you open or update a PR.

- GitHub docs: https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits
- Any GitHub-supported signing method is fine as long as GitHub marks the commit as `Verified`

### How to install dependencies

- start `docker` and ensure it's running
- open a `bash` session in a terminal (Git BASH on Windows)
- execute

  ```shell
  sh ./compose.sh
  ```

- it will take a while, but afterwards you have all dependencies installed

`compose.sh` stops if a requested installation step fails. It uses Compose's `--exit-code-from` option to
propagate the dependency installation container's exit status. Resolve the reported failure and rerun the
wrapper before continuing with tests.

### How to build documentation

After installing the root and docs dependencies, run from the checkout or worktree root:

```shell
sh ./test.sh docs
```

The Docker build writes the site to `dist/docs`. The wrapper exposes the current worktree's Git history
read-only so article last-update authors and dates remain available, including in linked worktrees.

### Docker compose namespace for parallel worktrees

To avoid collisions when multiple worktrees run docker compose in parallel, set `COMPOSE_PROJECT_NAME`.
Use your own unique string for each task/worktree.
Reuse the same value for every `docker compose`, `sh ./compose.sh`, and `sh ./test.sh` command you run in that worktree.
With a unique project name, Compose keeps the worktree resources separate, including the default network and the named `cache`, `gyp`, and `npm` volumes.
Services with configurable browser caches mount one external volume shared by all worktrees on the same Docker engine.

```shell
COMPOSE_PROJECT_NAME=ngmocks_<your-unique-string> sh ./compose.sh e2e
COMPOSE_PROJECT_NAME=ngmocks_<your-unique-string> sh ./test.sh e2e
COMPOSE_PROJECT_NAME=ngmocks_<your-unique-string> docker compose run --rm ng-mocks npm run lint
```

After all local commands for a completed issue have stopped, release its containers and network from that
worktree using the same project name:

```shell
COMPOSE_PROJECT_NAME=ngmocks_<your-unique-string> docker compose down --remove-orphans
```

This keeps the named caches and shared browser volume. Do not add `--volumes`. Cleaning up completed projects
prevents unused networks from exhausting Docker's address pool. Use this project-specific cleanup instead of
blanket network pruning, and leave active worktree projects running.

### Shared browser downloads

`compose.sh` creates the single `ngmocks-puppeteer-cache` volume automatically. Its fixed name lets supported
services reuse downloads across `COMPOSE_PROJECT_NAME` values. For direct Compose commands on a fresh Docker
engine, create it first:

```shell
docker volume create ngmocks-puppeteer-cache
```

Supported services mount that volume at `/root/.cache/puppeteer`. Modern Puppeteer keeps each browser build in its
own directory. Angular 8 through 15 use revision-specific directories inside the same volume because their
older installers remove other revisions from the download directory.

Angular 5 through 7 retain their existing local browser installation because Puppeteer 1.20.0 and 2.1.1 do
not support a configurable download directory. Normal npm lifecycle scripts and the explicit browser
installation in `compose.sh` remain enabled for every target.

When updating a legacy Puppeteer dependency with a configured download path, keep its cache revision in
`compose.yml` aligned with its default Chromium revision. Do not force a different revision to keep an old
cache path working.

Finish the first installation of each browser build before starting another installation of that build in a
parallel worktree. Once populated, the cache can serve concurrent test containers. Normal completed-project
cleanup preserves the shared browser volume along with the project's named caches.
Existing project-scoped caches are left in place; the shared volume populates on its first use.

The host installation in `compose.sh` remains separate: macOS and Linux need different browser binaries.
The Jest-only project uses jsdom and does not download Chrome. Angular build caches and `node_modules` stay
inside each worktree.

### Running tests through Docker

Run the existing test wrapper from the worktree after installing its dependencies:

```shell
COMPOSE_PROJECT_NAME=ngmocks_<your-unique-string> sh ./test.sh a17
```

The wrapper builds and copies the library, spreads the selected tests, and clears the applicable Angular CLI
cache before testing. Angular 13's existing `s:files:a13` step removes its default `e2e/a13/.angular/cache`
directory. Angular 14+ version projects and `e2e`, `jasmine`, `vitest`, and `min` use `npm run ng -- cache clean`
inside their target service. A normal wrapper run does not need a separate manual cache-clean command.

Angular 13 and older do not expose `ng cache`. The Jest-only and Nx test paths do not use this Angular CLI build
cache. For targeted direct Compose diagnostics on Angular 14+ CLI targets, clean the cache manually after
changing source or spread files:

```shell
COMPOSE_PROJECT_NAME=ngmocks_<your-unique-string> docker compose run --rm a17 npm run ng -- cache clean
```

If a result contradicts the current source, inspect the copied package in the target's `node_modules/ng-mocks`
and rerun the wrapper before changing the test or implementation. The wrapper stops on a failed build, copy,
spread, cache-clean, or test step; resolve that failure before considering the target validated.

### Automated dependency updates

Renovate handles regular dependency updates, and Dependabot handles security updates. Keep Renovate's
`vulnerabilityAlerts.enabled` set to `false` so it does not create security-fix PRs alongside Dependabot.
Regular Renovate updates still follow the compatibility restrictions in `renovate.json`.

### Zoned and zoneless Angular tests

Angular 20.2 made zoneless change detection stable, and Angular 21 enables it by default. The `a20`, `a21`, and
`a22` version projects therefore run their spread corpus with both zoned and zoneless Jasmine and Jest environments.
Native Vitest coverage follows the same profiles where the installed Angular and Zone.js versions support it:
Angular 20 runs Vitest only in `ivy-zoneless`, while Angular 21 and 22 run it in both profiles. The zoneless Jasmine
configuration uses `provideZonelessChangeDetection()`, while Jest uses the corresponding `setupZonelessTestEnv()`
entry point from `jest-preset-angular`. Angular 20's native Vitest target supplies the zoneless provider file;
Angular 21 and 22 select zoned or zoneless initialization from the configured polyfills.

The `e2e/jasmine`, `e2e/jest`, and `e2e/vitest` projects verify the latest supported Angular version with only the
selected runner's packages and types. Each receives the same application corpus and participates in the root install,
test, and library-build matrices. The Vitest-only project runs a single zoned profile.

CircleCI represents the supported engine and environment combinations with one compatibility profile:
`view-engine-zoned`, `ivy-zoned`, or `ivy-zoneless`. The compatibility matrix is:

- Angular 5-8: `view-engine-zoned`
- Angular 9-11: `view-engine-zoned` and `ivy-zoned`
- Angular 12-19: `ivy-zoned`
- Angular 20-22: `ivy-zoned` and `ivy-zoneless`

The root CI-facing scripts follow `test:<project>[:<es>]:<profile>`. Each project keeps a generic `test` script that
runs all profiles it supports. CircleCI builds the root script name directly from its matrix parameters, so adding a
profile does not require a separate routing helper.

Projects with separate environment corpora use `s:files:<project>:<profile>` for CI spreading. Their generic
`s:files:<project>` script still spreads every supported corpus for local and library workflows.

`test-spread.conf` owns environment-specific file selection because that decision is independent of the Angular
rendering engine. It spreads the zoned corpus to `src/test` and the zoneless corpus to `src/test-zoneless`. The
zoneless corpus omits `tests/fake-async` and `tests/issue-641`: those suites intentionally exercise `fakeAsync`,
`tick`, and `flush`, which require the Zone.js testing utilities. Their zoned spread remains available; any
runner-specific exclusion is configured separately in that runner's target.

Keep environment requirements in `test-spread.conf`. Put unavoidable runner-specific exceptions in that runner
target's `exclude` list; do not alter regression source or add `xdescribe` solely to satisfy another runner.

Profile-specific e2e scripts use the same suffix, for example `test:jest:es5:view-engine-zoned` or
`test:jasmine:ivy-zoneless`. Name their config files `jest.config.<es>.<profile>.*` and
`tsconfig.<es>.<profile>.spec.json` when the ES target varies, or omit the ES segment when it does not. Configs
without profile-specific variants retain the tool's conventional default name.

## How to run unit tests locally

```shell
nvm use
npm run test
```

### How to debug unit tests locally

```shell
nvm use
npm run test:debug
```

### How to run tests in IE locally

- login to a Windows OS: https://developer.microsoft.com/en-us/microsoft-edge/tools/vms
- install `git-scm`: https://git-scm.com/download/win
- install `node` and `npm`: https://nodejs.org
- open `Git Bash` and execute

  ```shell
  export IE_BIN="/c/Program Files/Internet Explorer/iexplore.exe"
  cd /c/ && rm -Rf ng-mocks && mkdir ng-mocks && cd ng-mocks
  find /z/ng-mocks -maxdepth 1 -not -name ng-mocks -not -name .git -not -name docs -not -name e2e -not -name node_modules -exec cp -r {} . \;
  npm ci --no-optional --ignore-scripts
  npm run test
  ```

### How to release ng-mocks

- You need to create a `.env` file with the next content:

  ```dotenv
  GH_TOKEN=<GITHUB_TOKEN>
  NPM_TOKEN=<NPM_TOKEN>
  GIT_AUTHOR_NAME=<YOUR_NAME>
  GIT_AUTHOR_EMAIL=<YOUR_EMAIL>
  GIT_COMMITTER_NAME=<YOUR_NAME>
  GIT_COMMITTER_EMAIL=<YOUR_EMAIL>
  ```

  An example of it is:

  ```dotenv
  GH_TOKEN=123123123
  NPM_TOKEN=123123123
  GIT_AUTHOR_NAME="Best Coder"
  GIT_AUTHOR_EMAIL=best@coder.com
  GIT_COMMITTER_NAME="Best Coder"
  GIT_COMMITTER_EMAIL=best@coder.com
  ```

- execute `npm run release` - to ensure everything is fine
- execute `npm run release -- -d false` - to generate a release and publish it on [github.com](https://github.com/help-me-mom/ng-mocks/releases)
- execute `npm publish ./tmp/ng-mocks-N.N.N.tgz` - to publish it on [npmjs.com](https://www.npmjs.com/package/ng-mocks)
- profit

## How to add a new Angular version

First, you need to install the new Angular version somewhere.
Below is an example how to add Angular 23 to `ng-mocks`.

Always create a fresh project with the Angular CLI for the new Angular major first,
and only then reshape it to match the repo layout.

### Step #1 - create an empty project

Let's create a fresh project with `@angular/cli` `v23`.
The name of the project should be `a + version`: `a23`.

```shell
npx '@angular/cli@^23.0.0-alpha' new \
  --routing \
  --skip-git=true \
  --skip-tests=true \
  --style=css \
  --ssr=false \
  a23
```

Basically, the requirements are:

- no default tests are needed
- no git repo is needed
- no styles are needed, css is enough
- no ssr is needed
- routing **IS** needed

### Step #2 - move the project to `e2e` folder and clean it up

The next step is:

- move `a23` folder to `ng-mocks/e2e` folder
- delete `.vscode` folder in `ng-mocks/e2e/a23`
- delete `.editorconfig` file in `ng-mocks/e2e/a23`
- change `.gitignore` to be the same as in the prev version: `ng-mocks/e2e/a22/.gitignore`
- update `angular.json` from the generated file
  - set `schematics` to `{}`
  - in `architect/build/options`
    - remove `assets`
    - remove `styles`
    - remove `scripts`
    - set `tsConfig` to `tsconfig.json`
  - remove `architect/build/configurations/production/budgets`
  - copy the `architect/build/configurations/vitest` configuration from the previous version
  - copy `architect/build/configurations/vitest-zoned` when the new Zone.js version supports Vitest
  - remove `architect/extract-i18n` if present
  - copy `architect/test` and `architect/test-vitest` from the previous version
    - update the project name in every `buildTarget`
    - in the Karma target, retain each profile's `main`, `polyfills`, `include`, and shared `tsConfig`
    - in the Vitest target, retain each profile's `buildTarget`, `include`, and shared `tsConfig`
    - keep only the profiles supported by the new Angular and Zone.js versions
  - if `lib` does not exist, copy the whole block from the previous version
    - make sure the final block contains:
      - `architect/build/options/project` = `ng-package.json`
      - `architect/build/options/tsConfig` = `tsconfig.json`
  - set / add `cli/packageManager` to `npm`
  - set / add `cli/analytics` to `false`
- update `package.json` to be similar as in the prev version
  - `name` should be `a23`
  - `description` should be `Angular 23`
  - `private` should be `true`
  - replace `scripts` as it is in the prev version
  - remove flexible versions (`^~`) in `dependencies`
  - remove flexible versions (`^~`) in `devDependencies`
  - in `dependencies`, add `@angular/animations` which supports the desired angular version
  - in `devDependencies`, add `@types/jest`, `@types/node`, `jest`, `jest-environment-jsdom`,
    `jest-preset-angular`, `jsdom`, `ng-packagr`, `puppeteer`, `ts-node`, and `vitest` versions supported by the
    desired Angular version
  - add `engines` with the correct `npm` which supports the desired angular version
- delete `README.md`
- update `tsconfig.json` by merging the generated `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.spec.json`
  - first merge `tsconfig.app.json` into `tsconfig.spec.json`
    - add missing fields from `tsconfig.app.json/compilerOptions` to `tsconfig.spec.json/compilerOptions`
    - extend `tsconfig.spec.json/include` with entries from `tsconfig.app.json/include` if exist
    - remove `tsconfig.spec.json/exclude`
  - then merge `tsconfig.spec.json` into `tsconfig.json`
    - add missing fields from `tsconfig.spec.json/compilerOptions` to `tsconfig.json/compilerOptions`
    - extend `tsconfig.json/include` with entries from `tsconfig.spec.json/include` if exist
    - remove `tsconfig.json/references`
    - remove `tsconfig.json/exclude`
  - delete `tsconfig.app.json`
  - delete `tsconfig.spec.json`
  - in `tsconfig.json`
    - set / add `compilerOptions/useDefineForClassFields` to `false`
    - set / add `compilerOptions/noImplicitOverride` to `false`
    - set / add `compilerOptions/esModuleInterop` to `true`
    - merge `compilerOptions/types` with `["jasmine", "jest", "node", "vitest/globals"]`
    - set / add `files` to `["src/main.ts", "src/test.ts", "src/setup-jest.ts"]`
    - set / add `include` to `["jest.config.ivy-zoned.ts", "src/app/**/*.spec.ts", "src/test/**/*.spec.ts", "src/**/*.d.ts"]`
- add `.nvmrc` which supports the desired angular version
- add `jest.config.ivy-zoned.ts` and `jest.config.ivy-zoneless.ts` as in the previous version
- add `karma.conf.js` as it is in the prev version
- add `ng-package.json` as it is in the prev version
- delete `/public`
- delete `/src/app`
- delete `/src/styles.css`
- remove `<link rel="icon">` from `/src/index.html`
- update `/src/main.ts` to a single-file bootstrap by merging the generated scaffold files
  - start from the generated `/src/main.ts`
  - include into it all imported objects: configs, modules, components, etc, to get one file with all required configuration
  - remove routing from `/src/main.ts`
  - delete other files which aren't imported anymore
- add `/src/test.ts` as it is in the prev version
- add `/src/setup-jest.ts` as it is in the prev version
- add `/src/setup-vitest.ts` as it is in the previous version
- copy the shared profile TypeScript configurations from the previous version for every supported profile
  - each extends `tsconfig.json` and selects the matching Jest config, setup files, and test corpus
  - add `src/setup-vitest.ts` to `files` in every profile that runs Vitest
  - do not add a Vitest-only TypeScript configuration

### Step #3 - update scripts

- update `ng-mocks/package.json`, search for `a22` and extended scripts to support `a23`
- update `ng-mocks/compose.yml`, search for `a22` and copy blocks to support `a23` with the right node version
- update `ng-mocks/compose.sh`, search for `a22` and copy blocks to support `a23` with the right command to install `puppeteer`
- update `ng-mocks/test.sh`, search for `a22` and copy blocks to support `a23`
- update `ng-mocks/.dockerignore`, search for `a22` and copy blocks to support `a23`
- update `ng-mocks/.github/dependabot.yml`, search for `a22` and copy blocks to support `a23`
- update `ng-mocks/.circleci/config.yml`, search for `a22` and copy blocks to support `a23`
- update `ng-mocks/eslint.config.mjs`, search for `a22` and copy blocks to support `a23`
- update `ng-mocks/test-spread.conf`, search for `a22` and copy config to support `a23`
- update `ng-mocks/test-spread-app.conf`, search for `a22` and copy config to support `a23`
- if the new Angular version is still prerelease and `npm install` / `npm ci` set `force=true` in `ng-mocks/e2e/a23/.npmrc`

### Step #4 - update ng-mocks dependencies

- update `ng-mocks/package.json` to point to the version `^23` in dependencies
- execute `sh compose.sh root` in `ng-mocks` to install the dependencies

### Step #5 - verify that `ng-mocks` does not fail with the new version

- execute `sh test.sh root` in `ng-mocks` to ensure nothing fails
- execute `sh test.sh a23` in `ng-mocks` to ensure nothing fails
- tests should pass successfully without failures

if tests are failing

- execute `cd e2e/a23` in `ng-mocks`
- execute `nvm install`
- execute `nvm use`
- execute `npm run test:debug`

### Step #6 - update version references

- update the version table in `ng-mocks/docs/articles/index.md`
- update the migration guide in `docs/articles/migrations.md`
- update the version table in `ng-mocks/README.md`
- update `description` in `libs/ng-mocks/package.json`
- update `peerDependencies` in `libs/ng-mocks/package.json`
- update this file and replace `a23` with `a24`
- update this file and replace `v23` with `v24`
- update this file and replace `^23` with `^24`
- update this file and replace `Angular 23` with `Angular 24`
- update this file and replace `a22` with `a` + `23`
- fix the previous expression manually

### Step #7 - verify

- create a PR against the main branch
- verify that CI doesn't fail
- verify that CI has covered the new version
- [release the new version of `ng-mocks`](#how-to-release-ng-mocks)
