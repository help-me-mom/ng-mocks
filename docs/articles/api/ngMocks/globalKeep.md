---
title: ngMocks.globalKeep
description: Documentation about ngMocks.globalKeep from ng-mocks library
---

`ngMocks.globalExclude` marks declarations, services and tokens to be avoided from the mocking process during creating mock modules.

The best place to do that is in `src/test.ts` for `jasmine` or in `src/setup-jest.ts` for `jest`.

Let's mark the `APP_URL` token in order to be kept in mock modules.

```ts title="src/test.ts"
ngMocks.globalKeep(APP_URL);
```

```ts title="src/test.spec.ts"
// ...
MockModule(ModuleWithService);
// ...
const url = TestBed.inject(APP_URL);
// ...
```

The `url` is the original one.
