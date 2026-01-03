---
title: How to test a routing guard in Angular application
description: Covering an Angular routing guard with tests
sidebar_label: Routing guard
---

If you have not read ["How to test a route"](route.md), please do it first.

To test a guard means that we need to mock everything except the guard and `RouterModule`.
But, what if we have several guards? If we mocked them they would block routes due to falsy returns of their mocked methods.
**To remove guards in angular tests `ng-mocks` provides `NG_MOCKS_GUARDS` token**, we should pass it into `.exclude`, then all other guards will be
excluded from `TestBed`, and we can be sure that we are **testing only the guard we want**.

The example below is applicable for all types of guards:

- `canActivate` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-activate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivate),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-activate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivate)
- `canActivateChild` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-activateChild.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivateChild),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-activateChild.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivateChild)
- `canDeactivate` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-deactivate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanDeactivate),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-deactivate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanDeactivate)
- `canMatch` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-match.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanMatch),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-match.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanMatch)
- `canLoad` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-load.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanLoad),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-load.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanLoad)
- class guards (legacy) -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/test.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3Atest),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/test.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3Atest)

## Functional Guards

A functional guard is a simple function, and not a service or a token how it was before Angular 14.
A guard resides in the configuration of routes,
which is defined as an import of `RouterModule.forRoot` or `RouterModule.forChild` in a module.

To test a guard, you need the guard and the module which defines a route with the guard.
For simplicity, let's call the guard `loginGuard`, and the module `TargetModule`.

The guard should be tested in isolation, to avoid side effects of other guards.
Also, `RouterModule` and its dependencies should be provided in a test
to ensure that the guard has been connected to its route correctly and you can assert `Location` and/or `Router`.
The rest can be mocks.

```ts
beforeEach(() =>
  MockBuilder(
    // first parameter
    // providing RouterModule and its dependencies
    [RouterModule, NG_MOCKS_ROOT_PROVIDERS],

    // second parameter
    // Mocking definition of TargetModule
    TargetModule,
  )

    // chain
    // excluding all guards to avoid side effects
    .exclude(NG_MOCKS_GUARDS)

    // chain
    // keeping loginGuard for testing
    .keep(loginGuard)

    // chain
    // providing location mocks for testing
    .provide(provideLocationMocks())
);
```

Let's assume that the guard redirects all routes to `/login` if a user is not logged in.
It means when the app has been initialized, the router should end up on `/login`.

Let's assert that:

1. render a router outlet
1. initialize navigation
1. assert the location

To render a router outlet, you can use `MockRender` with empty parameters.

```ts
const fixture = MockRender(RouterOutlet, {});
```

Now, you can get `Router` and `Location`.
The first one is needed for the initialization,
the second one for assertion.

```ts
const router = ngMocks.get(Router);
const location = ngMocks.get(Location);
```

To initialize navigation, you need to call `router.initialNavigation`,
and then `await fixture.whenStable()` to ensure that the route has been initialized and rendered.

```ts
if (fixture.ngZone) {
  fixture.ngZone.run(() => router.initialNavigation());
  await fixture.whenStable(); // is needed for rendering of the current route.
}
```

Now, the location can be asserted.

```ts
expect(location.path()).toEqual('/login');
```


