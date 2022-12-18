---
title: How to test a multi token in Angular application
description: Covering an Angular multi token with tests
sidebar_label: Multi token
---

If you did not read ["How to test a token"](token.md), please do it first.

Testing multi tokens is quite similar with the difference that `TestBet.get` returns an array of all providers
matching the token.

```ts
const values = TestBed.get(TOKEN_MULTI);
expect(values).toEqual(jasmine.any(Array));
expect(values.length).toEqual(4);
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestMultiToken/test.spec.ts&initialpath=%3Fspec%3DTestMultiToken)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestMultiToken/test.spec.ts&initialpath=%3Fspec%3DTestMultiToken)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestMultiToken/test.spec.ts"
import { Injectable, InjectionToken, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

const TOKEN_MULTI = new InjectionToken('MULTI');

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
      multi: true,
      provide: TOKEN_MULTI,
      useClass: ServiceClass,
    },
    {
      multi: true,
      provide: TOKEN_MULTI,
      useExisting: ServiceExisting,
    },
    {
      multi: true,
      provide: TOKEN_MULTI,
      useFactory: () => 'FACTORY',
    },
    {
      multi: true,
      provide: TOKEN_MULTI,
      useValue: 'VALUE',
    },
  ],
})
class TargetModule {}

describe('TestMultiToken', () => {
  // Because we want to test the token, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its initialization
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TOKEN_MULTI, TargetModule));

  it('creates TOKEN_MULTI', () => {
    const tokens =
      MockRender<any[]>(TOKEN_MULTI).point.componentInstance;

    expect(tokens).toEqual(jasmine.any(Array));
    expect(tokens.length).toEqual(4);

    // Verifying that the token is an instance of ServiceClass.
    expect(tokens[0]).toEqual(jasmine.any(ServiceClass));
    expect(tokens[0].name).toEqual('class');

    // Verifying that the token is an instance of ServiceExisting.
    // But because it has been replaced with its mock copy
    // we should see an empty name.
    expect(tokens[1]).toEqual(jasmine.any(ServiceExisting));
    expect(tokens[1].name).toBeUndefined();

    // Checking that we have here what factory has been created.
    expect(tokens[2]).toEqual('FACTORY');

    // Checking the set value.
    expect(tokens[3]).toEqual('VALUE');
  });
});
```
