# How to contribute to ng-mocks

The best way would be to discuss an issue or an improvement first:

- [start a discussion on GitHub](https://github.com/help-me-mom/ng-mocks/discussions/new/choose)
- [report an issue on GitHub](https://github.com/help-me-mom/ng-mocks/issues)
- [chat on gitter](https://gitter.im/ng-mocks/community)

* [update docs](#update-docs)
* [Requirements on Mac](#requiements-on-mac)
* [Requirements on Linux](#requiements-on-linux)
* [Requirements on Windows](#requiements-on-windows)

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

### Docker compose namespace for parallel worktrees

To avoid collisions when multiple worktrees run docker compose in parallel, set `COMPOSE_PROJECT_NAME`.
Use your own unique string for each task/worktree.
Reuse the same value for every `docker compose`, `sh ./compose.sh`, and `sh ./test.sh` command you run in that worktree.
With a unique project name, Compose keeps the worktree resources separate, including the default network and the named `cache`, `gyp`, and `npm` volumes.

```shell
COMPOSE_PROJECT_NAME=ngmocks_<your-unique-string> sh ./compose.sh e2e
COMPOSE_PROJECT_NAME=ngmocks_<your-unique-string> sh ./test.sh e2e
COMPOSE_PROJECT_NAME=ngmocks_<your-unique-string> docker compose run --rm ng-mocks npm run lint
```

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
  - remove `architect/extract-i18n` if present
  - if `architect/test` does not exist, copy the whole block from the previous version
    - make sure the final block contains:
      - `builder` = `@angular/build:karma`
      - `options/main` = `src/test.ts`
      - `options/polyfills` = `["zone.js", "zone.js/testing"]`
      - `options/tsConfig` = `tsconfig.json`
      - `options/karmaConfig` = `karma.conf.js`
      - `options/watch` = `false`
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
  - in `devDependencies`, add `@types/jest`, `jest`, `jest-preset-angular`, `ng-packagr`, `puppeteer`, `ts-node` which support the desired angular version
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
    - merge `compilerOptions/types` with `["jasmine", "jest", "node"]`
    - set / add `files` to `["src/main.ts", "src/test.ts", "src/setup-jest.ts"]`
    - set / add `include` to `["jest.config.ts", "src/**/*.spec.ts", "src/**/*.d.ts"]`
- add `.nvmrc` which supports the desired angular version
- add `jest.config.ts` as it is in the prev version
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

### Step #3 - update scripts

- update `ng-mocks/package.json`, search for `a22` and extended scripts to support `a23`
- update `ng-mocks/compose.yml`, search for `a22` and copy blocks to support `a23` with the right node version
- update `ng-mocks/compose.sh`, search for `a22` and copy blocks to support `a23` with the right command to install `puppeteer`
- update `ng-mocks/test.sh`, search for `a22` and copy blocks to support `a23`
- update `ng-mocks/.dockerignore`, search for `a22` and copy blocks to support `a23`
- update `ng-mocks/.github/dependabot.yml`, search for `a22` and copy blocks to support `a23`
- update `ng-mocks/.circleci/config.yml`, search for `a22` and copy blocks to support `a23`
- update `ng-mocks/eslint.config.mjs`, search for `a22` and copy blocks to support `a23`
- if the new Angular version is still prerelease and `npm install` / `npm ci` set `force=true` in `ng-mocks/e2e/a23/.npmrc`

### Step #4 - update ng-mocks dependencies

- update `ng-mocks/package.json` to point to the version `^23` in dependencies
- execute `sh compose.sh root` in `ng-mocks` to install the dependencies

### Step #5 - verify that`ng-mocks` does not fail with the new version

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
