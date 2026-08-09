---
title: Auto Spy
description: Information on how to enable Auto Spy in tests for Angular applications with ng-mocks
---

`ngMocks.autoSpy` replaces empty methods on mocks created by ng-mocks with runner-native spies.
This is useful because the `toHaveBeenCalled()` matcher requires a spy or mock function;
without auto-spy, every asserted method must be wrapped explicitly.

Assume the suite setup already replaces `UserService` with an ng-mocks mock.
Without auto-spy, a Jasmine test needs explicit `spyOn` calls:

```ts
it('calls UserService methods', () => {
  const userService = TestBed.inject(UserService);
  spyOn(userService, 'init'); // why?
  spyOn(userService, 'load'); // why?
  spyOn(userService, 'set'); // why?

  const fixture = TestBed.createComponent(UserComponent);
  fixture.detectChanges();

  expect(userService.init).toHaveBeenCalled();
  expect(userService.load).toHaveBeenCalled();
  expect(userService.set).toHaveBeenCalled();
});
```

By default, mock methods are empty functions which return `undefined`.
After enabling `ngMocks.autoSpy`, the test can omit the explicit `spyOn` calls:

```ts
it('calls UserService methods', () => {
  const fixture = TestBed.createComponent(UserComponent);
  fixture.detectChanges();

  const userService = TestBed.inject(UserService);
  expect(userService.init).toHaveBeenCalled();
  expect(userService.load).toHaveBeenCalled();
  expect(userService.set).toHaveBeenCalled();
});
```

## Installation

Enable auto-spy once in the selected runner's setup file.
It affects methods on mocked services, components, directives and pipes created by ng-mocks.

For Jasmine, add it to `src/test.ts`.

```ts title="src/test.ts"
import { ngMocks } from 'ng-mocks';

ngMocks.autoSpy('jasmine');
// Uncomment if existing tests also install spies.
// jasmine.getEnv().allowRespy(true);
```

For Jest, add it to `src/setup-jest.ts` / `src/test-setup.ts`.

```ts title="src/setup-jest.ts / src/test-setup.ts"
import { ngMocks } from 'ng-mocks';

ngMocks.autoSpy('jest');
```

For Vitest, add it to `src/setup-vitest.ts`.

```ts title="src/setup-vitest.ts"
import { ngMocks } from 'ng-mocks';

ngMocks.autoSpy('vitest');
```

See the [native Vitest setup guide](install.md#angular-native-vitest-setup) for how Angular loads this file.

## Custom spy factory

To use another spy library, such as [sinon.js](https://sinonjs.org/), provide a custom factory:

```ts
ngMocks.autoSpy(() => sinon.fake());
```

## Temporarily change auto-spy

Pass `default` to make subsequently created mocks use empty functions instead of spies.

```ts
ngMocks.autoSpy('default');
```

Every non-reset call is stacked. Pair a temporary override with one reset to restore
the setup file's previous choice:

```ts
beforeEach(() => ngMocks.autoSpy('default'));
afterEach(() => ngMocks.autoSpy('reset'));
```
