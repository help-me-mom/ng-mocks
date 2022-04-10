# How to contribute to ng-mocks

The best way would be to discuss an issue or an improvement first:

- [ask a question on gitter](https://gitter.im/ng-mocks/community)
- [report it as an issue on github](https://github.com/ike18t/ng-mocks/issues)

## How tu run unit tests locally

- open a terminal and execute

  ```shell
  npm run test
  ```

## How tu run E2E tests locally

- install docker: https://hub.docker.com
- install docker-compose: https://docs.docker.com/compose/install/
- open a terminal and execute

  ```shell
  docker-compose up --build
  ```

## How to run tests in IE locally

- login to a Windows OS: https://developer.microsoft.com/en-us/microsoft-edge/tools/vms
- install git-scm: https://git-scm.com/download/win
- install node and npm: https://nodejs.org
- open Git Bash and execute

  ```shell
  export IE_BIN="/c/Program Files/Internet Explorer/iexplore.exe"
  cd /c/ && rm -Rf ng-mocks && mkdir ng-mocks && cd ng-mocks
  find /z/ng-mocks -maxdepth 1 -not -name ng-mocks -not -name .git -not -name docs -not -name e2e -not -name node_modules -exec cp -r {} . \;
  npm ci --no-optional --ignore-scripts
  npm run test
  ```

## How to release ng-mocks

It is possible on Unix based OS, Windows OS has not been supported yet.

You need to create a `.env` file with the next content:

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

After that you need to execute 2 commands:

- `npm run release -- --no-ci` - to generate a release and publish it on [github.com](https://github.com/ike18t/ng-mocks/releases)
- `npm publish ./tmp/ng-mocks-N.N.N.tgz` - to publish it on [npmjs.com](https://www.npmjs.com/package/ng-mocks)

Profit.
