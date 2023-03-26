---
title: How to test a token in Angular application
description: Covering an Angular token with tests
sidebar_label: Token
---

For proper testing of tokens in Angular application, we need extra declarations compare to their usage in the application.

Because a token might have a factory function, it is not always necessary to list the token in providers for successful execution of its application.
Unfortunately, for testing it is not like that, and in this case `ng-mocks` cannot detect the token.
Please make sure, that the token and its dependencies are listed in providers of a related module, then `ng-mocks` can mock them properly.

Configuration of `TestBed` should be done via [`MockBuilder`](https://www.npmjs.com/package/ng-mocks#mockbuilder) where its first parameter is the token we want to test, and
the second parameter is its module.

```ts
beforeEach(() => MockBuilder(TOKEN_EXISTING, TargetModule));
```

If you test a token with `useExisting` flag, then you need to keep in mind that the pointer will be mocked unless it has
been marked for being kept.

```ts
beforeEach(() =>
  MockBuilder(TOKEN_EXISTING, TargetModule)
    // ServiceExisting is provided / imported in TargetModule
    .keep(ServiceExisting)
);
```

In a test we need to fetch the token and assert its value.

```ts
const token = TestBed.get(TOKEN_EXISTING);
expect(token).toEqual(jasmine.any(ServiceExisting));
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestToken/test.spec.ts&initialpath=%3Fspec%3DTestToken)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestToken/test.spec.ts&initialpath=%3Fspec%3DTestToken)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestToken/test.spec.ts"
import { Injectable, InjectionToken, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN_CLASS = new InjectionToken('CLASS');
const TOKEN_EXISTING = new InjectionToken('EXISTING');
const TOKEN_FACTORY = new InjectionToken('FACTORY');
const TOKEN_VALUE = new InjectionToken('VALUE');

class ServiceClass {
  public readonly name = 'class';
}

@Injectable()
class ServiceExisting {
  public readonly name = 'existing';
}

// A module that provides all services.
@NgModule({
  providers: [
    ServiceExisting,
    {
      provide: TOKEN_CLASS,
      useClass: ServiceClass,
    },
    {
      provide: TOKEN_EXISTING,
      useExisting: ServiceExisting,
    },
    {
      provide: TOKEN_FACTORY,
      useFactory: () => 'FACTORY',
    },
    {
      provide: TOKEN_VALUE,
      useValue: 'VALUE',
    },
  ],
})
class TargetModule {}

describe('TestToken', () => {
  ngMocks.faster();

  // Because we want to test the tokens, we pass them in .keep in
  // the chain on MockBuilder. To correctly satisfy their
  // initialization we need to pass its module as the second
  // parameter.
  beforeEach(() => {
    return MockBuilder(
      [TOKEN_CLASS, TOKEN_EXISTING, TOKEN_FACTORY, TOKEN_VALUE],
      TargetModule,
    );
  });

  it('creates TOKEN_CLASS', () => {
    const token =
      MockRender<ServiceClass>(TOKEN_CLASS).point.componentInstance;

    // Verifying that the token is an instance of ServiceClass.
    expect(token).toEqual(jasmine.any(ServiceClass));
    expect(token.name).toEqual('class');
  });

  it('creates TOKEN_EXISTING', () => {
    const token =
      MockRender<ServiceExisting>(TOKEN_EXISTING).point
        .componentInstance;

    // Verifying that the token is an instance of ServiceExisting.
    // But because it has been replaced with a mock copy,
    // we should see an empty name.
    expect(token).toEqual(jasmine.any(ServiceExisting));
    expect(token.name).toBeUndefined();
  });

  it('creates TOKEN_FACTORY', () => {
    const token = MockRender(TOKEN_FACTORY).point.componentInstance;

    // Checking that we have here what factory has been created.
    expect(token).toEqual('FACTORY');
  });

  it('creates TOKEN_VALUE', () => {
    const token = MockRender(TOKEN_VALUE).point.componentInstance;

    // Checking the set value.
    expect(token).toEqual('VALUE');
  });
});
```
