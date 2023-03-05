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

There are several things you might need to configure globally for all tests:

- default mocks should look like for different strategies (abstract classes)
- adding spy to all mock methods automatically

It may be useful to configure [auto spy](auto-spy.md) for all methods, getters and setters in mock declarations.

Apart from [auto spy](auto-spy.md), we may want to customize mock behavior via [MockInstance](/api/MockInstance.md).
There is a way to reset all customizations automatically on `afterEach` and `afterAll` levels.

Simply add the next code to `src/test.ts` or `src/setup-jest.ts` / `src/test-setup.ts` in case of jest,
and comment / uncomment related blocks:

```ts title="src/test.ts"
import { ngMocks } from 'ng-mocks'; // eslint-disable-line import/order

// auto spy
ngMocks.autoSpy('jasmine');
// in case of jest
// ngMocks.autoSpy('jest');

// In case, if you use @angular/router and Angular 14+.
// You might want to set a mock of DefaultTitleStrategy as TitleStrategy.
// A14 fix: making DefaultTitleStrategy to be a default mock for TitleStrategy
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router'; // eslint-disable-line import/order
import { MockService } from 'ng-mocks'; // eslint-disable-line import/order
ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));

// Usually, *ngIf and other declarations from CommonModule aren't expected to be mocked.
// The code below keeps them.
import { CommonModule } from '@angular/common'; // eslint-disable-line import/order
import { ApplicationModule } from '@angular/core'; // eslint-disable-line import/order
import { BrowserModule } from '@angular/platform-browser'; // eslint-disable-line import/order
ngMocks.globalKeep(ApplicationModule, true);
ngMocks.globalKeep(CommonModule, true);
ngMocks.globalKeep(BrowserModule, true);

// auto restore for jasmine and jest <27
// declare const jasmine: any;
import { MockInstance } from 'ng-mocks'; // eslint-disable-line import/order
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

## Restoring `src/test.ts` in Angular 15

If you are using Angular 15+, then you might not find `src/test.ts`.
However, this file is required to provide global configuration for your tests.

Please use this [answer on stackoverflow to restore `src/test.ts`](https://stackoverflow.com/a/75323651/13112018).
