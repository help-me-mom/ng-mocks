---
title: How to mock dependencies of initialization logic
description: Mocking dependencies provided in constructor of an Angular declaration
sidebar_label: Initialization Logic
---

This article describes **how to mock dependencies of initialization logic**.
Basically, **how to mock a `Service`** and/or **how to mock an `InjectionToken`**
which are injected in a constructor as dependencies.
Also, this article covers how to change mocks to provide different values for the initialization logic.

Let's imagine we have a declaration with dependencies.
Usually, the declaration is a component, directive, pipe, service or even a module,
and its dependencies are services, tokens,
or, even more advanced logic, components and directives on the same host element.

```ts  title="An example how a property is calculated in constructor based on the values from dependencies."
class TargetComponent {
  // A property which will be used somewhere else: in a template or wherever. 
  public name: string;
  
  // Required dependencies.
  constructor(
    @Inject(CONFIG) config: ConfigInterface,
    user: CurrentUserService,
  ) {

    // Business logic in the constructor to calculate the name.
    if (config.displayName === 'first') {
      this.name = user.firstName;
    } else {
      this.name = user.lastName;
    }
  }
}
```

I guess, you have spotted an issue here.
Right, it can require **much boilerplate to mock and customize the dependencies**,
because they are used in the constructor.

The main disadvantages and pain of testing initialization logic in Angular declarations:

- many additional mostly copy-pasted `TestBed.configureTestingModule` with slight differences for each use case
- additional `beforeEach` block with `TestBed.inject` to set values
- `TestBed.inject` doesn't work with host dependencies
- `TestBed.inject` doesn't allow to change primitive values

To make it a joy, `ng-mocks` provides [`MockInstance`](../../api/MockInstance.md)
which can be placed in each `it` before [`MockRender`](../../api/MockRender.md) or `TestBed.createComponent`
to set values,
and **it does support customization of all mock dependencies**: `InjectionToken`, `Service`
or host dependencies such as `Component`, `Directive` or host providers.

```ts
// It is required if you cannot use default customizations.
// https://ng-mocks.sudo.eu/extra/install#default-customizations
// After each test it removes customizations which are done by MockInstance.
MockInstance.scope();

beforeEach(() => {
  // Mocks for dependencies of TargetComponent.
  return TestBed.configureTestingModule({
    declarations: [TargetComponent],
    providers: [
      MockProvider(CONFIG),
      MockProvider(CurrentUserService, {
        firstName: 'firstName',
        lastName: 'lastName',
      }),
    ],
  }).compileComponents();
});

it('covers first name', () => {
  // Customization for the use case.
  MockInstance(
    CONFIG,
    (): ConfigInterface => ({
      displayName: 'first',
    }),
  );

  const fixture = TestBed.createComponent(TargetComponent);
  fixture.detectChanges();

  expect(fixture.componentInstance.name).toEqual('firstName');
});

it('covers last name', () => {
  // Customization for the use case.
  MockInstance(
    CONFIG,
    (): ConfigInterface => ({
      displayName: 'last',
    }),
  );

  const fixture = TestBed.createComponent(TargetComponent);
  fixture.detectChanges();

  expect(fixture.componentInstance.name).toEqual('lastName');
});
```

:::caution Reset customizations
Please, be sure you added `MockInstance.scope();` before your tests.
It resets customizations of `MockInstance` after them. 
:::

Profit, **with help of [`MockInstance`](../../api/MockInstance.md),
you can customize any mock declarations in Angular test**,
regardless whether they are `InjectionToken`, `Service` or even host `Component` or `Directive`.

## Optimized version

If you want to reduce the amount of code in the example above,
you should use [`MockBuilder`](../../api/MockBuilder.md) and [`MockRender`](../../api/MockRender.md).

