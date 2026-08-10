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

Global test setup can define default mocks, enable [auto spy](auto-spy.md) for mock methods,
and use [MockInstance](/api/MockInstance.md) to reset customizations automatically after tests and suites.

The example below uses Jasmine. Put the same `ngMocks.defaultMock` and `ngMocks.globalKeep`
customizations in the selected runner's setup file. For Jest and Vitest, use `MockInstance.scope()`
in suites that need automatic cleanup.

```ts title="src/test.ts"
import { ngMocks } from 'ng-mocks'; // eslint-disable-line import/order

// auto spy
ngMocks.autoSpy('jasmine');
// in case of jest
// ngMocks.autoSpy('jest');
// in case of vitest
// ngMocks.autoSpy('vitest');

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
```

## Angular native Vitest setup

Angular 20+ provides a native Vitest runner through `@angular/build:unit-test`.
Follow Angular's [Vitest migration guide](https://angular.dev/guide/testing/migrating-to-vitest)
and use an application build target based on `@angular/build:application`.

The combinations currently tested by ng-mocks are:

| Angular | Vitest | jsdom | change detection |
| ------: | :----: | :---: | :--------------- |
|      20 |   3    |  26   | zoneless only    |
|      21 |   4    |  28   | zoned or zoneless |
|      22 |   4    |  28   | zoned or zoneless |

Install versions accepted by the project's `@angular/build`. For Angular 20:

```bash npm2yarn
npm install --save-dev vitest@^3.1.1 jsdom@^26.1.0
```

For `@angular/build` versions that accept Vitest 4:

```bash npm2yarn
npm install --save-dev vitest@^4.0.8 jsdom@^28.0.0
```

Zoned tests on Angular 21+ also need Zone.js 0.16.2 or newer within Angular's supported range:

```bash npm2yarn
npm install zone.js@~0.16.2
```

### Configuration

Reuse the existing test TypeScript config and add `vitest/globals` to its types. Add
`src/setup-vitest.ts` to `files` only when it contains global ng-mocks customizations;
[Auto Spy](auto-spy.md) shows the optional Vitest setup. Angular initializes `TestBed`,
so do not initialize it in that file. Because ng-mocks creates Angular declarations at
runtime, the Vitest build must set `aot: false`.

### Angular 21+

Add the optional setup file to the unit-test target's `setupFiles`. Use an empty `polyfills`
array for zoneless tests. For zoned tests, preserve this order: `zone.js`, `zone.js/testing`,
then `zone.js/plugins/vitest-patch`.

Keep a `test-vitest` target beside Karma's `test`. In a Vitest-only project, use `test`
and `ng test`. See the complete [shared multi-runner configuration](https://github.com/help-me-mom/ng-mocks/blob/main/e2e/a21/angular.json)
and [Vitest-only configuration](https://github.com/help-me-mom/ng-mocks/blob/main/e2e/vitest/angular.json).

### Angular 20

Angular 20 is zoneless-only because Zone.js 0.15 has no Vitest patch. Its builder loads
`setupFiles` outside the application bundle, so import the optional ng-mocks setup from
the provider file instead:

```ts title="src/providers.zoneless.ts"
import { provideZonelessChangeDetection } from '@angular/core';

import './setup-vitest';

export default [provideZonelessChangeDetection()];
```

Also add `src/providers.zoneless.ts` to the shared test configuration's `files` array.
Set it as the unit-test target's `providersFile` and add `@angular/compiler` to the
Vitest build's `polyfills`. Do not register the ng-mocks setup through Angular 20's
`setupFiles`. See the complete [Angular 20 configuration](https://github.com/help-me-mom/ng-mocks/blob/main/e2e/a20/angular.json).

## Restoring `src/test.ts` for Karma/Jasmine in Angular 15+

If you are using Angular 15+, then you might not find `src/test.ts`.
Restore it if you want global ng-mocks configuration for Karma/Jasmine tests.
Native Vitest uses its configured `src/setup-vitest.ts` instead.

Please use this [answer on stackoverflow to restore `src/test.ts`](https://stackoverflow.com/a/75323651/13112018).

## Restoring `src/setup-jest.ts` in Angular 15+

If you are using Angular 15+ and `@angular-builders/jest`, then you might not find `src/setup-jest.ts`.
The file doesn't exist, because `@angular-builders/jest` provides default configuration in its own package.

To restore `src/setup-jest.ts` you need to recreate this file with the next content:

```ts title="src/setup-jest.ts"
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();
```

Then, open `angular.json`, and at the `test` section of `"builder": "@angular-builders/jest:run"`, add the next option:

```json
"test": {
  "builder": "@angular-builders/jest:run",
  "options": {
    "setupFilesAfterEnv": "./src/setup-jest.ts" // <-- this is the fix
  }
},
```

Profit, now you can extend `setup-jest.ts` to configure defaults for `ng-mocks`.
