---
title: ngMocks.globalReplace
description: Documentation about ngMocks.globalReplace from ng-mocks library
---

`ngMocks.globalReplace` marks declarations and modules (but not services and tokens) to be replaced during creating mock modules.

The best place to do that is in `src/test.ts` for `jasmine` or in `src/setup-jest.ts` for `jest`.

If we wanted to replace `BrowserAnimationsModule` with `NoopAnimationsModule` globally,
we could do it like that:

```ts title="src/test.ts"
ngMocks.globalReplace(BrowserAnimationsModule, NoopAnimationsModule);
```

Now, all mock modules which import `BrowserAnimationsModule` have `NoopAnimationsModule` instead.
