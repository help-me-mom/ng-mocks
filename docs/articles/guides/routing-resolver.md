---
title: How to test a routing resolver in Angular application
description: Covering an Angular routing resolver with tests
sidebar_label: Routing resolver
---

If you did not read ["How to test a route"](route.md), please do it first.

When we want to test a resolver it means we need to mock everything except the resolver and `RouterModule`.
Optionally, we can disable guards to avoid influence of their mocked methods returning falsy values and blocking routes.

```ts
beforeEach(() =>
  MockBuilder(
    // Things to keep and export.
    [
      DataResolver,
      RouterModule,
      RouterTestingModule.withRoutes([]),
      NG_MOCKS_ROOT_PROVIDERS,
    ],
    // Things to mock.
    TargetModule,
  ).exclude(NG_MOCKS_GUARDS)
);
```

To test the resolver we need to render `RouterOutlet`.

```ts
const fixture = MockRender(RouterOutlet, {}); // {} is required to leave inputs untouched.
```

Additionally, we also need to properly customize mocked services if the resolver is using them to fetch data.

```ts
const dataService = TestBed.get(DataService);

dataService.data = () => from([false]);
```

The next step is to go to the route where the resolver is, and to trigger initialization of the router.

```ts
const location = TestBed.get(Location);
const router = TestBed.get(Router);

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
const route: ActivatedRoute = el.injector.get(ActivatedRoute);
```

Profit, now we can assert the data the resolver has provided.

```ts
expect(route.snapshot.data).toEqual({
  data: {
    flag: false,
  },
});
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestRoutingResolver/test.spec.ts&initialpath=%3Fspec%3DTestRoutingResolver)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingResolver/test.spec.ts&initialpath=%3Fspec%3DTestRoutingResolver)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestRoutingResolver/test.spec.ts"
import { Location } from '@angular/common';
import { Component, Injectable, NgModule } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRoute,
  Resolve,
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
@Injectable()
class DataResolver implements Resolve<{ flag: boolean }> {
  public constructor(protected service: DataService) {}

  public resolve() {
    return combineLatest([this.service.data()]).pipe(
      map(([flag]) => ({ flag })),
    );
  }
}

// A resolver we want to ignore.
@Injectable()
class MockResolver implements Resolve<{ mock: boolean }> {
  protected mock = true;

  public resolve() {
    return of({ mock: this.mock });
  }
}

// A dummy component.
// It will be replaced with a mock copy.
@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent {}

// Definition of the routing module.
@NgModule({
  declarations: [TargetComponent],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot([
      {
        component: TargetComponent,
        path: 'target',
        resolve: {
          data: DataResolver,
          mock: MockResolver,
        },
      },
    ]),
  ],
  providers: [DataService, DataResolver, MockResolver],
})
class TargetModule {}

describe('TestRoutingResolver', () => {
  // Because we want to test the resolver, it means that we want to
  // test its integration with RouterModule. Therefore, we pass
  // the resolver as the first parameter of MockBuilder. Then, to
  // correctly satisfy its initialization, we need to pass its module
  // as the second parameter. And, the last but not the least, we
  // need to keep RouterModule to have its routes, and to
  // add RouterTestingModule.withRoutes([]), yes yes, with empty
  // routes to have tools for testing.
  beforeEach(() => {
    return MockBuilder(
      [
        DataResolver,
        RouterModule,
        RouterTestingModule.withRoutes([]),
        NG_MOCKS_ROOT_PROVIDERS,
      ],
      TargetModule,
    );
  });

  // It is important to run routing tests in fakeAsync.
  it('provides data to on the route', fakeAsync(() => {
    const fixture = MockRender(RouterOutlet, {});
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);
    const dataService: DataService =
      fixture.point.injector.get(DataService);

    // DataService has been replaced with a mock copy,
    // let's set a custom value we will assert later on.
    dataService.data = () => from([false]);

    // Let's switch to the route with the resolver.
    location.go('/target');

    // Now we can initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      tick(); // is needed for rendering of the current route.
    }

    // Checking that we are on the right page.
    expect(location.path()).toEqual('/target');

    // Let's extract ActivatedRoute of the current component.
    const el = ngMocks.find(TargetComponent);
    const route: ActivatedRoute = el.injector.get(ActivatedRoute);

    // Now we can assert that it has expected data.
    expect(route.snapshot.data).toEqual(
      jasmine.objectContaining({
        data: {
          flag: false,
        },
      }),
    );
  }));
});
```
