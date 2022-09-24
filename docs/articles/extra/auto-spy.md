---
title: Auto Spy
description: Information how to enable Auto Spy in tests for Angular applications with help of ng-mocks
---

`ngMocks.autoSpy` is useful when you want all mock methods to be spies.

Imagine the situation when a component calls a method of its dependency, and it should be covered by a test.
The `expect.toHaveBeenCalled` accepts a spy, therefore, the method should be a spy,
and that requires you to install the spy at the beginning of the test.

If you have more methods to assert, then you need to install more spies.

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

The solution here is to use `ngMocks.autoSpy`.
By default, all mock methods are empty functions which return `undefined`.
With help of `ngMocks.autoSpy`, the methods will be spies.

So the test can look like:

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

If we want **automatically to spy all methods of services, components**, directives and pipes in Angular tests,
then add the next code to `src/test.ts`.

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

## Custom spy

It might happen that you want to install your own spies for each method.
For example, if you use another library, such as [sinon.js](https://sinonjs.org/).

In this case, you can provide your own callback which creates a spy:

```ts
ngMocks.autoSpy(spyName => {
  return sinon.fake();
});
```

## Change auto spy in a test

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
