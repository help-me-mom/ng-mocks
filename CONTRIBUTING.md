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

### How to install dependencies

- start `docker` and ensure it's running
- open a `bash` session in a terminal (Git BASH on Windows)
- execute

  ```shell
  sh ./compose.sh
  ```

- it will take a while, but afterwards you have all dependencies installed

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
Below is an example how to add Angular 21 to `ng-mocks`.

### Step #1 - create an empty project

Let's create a fresh project with `@angular/cli` `v21`.
The name of the project should be `a + version`: `a21`.

```shell
npx '@angular/cli@^21.0.0-alpha' new \
  --routing \
  --skip-git=true \
  --skip-tests=true \
  --style=css \
  --ssr=false \
  a21
```

Basically, the requirements are:

- no default tests are needed
- no git repo is needed
- no styles are needed, css is enough
- no ssr is needed
- routing **IS** needed

### Step #2 - move the project to `e2e` folder and clean it up

The next step is:

- move `a21` folder to `ng-mocks/e2e` folder
- delete `.vscode` folder in `ng-mocks/e2e/a21`
- delete `.editorconfig` file in `ng-mocks/e2e/a21`
- change `.gitignore` to be the same as in the prev version: `ng-mocks/e2e/a20/.gitignore`
- change `angular.json` to be similar as in the prev version: `ng-mocks/e2e/a20/angular.json`
  - `projects/a21/schematics` should be empty
  - remove `projects/a21/architect/build/options/assets`
  - remove `projects/a21/architect/build/options/styles`
  - remove `projects/a21/architect/build/options/scripts`
  - change `projects/a21/architect/build/options/tsConfig` to `tsconfig.json`
  - remove `projects/a21/architect/build/configurations/production/budgets`
  - remove `projects/a21/architect/extract-i18n`
  - remove `projects/a21/architect/test/options/assets`
  - remove `projects/a21/architect/test/options/styles`
  - remove `projects/a21/architect/test/options/scripts`
  - change `projects/a21/architect/test/options/tsConfig` to `tsconfig.json`
  - add `projects/a21/architect/test/options/main` with the value of `src/test.ts`
  - add `projects/a21/architect/test/options/karmaConfig` with the value of `karma.conf.js`
  - add `projects/lib` as it is in the prev version: `ng-mocks/e2e/a20/angular.json`
  - add `cli/analytics` as it is in the prev version: `ng-mocks/e2e/a20/angular.json`
- change `package.json` to be similar as in the prev version: `ng-mocks/e2e/a20/package.json`
  - `name` should be `a21`
  - `description` should be `Angular 21`
  - `private` should be `true`
  - replace `scripts` as it is in the prev version: `ng-mocks/e2e/a20/package.json`
  - remove flexible versions (`^~`) in `dependencies` as it is in the prev version: `ng-mocks/e2e/a20/package.json`
  - remove flexible versions (`^~`) in `devDependencies` as it is in the prev version: `ng-mocks/e2e/a20/package.json`
  - in `dependencies`, add `@angular/animations` which supports the desired angular version
  - in `devDependencies`, add `@types/jest`, `jest`, `jest-preset-angular`, `ng-packagr`, `puppeteer`, `ts-node` which support the desired angular version
  - add `engines` with the correct `npm` which supports the desired angular version
- delete `README.md`
- merge `tsconfig.app.json` and `tsconfig.spec.json` into `tsconfig.json` as it is in the prev version: `ng-mocks/e2e/a20/tsconfig.json`
  - add `compilerOptions/baseUrl`with the value of `./`
  - add `compilerOptions/types` as it is in the prev version: `ng-mocks/e2e/a20/tsconfig.json`
  - add `compilerOptions/skipLibCheck` as it is in the prev version: `ng-mocks/e2e/a20/tsconfig.json`
  - change `compilerOptions/noImplicitOverride` to `false`
  - add `files` as it is in the prev version: `ng-mocks/e2e/a20/tsconfig.json`
  - add `include` as it is in the prev version: `ng-mocks/e2e/a20/tsconfig.json`
  - delete `tsconfig.app.json`
  - delete `tsconfig.spec.json`
- add `.nvmrc` which supports the desired angular version
- add `jest.config.ts` as it is in the prev version: `ng-mocks/e2e/a20/jest.config.ts`
- add `karma.conf.js` as it is in the prev version: `ng-mocks/e2e/a20/karma.conf.js`
- add `ng-package.json` as it is in the prev version: `ng-mocks/e2e/a20/ng-package.json`
- delete `ng-mocks/e2e/a21/public`
- delete `ng-mocks/e2e/a21/src/app`
- delete `ng-mocks/e2e/a21/src/style.css`
- remove `<link rel="icon">` from `ng-mocks/e2e/a21/src/index.html`
- change `ng-mocks/e2e/a21/src/main.ts` as it is in the prev version: `ng-mocks/e2e/a20/src/main.ts`
- add `ng-mocks/e2e/a21/src/test.ts` as it is in the prev version: `ng-mocks/e2e/a20/src/test.ts`
- add `ng-mocks/e2e/a21/src/setup-jest.ts` as it is in the prev version: `ng-mocks/e2e/a20/src/setup-jest.ts`

### Step #3 - update scripts

- update `ng-mocks/package.json`, search for `a20` and extended scripts to support `a21`
- update `ng-mocks/compose.yml`, search for `a20` and copy blocks to support `a21` with the right node version
- update `ng-mocks/compose.sh`, search for `a20` and copy blocks to support `a21` with the right command to install `puppeteer`
- update `ng-mocks/test.sh`, search for `a20` and copy blocks to support `a21`
- update `ng-mocks/.dockerignore`, search for `a20` and copy blocks to support `a21`
- update `ng-mocks/.github/dependabot.yml`, search for `a20` and copy blocks to support `a21`
- update `ng-mocks/.circleci/config.yml`, search for `a20` and copy blocks to support `a21`
- update `ng-mocks/.eslintrc.yml`, search for `a20` and copy blocks to support `a21`
- execute `sh compose.sh a21` in `ng-mocks` to install dependencies for `a21`, it might require `--force` at this moment in `compose.yml` in the command for the new version

### Step #4 - update ng-mocks dependencies

- update `ng-mocks/package.json` to point to the version `^21` in dependencies
- execute `sh compose.sh root` in `ng-mocks` to install the dependencies

### Step #5 - verify that`ng-mocks` does not fail with the new version

- execute `sh test.sh root` in `ng-mocks` to ensure nothing fails
- execute `sh test.sh a21` in `ng-mocks` to ensure nothing fails
- tests should pass successfully without failures

if tests are failing

- execute `cd e2e/a21` in `ng-mocks`
- execute `nvm install`
- execute `nvm nvm use`
- execute `npm run test:debug`

### Step #6 - update version references

- update the version table in `ng-mocks/docs/articles/index.md`
- update the migration guide in `docs/articles/migrations.md`
- update the version table in `ng-mocks/README.md`
- update `description` in `libs/ng-mocks/package.json`
- update `peerDependencies` in `libs/ng-mocks/package.json`
- update this file and replace `a21` with `a22`
- update this file and replace `v21` with `v22`
- update this file and replace `^21` with `^22`
- update this file and replace `Angular 21` with `Angular 22`
- update this file and replace `a20` with `a` + `21`
- fix the previous expression manually

### Step #7 - verify

- create a PR against the main branch
- verify that CI doesn't fail
- verify that CI has covered the new version
- [release the new version of `ng-mocks`](#how-to-release-ng-mocks)