Profit, [an example of a test for a functional guard](#live-example).

## Class Guards (legacy)

If your code has guards which a classes and angular services,
the process is exactly the same as for [functional guards](#functional-guards).

For example, if the class of the guard is called `LoginGuard`,
the configuration of `TestBed` should be the next:

```ts
beforeEach(() =>
  MockBuilder(
    // first parameter
    // providing RouterModule and its dependencies
    [RouterModule, NG_MOCKS_ROOT_PROVIDERS],

    // second parameter
    // Mocking definition of TargetModule
    TargetModule,
  )

    // chain
    // excluding all guards to avoid side effects
    .exclude(NG_MOCKS_GUARDS)

    // chain
    // keeping LoginGuard for testing
    .keep(LoginGuard)

    // chain
    // providing location mocks for testing
    .provide(provideLocationMocks())
);
```

Profit.

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-activate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivate)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-activate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivate)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestRoutingGuard/can-activate.spec.ts"
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import {
  Component,
  inject,
  Injectable,
  NgModule,
} from '@angular/core';
import {
  CanActivateFn,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { from } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  NG_MOCKS_GUARDS,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

// A simple service simulating login check.
// It will be replaced with its mock copy.
@Injectable()
class LoginService {
  public isLoggedIn = false;
}

// A guard we want to test.
const canActivateGuard: CanActivateFn = (route, state) => {
  if (route && state && inject(LoginService).isLoggedIn) {
    return true;
  }

  return from(inject(Router).navigate(['/login'])).pipe(mapTo(false));
};

// Another guard like in a real world example.
// The guard should be removed from testing to avoid side effects on the route.
const sideEffectGuard: CanActivateFn = () => false;

// A simple component pretending a login form.
// It will be replaced with a mock copy.
@Component({
  selector: 'login',
  template: 'login',
})
class LoginComponent {}

// A simple component pretending a protected dashboard.
// It will be replaced with a mock copy.
@Component({
  selector: 'dashboard',
  template: 'dashboard',
})
class DashboardComponent {}

// Definition of the routing module.
@NgModule({
  declarations: [LoginComponent, DashboardComponent],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot([
      {
        component: LoginComponent,
        path: 'login',
      },
      {
        canActivate: [canActivateGuard, sideEffectGuard],
        component: DashboardComponent,
        path: '**',
      },
    ]),
  ],
  providers: [LoginService],
})
class TargetModule {}

describe('TestRoutingGuard:canActivate', () => {
  // Because we want to test a canActive guard, it means that we want to
  // test its integration with RouterModule.
  // Therefore, RouterModule and the guard should be kept,
  // and the rest of the module which defines the route can be mocked.
  // To configure RouterModule for the test,
  // RouterModule and NG_MOCKS_ROOT_PROVIDERS should be specified as
  // the first parameter of MockBuilder.
  // The module with routes and the guard should be specified
  // as the second parameter of MockBuilder.
  // Then `NG_MOCKS_GUARDS` should be excluded to remove all guards,
  // and `canActivateGuard` should be kept to let you test it.
  beforeEach(() => {
    return MockBuilder(
      [RouterModule, NG_MOCKS_ROOT_PROVIDERS],
      TargetModule,
    )
      .exclude(NG_MOCKS_GUARDS)
      .keep(canActivateGuard)
      .provide(provideLocationMocks());
  });

  // It is important to run routing tests in async.
  it('redirects to login', async () => {
    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const location = ngMocks.get(Location);

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      await fixture.whenStable(); // is needed for rendering of the current route.
    }

    // Because by default we are not logged in, the guard should
    // redirect us to /login page.
    expect(location.path()).toEqual('/login');
    expect(() => ngMocks.find(LoginComponent)).not.toThrow();
  });

  it('loads dashboard', async () => {
    // Set up the LoginService to be logged in BEFORE rendering
    MockInstance(LoginService, 'isLoggedIn', true);

    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const location = ngMocks.get(Location);

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      await fixture.whenStable(); // is needed for rendering of the current route.
    }

    // Because now we are logged in, the guard should let us land on
    // the dashboard.
    expect(location.path()).toEqual('/');
    expect(() => ngMocks.find(DashboardComponent)).not.toThrow();
  });
});
```

## Migration from Angular 20 and earlier

If you are migrating from Angular 20 or earlier, you **must** update your routing guard tests.
See the [migration guide in the Route documentation](route.md#migration-from-angular-20-and-earlier) for details on:

- Replacing `RouterTestingModule.withRoutes([])` with `provideLocationMocks()`
- Migrating from `fakeAsync` + `tick()` to `async` + `await fixture.whenStable()`

:::warning
The `fakeAsync` + `tick()` pattern may not work reliably with Angular 21 routing tests.
:::
