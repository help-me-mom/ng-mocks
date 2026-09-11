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
it('calls user.load', () => {
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
it('calls user.load', () => {
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
ngMocks.autoSpy(spyName => {
  return sinon.fake();
});
```

## Temporarily change auto-spy

Pass `default` to make subsequently created mocks use empty functions instead of spies.
This changes mock methods only; dependency selection still follows your `MockBuilder` setup.

```ts
ngMocks.autoSpy('default');
```

Every non-reset call is stacked and each reset restores the previous choice:

```ts
beforeEach(() => ngMocks.autoSpy('jasmine'));
beforeEach(() => ngMocks.autoSpy('default'));
beforeEach(() => ngMocks.autoSpy('jasmine'));
afterEach(() => ngMocks.autoSpy('reset')); // now it is default
afterEach(() => ngMocks.autoSpy('reset')); // now it is jasmine
// out of calls, now it is default
afterEach(() => ngMocks.autoSpy('reset'));
```

### Updating tests affected by #14899

The runtime `inject()` mocking hook in ng-mocks 14.16.0–14.17.6 incorrectly required auto-spy.
Where that hook applied, disabling auto-spy could resolve real root dependencies during construction.
The correction for [#14899](https://github.com/help-me-mom/ng-mocks/issues/14899) makes those dependencies
follow the existing `MockBuilder` mocking policy in default mode too.

For example, on Angular 14+, suppose `InjectComponent` uses `inject(TargetDependency)` in a field initializer
and its constructor body, and saves the results of `echo()` as `fieldValue` and `bodyValue`.
The real root dependency's `echo()` returns `'real'`. With one-argument `MockBuilder`, update expectations
that relied on that real implementation:

```ts
beforeEach(() => ngMocks.autoSpy('default'));
afterEach(() => ngMocks.autoSpy('reset'));
beforeEach(() => MockBuilder(InjectComponent));

it('uses empty mock methods during construction', () => {
  const component = MockRender(InjectComponent).point.componentInstance;

  // Previously: expect(component.fieldValue).toBe('real');
  expect(component.fieldValue).toBeUndefined();
  expect(component.bodyValue).toBeUndefined();
});
```

If the test needs the real root dependency, use this builder setup instead:

```ts
beforeEach(() => MockBuilder(InjectComponent).keep(TargetDependency));

it('uses the explicitly kept dependency', () => {
  const component = MockRender(InjectComponent).point.componentInstance;

  expect(component.fieldValue).toBe('real');
  expect(component.bodyValue).toBe('real');
});
```

The same correction applies to runtime dependencies of directly kept services. Existing constructor-parameter
dependency mocking, automatic mocks created with auto-spy enabled, and explicit keep/mock choices retain their behavior.

Explicit `.exclude(TargetDependency)` also reaches the runtime hook in both auto-spy modes. It removes the dependency
from the testing module's providers while preserving Angular's root fallback, so a root-provided dependency resolves
to its real implementation instead of an automatic mock. Use `.keep(TargetDependency)` when the test needs to state
that dependency's real behavior explicitly.
