# How to contribute to ngMocks

The best way would be to discuss an issue or an improvement first:

- [ask a question on gitter](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
- [report it as an issue on github](https://github.com/ike18t/ng-mocks/issues)

## How to release ngMocks

It is possible on Unix based OS, Windows has not been supported.

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
GIT_AUTHOR_NAME=Best Coder
GIT_AUTHOR_EMAIL=best@coder.com
GIT_COMMITTER_NAME=Best Coder
GIT_COMMITTER_EMAIL=best@coder.com
```

After that you need to execute `npm run release -- --no-ci`.

Profit.
