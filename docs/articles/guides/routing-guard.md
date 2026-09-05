---
title: How to test a routing guard in Angular
description: Covering an Angular routing guard with tests
sidebar_label: Routing guard
---

If you have not read ["How to test a route"](route.md), please do it first.

To test a guard means that we need to mock everything except the guard and `RouterModule`.
But, what if we have several guards? If we mocked them they would block routes due to falsy returns of their mocked methods.
**To remove guards in Angular tests, `ng-mocks` provides the [`NG_MOCKS_GUARDS` token](/api/MockBuilder.md#ng_mocks_guards-token)**. We should pass it into `.exclude`, then all other guards will be
removed from the route configuration processed by `MockBuilder`, and we can be sure that we are **testing only the guard we want**.

The same [`MockBuilder`](/api/MockBuilder.md) setup applies to all five guard properties, including class and token guards.
The functional examples require Angular 14.2 or newer:

- `canActivate` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-activate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivate),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-activate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivate)
- `canActivateChild` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-activate-child.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivateChild),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-activate-child.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivateChild)
- `canDeactivate` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-deactivate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanDeactivate),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-deactivate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanDeactivate)
- `canMatch` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-match.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanMatch),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-match.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanMatch)
- `canLoad` -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-load.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanLoad),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-load.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanLoad)
- standalone applications (Angular 14.2+) -
  [tested source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestRoutingGuard/standalone.spec.ts)
- class guards (legacy) -
  [CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/test.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3Atest),
  [StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/test.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3Atest)

## Functional Guards

A functional guard is a function used directly in a route configuration. Angular 14.2 introduced the functional guard APIs.
A guard resides in the configuration of routes,
which is defined as an import of `RouterModule.forRoot` or `RouterModule.forChild` in a module.

To test a guard, you need the guard and the module which defines a route with the guard.
For simplicity, let's call the guard `canActivateGuard`, and the module `TargetModule`, as in the [live example](#live-example).

The guard should be tested in isolation, to avoid side effects of other guards.
Also, `RouterModule` and its dependencies should be provided in a test
to ensure that the guard has been connected to its route correctly and you can assert `Location` and/or `Router`.
The rest can be mocks.

```ts
beforeEach(() =>
  MockBuilder(
    // first parameter
    // providing RouterModule and its dependencies
    [
      RouterModule,
      RouterTestingModule.withRoutes([]),
      NG_MOCKS_ROOT_PROVIDERS,
    ],
    
    // second parameter
    // Mocking definition of TargetModule
    TargetModule,
  )
  
  // chain
  // excluding all guards to avoid side effects
  .exclude(NG_MOCKS_GUARDS)
  
  // chain
  // keeping canActivateGuard for testing
  .keep(canActivateGuard)
);
```

Let's assume that the guard redirects a protected route to `/login` if a user is not logged in.
It means when the app has been initialized, the router should end up on `/login`.

Let's assert that:

1. render a router outlet
1. initialize navigation
1. assert the location

To render a router outlet, use [`MockRender`](/api/MockRender.md) with an empty object as the second parameter to leave the outlet's inputs untouched.

```ts
const fixture = MockRender(RouterOutlet, {});
```

Now, you can get `Router` and `Location` with [`ngMocks.get`](/api/ngMocks/get.md).
The first one is needed for the initialization,
the second one for assertion.

```ts
const router = ngMocks.get(Router);
const location = ngMocks.get(Location);
```

To initialize navigation, you need to call `router.initialNavigation`,
and then wait for the fixture to become stable so the route has been initialized and rendered.

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


