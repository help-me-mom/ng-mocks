---
title: How to install ng-mocks
description: Installation instructions for ng-mocks
sidebar_label: Installation
---

For **any** Angular 5+ **project** you can use **the latest version** of `ng-mocks`.
Simply install it as a dev dependency.

```bash npm2yarn
npm install ng-mocks --save-dev
```

## Default customizations

It may be useful to configure [auto spy](./auto-spy.md) for all methods, getters and setters in mock declarations.

Apart from [auto spy](./auto-spy.md), we may want to customize mock behavior via [MockInstance](../api/MockInstance.md).
There is a way to reset all customizations automatically on `afterEach` and `afterAll` levels.

Simply add the next code to `src/test.ts` or `src/setup-jest.ts` / `src/test-setup.ts` in case of jest:

```ts title="src/test.ts"
import { ngMocks } from 'ng-mocks';

// auto spy
ngMocks.autoSpy('jasmine');
// in case of jest
// ngMocks.autoSpy('jest');

// auto restore for jasmine and jest <27
// declare const jasmine: any;
jasmine.getEnv().addReporter({
  specDone: MockInstance.restore,
  specStarted: MockInstance.remember,
  suiteDone: MockInstance.restore,
  suiteStarted: MockInstance.remember,
});

// // If you use jest v27+, please add to its config testRunner=jest-jasmine2 for now.
// // If you don't want to rely on jasmine at all, then, please,
// // upvote the issue on github: https://github.com/facebook/jest/issues/11483.
// // Once it has been merged you can use the code below.
// // Also, please consider usage of MockInstance.scope instead.
// import { addEventHandler } from 'jest-circus';
// addEventHandler((event: { name: string }) => {
//   switch (event.name) {
//     case 'run_describe_start':
//     case 'test_start':
//       MockInstance.remember();
//       break;
//     case 'run_describe_finish':
//     case 'run_finish':
//       MockInstance.restore();
//       break;
//     default:
//   }
// });

// // in case of mocha
// mocha.setup({
//   rootHooks: {
//     afterAll: MockInstance.restore,
//     afterEach: MockInstance.restore,
//     beforeAll: MockInstance.remember,
//     beforeEach: MockInstance.remember,
//   },
// });
```
