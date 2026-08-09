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

The example below is a Jasmine-oriented template. Comments show where Jest or Vitest
configuration differs; do not copy runner-specific blocks into another runner's setup.
The native Vitest setup is described below.

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
// For Vitest, use MockInstance.scope() instead of this reporter.
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

## Angular native Vitest setup

Starting with Angular 20, Angular provides `@angular/build:unit-test` with a native Vitest runner.
The builder requires the Angular application build system, so the selected build target
must use `@angular/build:application`. If it does not, follow Angular's
[application build-system migration](https://angular.dev/tools/cli/build-system-migration)
before configuring Vitest.

The tested combinations are:

| Angular | Vitest | change detection |
| ------: | :----: | :--------------- |
|      22 |   4    | zoned or zoneless |
|      21 |   4    | zoned or zoneless |
|      20 |   3    | zoneless only |

Angular 20's supported Zone.js version does not contain the Vitest patch.
Starting with Angular 21, zoned tests require Zone.js 0.16.2 or newer within the
version range supported by Angular. Earlier Angular versions do not provide this native builder.

### Install the runner

Install Vitest and a DOM emulator compatible with the installed `@angular/build`.
Use these compatible ranges for the setup tested by ng-mocks:

```bash npm2yarn title="Angular 20"
npm install --save-dev vitest@^3.1.1 jsdom@^26.1.0
```

```bash npm2yarn title="Angular 21+"
npm install --save-dev vitest@^4.0.8 jsdom@^28.0.0
```

For zoned tests starting with Angular 21, install Zone.js if the application
does not already have version 0.16.2 or newer:

```bash npm2yarn
npm install --save-dev zone.js@~0.16.2
```

Angular's [Vitest migration guide](https://angular.dev/guide/testing/migrating-to-vitest)
describes the native runner and alternatives such as `happy-dom`.

### Configure TypeScript and ng-mocks

Use the same test TypeScript configuration as the project's other runners. Add
`vitest/globals` to its existing types and `src/setup-vitest.ts` to its existing files.
For example, a project that runs Jasmine, Jest, and Vitest from the same specs can use:

```json title="tsconfig.spec.json"
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jasmine", "jest", "vitest/globals"]
  },
  "files": ["src/test.ts", "src/setup-jest.ts", "src/setup-vitest.ts"],
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

Keep only the runner types and setup files that the project actually uses. TypeScript
compiles every listed setup file, while each runner still executes only the setup file
selected by its own configuration.

Auto-spy is optional. If enabled, `ngMocks.autoSpy('vitest')` uses `vi.fn()` for methods
on mocks created by ng-mocks:

```ts title="src/setup-vitest.ts"
import { ngMocks } from 'ng-mocks';

ngMocks.autoSpy('vitest');
```

The setup file can also contain the same `ngMocks.defaultMock` and `ngMocks.globalKeep`
customizations used with Jasmine or Jest. Angular initializes `TestBed`; do not initialize
the test environment manually.

### Angular 21+

ng-mocks creates Angular declarations at runtime, so its Vitest build must use JIT
compilation with `aot: false`. Inside the project's existing `architect` section, merge the
following build configurations and sibling test target. Replace `my-app` with the project
name and keep the existing build options:

```json title="angular.json"
{
  "build": {
    "builder": "@angular/build:application",
    "configurations": {
      "vitest": {
        "aot": false,
        "polyfills": []
      },
      "vitest-zoned": {
        "polyfills": [
          "zone.js",
          "zone.js/testing",
          "zone.js/plugins/vitest-patch"
        ]
      }
    }
  },
  "test-vitest": {
    "builder": "@angular/build:unit-test",
    "options": {
      "runner": "vitest",
      "setupFiles": ["src/setup-vitest.ts"],
      "tsConfig": "tsconfig.spec.json"
    },
    "configurations": {
      "zoned": {
        "buildTarget": "my-app:build:development,vitest,vitest-zoned"
      },
      "zoneless": {
        "buildTarget": "my-app:build:development,vitest"
      }
    },
    "defaultConfiguration": "zoned"
  }
}
```

The explicit empty `polyfills` array keeps the zoneless profile free of Zone.js.
For the zoned profile, preserve the shown order: Zone.js, its testing utilities,
then the Vitest patch. Run the desired profile with:

```bash
npx ng run my-app:test-vitest:zoned
npx ng run my-app:test-vitest:zoneless
```

If only one change-detection mode is needed, keep only that configuration.
Keeping `test-vitest` beside an existing Karma `test` target lets both runners use
their normal configuration. In a Vitest-only project, name this target `test` and
run it with `ng test`.

### Angular 20

Angular 20's experimental unit-test builder loads `setupFiles` outside the application
bundle. Instead, import the ng-mocks setup from the zoneless provider file so ng-mocks,
Angular, and the tests use the same module graph:

```ts title="src/providers.zoneless.ts"
import { provideZonelessChangeDetection } from '@angular/core';

import './setup-vitest';

export default [provideZonelessChangeDetection()];
```

In the shared test TypeScript configuration above, add the provider file as well:

```json title="tsconfig.spec.json"
{
  "files": [
    "src/test.zoneless.ts",
    "src/setup-jest.zoneless.ts",
    "src/setup-vitest.ts",
    "src/providers.zoneless.ts"
  ]
}
```

Keep the existing entries for the runners used by the project.

Then merge this JIT build configuration and target into the project's `architect` section:

```json title="angular.json"
{
  "build": {
    "builder": "@angular/build:application",
    "configurations": {
      "vitest": {
        "aot": false,
        "polyfills": ["@angular/compiler"]
      }
    }
  },
  "test-vitest": {
    "builder": "@angular/build:unit-test",
    "options": {
      "runner": "vitest",
      "buildTarget": "my-app:build:development,vitest",
      "providersFile": "src/providers.zoneless.ts",
      "tsConfig": "tsconfig.spec.json"
    }
  }
}
```

Do not register the ng-mocks setup through this Angular 20 target's `setupFiles`.
Unrelated setup files that do not import ng-mocks or Angular can still use that option.
The explicit compiler polyfill is required by the Angular 20 builder when `aot` is
disabled. Run it with:

```bash
npx ng run my-app:test-vitest
```

## Restoring `src/test.ts` for Karma/Jasmine in Angular 15+

If you are using Angular 15+, then you might not find `src/test.ts`.
Restore it if you want global ng-mocks configuration for Karma/Jasmine tests.
Native Vitest uses `src/setup-vitest.ts` as described above.

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