The [live example](#live-example) also uses [`ngMocks.find`](/api/ngMocks/find.md) to assert which component the route rendered.

### Choosing the navigation to test

Choose a navigation that actually invokes the guard under test:

| Guard | Navigation to test | When the guard returns `false` |
| --- | --- | --- |
| `canActivate` | Enter the guarded route. | Navigation is cancelled. |
| `canActivateChild` | Enter a child of the guarded route. | Navigation to the child is cancelled. |
| `canDeactivate` | Enter the component's route first, then navigate away. | The current route and component remain active. |
| `canMatch` | Navigate to a URL matching the guarded route. | Angular tries the next matching route; a fallback can still make navigation succeed. |
| `canLoad` | Navigate to an unloaded route with `loadChildren`. | Navigation is cancelled and the lazy loader is not called. |

A `false` result does not redirect by itself. The activation examples explicitly navigate to `/login`;
the `canMatch` example reaches `/login` through its wildcard fallback.
See Angular's [guard return types](https://angular.dev/guide/routing/route-guards#route-guard-return-types).

### Testing lazy loading

`canLoad` runs before loading a lazy module. In the [canLoad example](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestRoutingGuard/can-load.spec.ts),
the setup keeps `canLoadGuard`. The test leaves the mocked `LoginService.isLoggedIn` unset,
so the guard treats the user as logged out. Mock services do not run the original constructor or field initializers.
Render the outlet, spy on the second route's lazy loader, and assert both navigation and loading:

```ts
const fixture = MockRender(RouterOutlet, {});
const router = ngMocks.get(Router);

// Observe loading without replacing the module returned by the callback.
const loader = spyOn(router.config[1], 'loadChildren').and.callThrough();

// Attempt navigation before the lazy module has been loaded.
if (fixture.ngZone) {
  const result = await fixture.ngZone.run(() =>
    router.navigateByUrl('/dashboard'),
  );
  await fixture.whenStable();

  expect(result).toEqual(false);
  expect(loader).not.toHaveBeenCalled();
  expect(router.url).toEqual('/');
}
```

Use a fresh test setup for the allowed case, set `ngMocks.get(LoginService).isLoggedIn = true`,
then assert `true`, one loader call, and the dashboard component.
Once Angular has loaded the module, subsequent navigation does not run `canLoad` again.
The lazy module in the [canLoad example](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestRoutingGuard/can-load.spec.ts)
is loaded as-is: its declarations belong to that module alone.
`MockBuilder` does not execute `loadChildren` to discover and mock its returned module.
To isolate routes inside a lazy module, pass that module to `MockBuilder` as the module under test.

Angular [deprecates `canLoad` in favor of `canMatch`](https://angular.dev/api/router/CanLoad).
`canMatch` also works on eager routes; its `false` result skips a route instead of cancelling the whole navigation.


## Functional Guards In Standalone Applications

If your app uses `bootstrapApplication()` with `provideRouter(...)`, then you can provide the standalone router setup directly in the test.
For example, a standalone app might configure the route like this:

```ts
bootstrapApplication(TargetComponent, {
  providers: [
    provideRouter([
      {
        component: LoginComponent,
        path: 'login',
      },
      {
        canActivate: [canActivateGuard],
        component: DashboardComponent,
        path: '**',
      },
    ]),
  ],
});
```

The test can pass standalone router providers to `MockBuilder` without introducing an extra `NgModule`.
Providers passed through `.provide(...)` are used as supplied. Include only the guards under test in those routes;
`.exclude(NG_MOCKS_GUARDS)` does not filter a route configuration supplied directly through `.provide(...)`.

```ts
beforeEach(() => {
  return MockBuilder(TargetComponent)
    .keep(NG_MOCKS_ROOT_PROVIDERS)
    .provide(
      provideRouter([
        {
          component: LoginComponent,
          path: 'login',
        },
        {
          canActivate: [canActivateGuard],
          component: DashboardComponent,
          path: '**',
        },
      ]),
    )
    .mock(LoginComponent)
    .mock(DashboardComponent);
});
```

Now render a standalone component with a router outlet, initialize navigation, and assert the redirected route:

```ts
const fixture = MockRender(TargetComponent);
const router = ngMocks.get(Router);

if (fixture.ngZone) {
  fixture.ngZone.run(() => router.initialNavigation());
  await fixture.whenStable();
}

expect(router.url).toEqual('/login');
```

The full runnable example is available in [the standalone routing guard example](#live-example).

## Class Guards (legacy)

If your guards are classes provided as Angular services,
the process is exactly the same as for [functional guards](#functional-guards).

For example, if the class of the guard is called `LoginGuard`,
the configuration of `TestBed` should be the next:

```ts
beforeEach(() =>
  MockBuilder(
    // first parameter
    // providing RouterModule and its dependencies
    [
      RouterModule,
      RouterTestingModule.withRoutes([]),
      NG_MOCKS_ROOT_PROVIDERS,
    ],
    
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
);
```

For a guard referenced by an injection token, keep the token used in the route, for example `.keep(LOGIN_GUARD)`.
Calling `.mock(LoginGuard)` still creates a mock provider, but `.exclude(NG_MOCKS_GUARDS)` removes that mocked guard from routes.
To retain a guard with a controlled implementation, use `.keep(LoginGuard)` and spy on its method. You can also pair `.keep(LoginGuard)` with `.provide(...)` to override its provider.
The [class canLoad regression](https://github.com/help-me-mom/ng-mocks/blob/main/tests/issue-1008/test.spec.ts)
checks both removal and a retained guard that blocks lazy loading.

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingGuard/can-activate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivate)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/can-activate.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard%3AcanActivate)
- [View the standalone example source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestRoutingGuard/standalone.spec.ts)

:::note Angular version
This NgModule snippet uses Angular 14.2–18, where components belong to an NgModule by default.
For standalone components, follow the [standalone guard setup](#functional-guards-in-standalone-applications).
:::

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestRoutingGuard/can-activate.spec.ts"
import { Location } from '@angular/common';
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
import { RouterTestingModule } from '@angular/router/testing';
import { from } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import {
  MockBuilder,
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
const sideEffectGuard: CanActivateFn = () => {
  throw new Error('An excluded guard must not run');
};

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
  // Because we want to test a canActivate guard, it means that we want to
  // test its integration with RouterModule.
  // Therefore, RouterModule and the guard should be kept,
  // and the rest of the module which defines the route can be mocked.
  // To configure RouterModule for the test,
  // RouterModule, RouterTestingModule.withRoutes([]), NG_MOCKS_ROOT_PROVIDERS
  // should be specified as the first parameter of MockBuilder (yes, with empty routes).
  // The module with routes and the guard should be specified
  // as the second parameter of MockBuilder.
  // Then `NG_MOCKS_GUARDS` should be excluded to remove all guards,
  // and `canActivateGuard` should be kept to let you test it.
  beforeEach(() => {
    return MockBuilder(
      [
        RouterModule,
        RouterTestingModule.withRoutes([]),
        NG_MOCKS_ROOT_PROVIDERS,
      ],
      TargetModule,
    )
      .exclude(NG_MOCKS_GUARDS)
      .keep(canActivateGuard);
  });

  // It is important to wait for routing to become stable.
  it('redirects to login', async () => {
    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const location = ngMocks.get(Location);

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      await fixture.whenStable(); // is needed for rendering of the current route.
    }

    // Because by default we are not logged, the guard should
    // redirect us /login page.
    expect(location.path()).toEqual('/login');
    expect(() => ngMocks.find(LoginComponent)).not.toThrow();
  });

  it('loads dashboard', async () => {
    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const location = ngMocks.get(Location);
    const loginService = ngMocks.get(LoginService);

    // Letting the guard know we have been logged in.
    loginService.isLoggedIn = true;

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
