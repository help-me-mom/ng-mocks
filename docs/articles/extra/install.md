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

// automatic cleanup for jasmine
import { MockInstance } from 'ng-mocks'; // eslint-disable-line import/order
jasmine.getEnv().addReporter({
  specDone: MockInstance.restore,
  specStarted: MockInstance.remember,
  suiteDone: MockInstance.restore,
  suiteStarted: MockInstance.remember,
});
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

Angular 20 is zoneless-only because Zone.js 0.15 does not contain the Vitest patch.

### Install the runner

Install Vitest and a DOM emulator using versions accepted by the installed `@angular/build`.
The following commands match the combinations tested by ng-mocks:

For `@angular/build` versions that accept Vitest 3:

```bash npm2yarn
npm install --save-dev vitest@^3.1.1 jsdom@^26.1.0
```

For `@angular/build` versions that accept Vitest 4:

```bash npm2yarn
npm install --save-dev vitest@^4.0.8 jsdom@^28.0.0
```

For zoned tests starting with Angular 21, use Zone.js 0.16.2 or newer within the
version range supported by Angular. For the tested Angular 21 and 22 setup:

```bash npm2yarn
npm install zone.js@~0.16.2
```

Angular's [Vitest migration guide](https://angular.dev/guide/testing/migrating-to-vitest)
describes the native runner and alternatives such as `happy-dom`.

### Configure TypeScript and ng-mocks

Use the same test TypeScript configuration as the project's other runners and add
`vitest/globals` to its existing types. Create `src/setup-vitest.ts` only when the project
uses global ng-mocks customizations, and then add it to the configuration's existing files.
The examples below include this optional setup file. If it is not needed, omit it from
`files` and `setupFiles`, and omit its side-effect import from the Angular 20 provider file.

For example, a project that runs Jasmine, Jest, and Vitest from the same specs and configures
ng-mocks globally can use:

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

Auto-spy is optional; see [Auto Spy](auto-spy.md) to enable `vi.fn()` for mock methods.
Angular initializes `TestBed`; do not initialize the test environment manually.

### Angular 21+

Because ng-mocks creates Angular declarations at runtime, set `aot: false`.
Merge the `vitest` and `vitest-zoned` configurations into the existing build target,
add `test-vitest` as a sibling target, replace `my-app` with the project name, and retain
the existing build options:

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

The empty `polyfills` array keeps zoneless tests free of Zone.js. Preserve the shown
polyfill order for zoned tests. Run the desired profile with:

```bash
npx ng run my-app:test-vitest:zoned
npx ng run my-app:test-vitest:zoneless
```

Keep only the profiles the project needs. Use `test-vitest` beside an existing Karma
`test` target, or name the target `test` and run `ng test` in a Vitest-only project.

### Angular 20

Angular 20 runs `setupFiles` outside the application bundle. Import `setup-vitest.ts`
from the zoneless provider file instead so Angular, ng-mocks and the specs share one
module graph:

```ts title="src/providers.zoneless.ts"
import { provideZonelessChangeDetection } from '@angular/core';

import './setup-vitest';

export default [provideZonelessChangeDetection()];
```

Also add `src/providers.zoneless.ts` to the shared test configuration's `files` array.

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
The `@angular/compiler` polyfill is required when `aot` is disabled. Run it with:

```bash
npx ng run my-app:test-vitest
```

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
