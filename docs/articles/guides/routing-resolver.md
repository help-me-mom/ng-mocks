---
title: How to test a routing resolver in Angular
description: Covering an Angular routing resolver with tests
sidebar_label: Routing resolver
---

If you did not read ["How to test a route"](route.md), please do it first.

When you want to test a resolver, you need to remove all other resolves and guards to avoid side effects,
to mock declarations to test the resolver in isolation,
and to keep `RouterModule` and its dependencies to assert results on `Location` and `ActivatedRoute`.

## Angular version compatibility

The latest `ng-mocks` supports Angular 5 through Angular 22, but Angular's resolver APIs differ by version.

| Angular | Supported resolver style | Router configuration |
| ------: | ------------------------ | -------------------- |
|    5-13 | Class implementing `Resolve<T>` | `RouterModule` |
|   14-22 | Class implementing `Resolve<T>` or `ResolveFn<T>` | `RouterModule` |
|   14-22 | Class implementing `Resolve<T>` or `ResolveFn<T>` | Standalone components with `provideRouter` |

Use a [class resolver](#class-resolvers-angular-5-22) for code which has to run on Angular 5-13.
For Angular 14-22, use the style already used by the application.

Angular creates `ActivatedRouteSnapshot` and `RouterStateSnapshot` for every navigation.
Do not provide or mock them in the testing module.
Instead, mock the services which the resolver obtains through its constructor or `inject`.

## Functional resolvers (Angular 14-22)

A functional resolver is a function which can use `inject` to get services and fetch data for its route.
It's important to note that a functional resolver isn't defined as a service or a token,
and, therefore, it exists only in the definition of a route.

The setup depends on where the routes are declared.

### Routes declared by an NgModule

Let's assume, the resolver is called `dataResolver` and the module with its route `TargetModule`.

To configure `TestBed` as described above, the code can be next:

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
  // excluding all resolvers to avoid side effects
  .exclude(NG_MOCKS_RESOLVERS)

  // chain
  // keeping dataResolver for testing
  .keep(dataResolver)
);
```

`.exclude(NG_MOCKS_RESOLVERS)` removes every resolver from the mocked route definitions.
Consequently, `.keep(dataResolver)` is required here to restore the resolver under test.

### Standalone routes with provideRouter

When a standalone test supplies its routes directly with `provideRouter`, the route definition already contains the real resolver.
Do not add the resolver as a root provider and do not call `.keep(dataResolver)`.

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    .keep(NG_MOCKS_ROOT_PROVIDERS)
    .keep(RouterOutlet)
    .provide(
      provideRouter([
        {
          component: RouteComponent,
          path: 'route',
          resolve: {
            data: dataResolver,
          },
        },
      ]),
    )
    .mock(RouteComponent)
    .mock(DataService),
);
```

`ResolveFn` receives `ActivatedRouteSnapshot` and `RouterStateSnapshot` as invocation arguments.
They are not constructor dependencies, so a functional resolver must never be registered as a class provider.

To test the resolver we need to render `RouterOutlet`.

```ts
const fixture = MockRender(RouterOutlet, {}); // {} is required to leave inputs untouched.
```

Additionally, we also need to properly customize mocked services if the resolver is using them to fetch data.

```ts
const dataService = ngMocks.get(DataService);
dataService.data = () => from([false]);
```

The next step is to go to the route where the resolver is, and to trigger initialization of the router.

```ts
const location = ngMocks.get(Location);
const router = ngMocks.get(Router);

location.go('/route');
if (fixture.ngZone) {
  fixture.ngZone.run(() => router.initialNavigation());
  await fixture.whenStable();
}
```

Because data is provided to a particular route, we need to find its component in the `fixture` and
to extract `ActivatedRoute` from its injector.
Let's pretend that `/route` renders `RouteComponent`.

```ts
const el = ngMocks.find(RouteComponent);
const route = ngMocks.findInstance(el, ActivatedRoute);
```

Profit, now we can assert the data the resolver has provided.

```ts
expect(route.snapshot.data).toEqual({
  data: {
    flag: false,
    path: 'route',
    url: '/route',
  },
});
```

## Class resolvers (Angular 5-22)

