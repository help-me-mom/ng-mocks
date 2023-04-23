---
title: How to test a routing resolver in Angular application
description: Covering an Angular routing resolver with tests
sidebar_label: Routing resolver
---

If you did not read ["How to test a route"](route.md), please do it first.

When you want to test a resolver, you need to remove all other resolves and guards to avoid side effects,
to mock declarations to test the resolver in isolation,
and to keep `RouterModule` and its dependencies to assert results on `Location` and `ActivatedRoute`.

## Functional resolvers

A functional resolver is a simple function which uses `inject` to get another services and to fetch data for its route.
It's important to note that a functional resolver isn't defined as a service or a token,
and, therefore, it exists only in the definition of a route.   

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

location.go('/target');
if (fixture.ngZone) {
  fixture.ngZone.run(() => router.initialNavigation());
  tick();
}
```

Because data is provided to a particular route, we need to find its component in the `fixture` and
to extract `ActivatedRoute` from its injector.
Let's pretend that `/target` renders `TargetComponent`.

```ts
const el = ngMocks.find(fixture, TargetComponent);
const route = ngMocks.get(el, ActivatedRoute);
```

Profit, now we can assert the data the resolver has provided.

```ts
expect(route.snapshot.data).toEqual({
  data: {
    flag: false,
  },
});
```

## Class Resolver (legacy)

If your code has resolvers which a classes and angular services,
the process is exactly the same as for [functional resolvers](#functional-resolvers).

For example, if the class of the resolver is called `DataResolver`,
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
  // excluding all resolvers to avoid side effects
  .exclude(NG_MOCKS_RESOLVERS)

  // chain
  // keeping DataResolver for testing
  .keep(DataResolver)
);
```

Profit.

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestRoutingResolver/fn.spec.ts&initialpath=%3Fspec%3DTestRoutingResolver%3Afn)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingResolver/fn.spec.ts&initialpath=%3Fspec%3DTestRoutingResolver%3Afn)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestRoutingResolver/fn.spec.ts"
import { Location } from 'import { Location } from '@angular/common';
import {
  Component,
  inject,
  Injectable,
  NgModule,
} from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
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
const dataResolver: ResolveFn<Observable<{ flag: boolean }>> = () =>
  combineLatest([inject(DataService).data()]).pipe(
    map(([flag]) => ({ flag })),
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
  public routeTestRoutingFnResolver() {}
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

  // It is important to run routing tests in fakeAsync.
  it('provides data to on the route', fakeAsync(() => {
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
      tick(); // is needed for rendering of the current route.
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
      },
    });
  }));
});
```