```ts
MockInstance.scope();

beforeEach(() =>
  MockBuilder(TargetComponent, ItsModule).mock(
    CurrentUserService,
    {
      firstName: 'firstName',
      lastName: 'lastName',
    },
  ),
);

it('covers first name', () => {
  // Customization for the use case.
  MockInstance(
    CONFIG,
    (): ConfigInterface => ({
      displayName: 'first',
    }),
  );

  const fixture = MockRender(TargetComponent);
  expect(fixture.point.componentInstance.name).toEqual(
    'firstName',
  );
});

it('covers last name', () => {
  // Customization for the use case.
  MockInstance(
    CONFIG,
    (): ConfigInterface => ({
      displayName: 'last',
    }),
  );

  const fixture = MockRender(TargetComponent);
  expect(fixture.point.componentInstance.name).toEqual(
    'lastName',
  );
});
```

:::caution Use point
`MockRender` provides the component under `fixture.point.componentInstance`.
:::


## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockInitializationLogic/test.spec.ts&initialpath=%3Fspec%3DMockInitializationLogic)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockInitializationLogic/test.spec.ts&initialpath=%3Fspec%3DMockInitializationLogic)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockInitializationLogic/test.spec.ts"
import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import {
  MockBuilder,
  MockInstance,
  MockProvider,
  MockRender,
} from 'ng-mocks';
import { TestBed } from '@angular/core/testing';

interface ConfigInterface {
  displayName: 'first' | 'last';
}

const CONFIG = new InjectionToken<ConfigInterface>('CONFIG');

@Injectable()
class CurrentUserService {
  firstName?: string;
  lastName?: string;
}

@Component({
  selector: 'target',
  template: '{{ name }}',
})
class TargetComponent {
  // A property which will be used somewhere else: in a template or wherever.
  public name?: string;

  // Required dependencies.
  constructor(
    @Inject(CONFIG) config: ConfigInterface,
    user: CurrentUserService,
  ) {
    // Business logic in the constructor to calculate the name.
    if (config.displayName === 'first') {
      this.name = user.firstName;
    } else {
      this.name = user.lastName;
    }
  }

  TargetComponentMockInitializationLogic() {}
}

@NgModule({
  declarations: [TargetComponent],
  providers: [
    {
      provide: CONFIG,
      useValue: {
        displayName: 'first',
      },
    },
    CurrentUserService,
  ],
})
class ItsModule {}

describe('MockInitializationLogic', () => {
  describe('TestBed', () => {
    // It is required if you cannot use default customizations.
    // https://ng-mocks.sudo.eu/extra/install#default-customizations
    // After each test it removes customizations which are done by MockInstance.
    MockInstance.scope();

    beforeEach(() => {
      // Mocks for dependencies of TargetComponent.
      return TestBed.configureTestingModule({
        declarations: [TargetComponent],
        providers: [
          MockProvider(CONFIG),
          MockProvider(CurrentUserService, {
            firstName: 'firstName',
            lastName: 'lastName',
          }),
        ],
      }).compileComponents();
    });

    it('covers first name', () => {
      // Customization for the use case.
      MockInstance(
        CONFIG,
        (): ConfigInterface => ({
          displayName: 'first',
        }),
      );

      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.name).toEqual('firstName');
    });

    it('covers last name', () => {
      // Customization for the use case.
      MockInstance(
        CONFIG,
        (): ConfigInterface => ({
          displayName: 'last',
        }),
      );

      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.name).toEqual('lastName');
    });
  });

  describe('MockBuilder', () => {
    MockInstance.scope();

    beforeEach(() =>
      MockBuilder(TargetComponent, ItsModule).mock(
        CurrentUserService,
        {
          firstName: 'firstName',
          lastName: 'lastName',
        },
      ),
    );

    it('covers first name', () => {
      // Customization for the use case.
      MockInstance(
        CONFIG,
        (): ConfigInterface => ({
          displayName: 'first',
        }),
      );

      const fixture = MockRender(TargetComponent);
      expect(fixture.point.componentInstance.name).toEqual(
        'firstName',
      );
    });

    it('covers last name', () => {
      // Customization for the use case.
      MockInstance(
        CONFIG,
        (): ConfigInterface => ({
          displayName: 'last',
        }),
      );

      const fixture = MockRender(TargetComponent);
      expect(fixture.point.componentInstance.name).toEqual(
        'lastName',
      );
    });
  });
});
```