Class resolvers are the available pattern on Angular 5-13 and remain supported on Angular 14-22.
If your code has resolver classes registered as Angular services,
the NgModule process is the same as for [functional resolvers](#routes-declared-by-an-ngmodule).

For example, if the class of the resolver is called `DataResolver`,
the configuration of `TestBed` should be the next:

```ts
@Injectable()
class DataResolver implements Resolve<Data> {
  constructor(private readonly dataService: DataService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ) {
    return this.dataService.data(route, state);
  }
}
```

The snapshots are method arguments supplied by the router.
Only `DataService` is a constructor dependency supplied by dependency injection.

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
  // excluding all resolvers to avoid side effects
  .exclude(NG_MOCKS_RESOLVERS)

  // chain
  // keeping DataResolver for testing
  .keep(DataResolver)
);
```

Profit.

## Live example

- [NgModule functional resolver source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestRoutingResolver/fn.spec.ts) (Angular 14-22)
- [Standalone functional resolver source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestRoutingResolver/standalone.spec.ts) (Angular 14-22)
- [Class resolver source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestRoutingResolver/test.spec.ts) (Angular 5-22)
- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestRoutingResolver/fn.spec.ts&initialpath=%3Fspec%3DTestRoutingResolver%3Afn)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingResolver/fn.spec.ts&initialpath=%3Fspec%3DTestRoutingResolver%3Afn)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestRoutingResolver/fn.spec.ts"
import { Location } from '@angular/common';
import {
  Component,
  inject,
  Injectable,
  NgModule,
} from '@angular/core';
import {
  ActivatedRoute,
  ResolveFn,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { combineLatest, from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_GUARDS,
  NG_MOCKS_RESOLVERS,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

// A simple service simulating a data request.
@Injectable()
class DataService {
  protected flag = true;

  public data(): Observable<boolean> {
    return from([this.flag]);
  }
}

// A resolver we want to test.
const dataResolver: ResolveFn<
  Observable<{
    flag: boolean;
    path: string | undefined;
    url: string;
  }>
> = (route, state) =>
  combineLatest([inject(DataService).data()]).pipe(
    map(([flag]) => ({
      flag,
      path: route.routeConfig?.path,
      url: state.url,
    })),
  );

// A resolver we want to ignore.
const sideEffectResolver: ResolveFn<
  Observable<{ mock: boolean }>
> = () => of({ mock: true });

// A dummy component.
// It will be replaced with a mock copy.
@Component({
  selector: 'route',
  template: 'route',
})
class RouteComponent {
}

// Definition of the routing module.
@NgModule({
  declarations: [RouteComponent],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot([
      {
        component: RouteComponent,
        path: 'route',
        resolve: {
          data: dataResolver,
          mock: sideEffectResolver,
        },
      },
    ]),
  ],
  providers: [DataService],
})
class TargetModule {}

describe('TestRoutingResolver:fn', () => {
  // Because we want to test a resolver, it means that we want to
  // test its integration with RouterModule.
  // Therefore, RouterModule and the resolver should be kept,
  // and the rest of the module which defines the route can be mocked.
  // To configure RouterModule for the test,
  // RouterModule, RouterTestingModule.withRoutes([]), NG_MOCKS_ROOT_PROVIDERS
  // should be specified as the first parameter of MockBuilder (yes, with empty routes).
  // The module with routes and the resolver should be specified
  // as the second parameter of MockBuilder.
  // Then `NG_MOCKS_RESOLVERS` should be excluded to remove all resolvers,
  // and `dataResolver` should be kept to let you test it.
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
      .exclude(NG_MOCKS_RESOLVERS)
      .keep(dataResolver);
  });

  // It is important to run routing tests in async.
  it('provides data to on the route', async () => {
    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const location = ngMocks.get(Location);
    const dataService = ngMocks.get(DataService);

    // DataService has been replaced with a mock copy,
    // let's set a custom value we will assert later on.
    dataService.data = () => from([false]);

    // Let's switch to the route with the resolver.
    location.go('/route');

    // Now we can initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      await fixture.whenStable(); // is needed for rendering of the current route.
    }

    // Checking that we are on the right page.
    expect(location.path()).toEqual('/route');

    // Let's extract ActivatedRoute of the current component.
    const el = ngMocks.find(RouteComponent);
    const route = ngMocks.findInstance(el, ActivatedRoute);

    // Now we can assert that it has expected data.
    expect(route.snapshot.data).toEqual({
      data: {
        flag: false,
        path: 'route',
        url: '/route',
      },
    });
  });
});
```
