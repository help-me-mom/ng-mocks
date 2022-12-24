---
title: ngMocks.ignoreOnConsole
description: A way to suppress console logs in Angular unit tests
---

`ngMocks.ignoreOnConsole` suppresses `console.log` with a spy (if [auto spy](/extra/auto-spy.md) is being used).

`ngMocks.ignoreOnConsole` suppresses the functions for the current test suite in `beforeAll` and restores in `afterAll`.

Also, any other methods can be stubbed:

```ts
ngMocks.ignoreOnConsole('log', 'err', 'warn');
```
