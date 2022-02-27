---
title: Auto Spy
description: Information how to enable Auto Spy in tests for Angular applications with help of ng-mocks
---

By default, all mock methods are empty functions which return `undefined`.
If we want **to spy automatically all methods of services, components**, directives and pipes in Angular tests then
add the next code to `src/test.ts`.

```ts title="src/test.ts"
import { ngMocks } from 'ng-mocks';

ngMocks.autoSpy('jasmine');
// // uncomment in case if existing tests are with spies already.
// jasmine.getEnv().allowRespy(true);
```

In case of jest add it to `src/setup-jest.ts` / `src/test-setup.ts`.

```ts title="src/setup-jest.ts / src/test-setup.ts"
import { ngMocks } from 'ng-mocks';

ngMocks.autoSpy('jest');
```

We can provide our own factory function if we need a customized initialization.
It should return a custom spy function.

```ts
ngMocks.autoSpy(spyName => {
  return () => {
    console.log(`call: ${spyName}`);
  };
});
```

Pass `default` as the parameter, if we want to get the default behavior.

```ts
ngMocks.autoSpy('default');
```

Also, it remembers the calls, and we can reset to the previous config.
It might be useful if we need to change **auto spy behavior in a test** via `beforeEach` or `beforeAll`,
and restore it later in `afterEach` or `afterAll` without caring what it was.

```ts
beforeEach(() => ngMocks.autoSpy('jasmine'));
beforeEach(() => ngMocks.autoSpy('default'));
beforeEach(() => ngMocks.autoSpy('jasmine'));
afterEach(() => ngMocks.autoSpy('reset')); // now it is default
afterEach(() => ngMocks.autoSpy('reset')); // now it is jasmine
// out of calls, now it is default
afterEach(() => ngMocks.autoSpy('reset'));
```
