# How to contribute to ng-mocks

The best way would be to discuss an issue or an improvement first:

- [ask a question on gitter](https://gitter.im/ng-mocks/community)
- [report it as an issue on github](https://github.com/help-me-mom/ng-mocks/issues)

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
- install `docker-compose`: https://docs.docker.com/compose/install/
- install `nvm`: https://github.com/nvm-sh/nvm#installing-and-updating

### Requirements on Linux

- install `docker`: https://hub.docker.com
- install `docker-compose`: https://docs.docker.com/compose/install/
- install `nvm`: https://github.com/nvm-sh/nvm#installing-and-updating

### Requirements on Windows

- install `Git BASH`: https://gitforwindows.org
- install `docker` for `WSL`: https://docs.docker.com/desktop/windows/wsl/
- install `docker-compose`: https://docs.docker.com/compose/install/
- install `nvm`: https://github.com/nvm-sh/nvm#installing-and-updating

## Development

To develop `ng-mocks` you need to use `bash` and `WSL` in case if you are on Windows.

### How to install dependencies

- start `docker` and ensure it's running
- open a `bash` session in a terminal (Git BASH on Windows)
- execute

  ```shell
  sh ./docker-compose.sh
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

- execute `npm run release -- --no-ci` - to generate a release and publish it on [github.com](https://github.com/help-me-mom/ng-mocks/releases)
- execute `npm publish ./tmp/ng-mocks-N.N.N.tgz` - to publish it on [npmjs.com](https://www.npmjs.com/package/ng-mocks)
- profit
