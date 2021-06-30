---
title: ngMocks.throwOnConsole
description: Documentation about ngMocks.throwOnConsole from ng-mocks library
---

`ngMocks.throwOnConsole` stubs `console.warn` and `console.error` to throw an error instead of printing it into the console.
It is useful in `Ivy` enabled mode, because some errors are printed via `console` instead of being thrown.

`ngMocks.throwOnConsole` stubs the functions for the current test suite in `beforeAll` and restores in `afterAll`.

Also, any other methods can be stubbed:

```ts
ngMocks.throwOnConsole('log');
```
