---
title: ngMocks.defaultMock
description: Documentation about ngMocks.defaultMock from ng-mocks library
---

Sets default values for mocks in the whole testing environment.

- `ngMocks.defaultMock( Service, (instance, injector) => overrides )` - adds an override for a class
- `ngMocks.defaultMock( TOKEN, (value, injector) => value )` - adds an override for a token
- `ngMocks.defaultMock( Component )` - removes overrides
- `ngMocks.defaultMock( TOKEN )` - removes overrides

The best place to do that is in `src/test.ts` for jasmine or in `src/setup-jest.ts` for `jest`.

For example, if a service or component has a property that should be an `Observable`.
Then, we can configure it to be an `EMPTY` stream in the whole test suite.

```ts
declare class MyComponent {
  public url: string;
  public stream$: Observable<void>;
  public getStream(): Observable<void>;
}
```

```ts title="src/test.ts"
// the returned object will be applied to the component instance.
ngMocks.defaultMock(MyComponent, () => ({
  stream$: EMPTY,
  getStream: () => EMPTY,
}));

// manual override.
ngMocks.defaultMock(MyComponent, instance => {
  instance.stream$ = EMPTY;
});

// overriding tokens.
ngMocks.defaultMock(MY_TOKEN, () => 'DEFAULT_VALUE');

// url will be 'DEFAULT_VALUE'.
ngMocks.defaultMock(MyComponent, (_, injector) => ({
  url: injector.get(MY_TOKEN),
}));

// removing all overrides.
ngMocks.defaultMock(MyComponent);
```
