---
title: How to test a routing guard in Angular application
description: Covering an Angular routing guard with tests
sidebar_label: Routing guard
---

If you have not read ["How to test a route"](route.md), please do it first.

To test a guard means that we need to mock everything except the guard and `RouterModule`.
But, what if we have several guards? If we mocked them they would block routes due to falsy returns of their mocked methods.
**To skip guards in angular tests `ng-mocks` provides `NG_MOCKS_GUARDS` token**, we should pass it into `.exclude`, then all other guards will be
excluded from `TestBed` and we can be sure, that we are **testing only the guard we want**.

```ts
beforeEach(() =>
  MockBuilder(
    // Things to keep and export.
    [
      LoginGuard,
      RouterModule,
      RouterTestingModule.withRoutes([]),
      NG_MOCKS_ROOT_PROVIDERS,
    ], 
    // Things to mock
    TargetModule,
  ).exclude(NG_MOCKS_GUARDS)
);
```

Let's assume that we have `LoginGuard` that redirects all routes to `/login` if a user is not logged in.
It means when we initialize the router we should end up on `/login`. So let's do that.

```ts
if (fixture.ngZone) {
  fixture.ngZone.run(() => router.initialNavigation());
  tick();
}
```

Now we can assert the current state.

```ts
expect(location.path()).toEqual('/login');
expect(() => ngMocks.find(fixture, LoginComponent)).not.toThrow();
```

## Live example

- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestRoutingGuard/test.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard)
- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestRoutingGuard/test.spec.ts&initialpath=%3Fspec%3DTestRoutingGuard)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestRoutingGuard/test.spec.ts"
import { Location } from '@angular/common';
import {
  Component,
  Injectable,
  NgModule,
} from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import {
  CanActivate,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { from, Observable } from 'rxjs';
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
@Injectable()
class LoginGuard implements CanActivate {
  public constructor(
    protected router: Router,
    protected service: LoginService,
  ) {}

  public canActivate(): boolean | Observable<boolean> {
    if (this.service.isLoggedIn) {
      return true;
    }

    return from(this.router.navigate(['/login'])).pipe(mapTo(false));
  }
}

// A side guard, when it has been replaced with its mock copy
// it blocks all routes, because `canActivate` returns undefined.
@Injectable()
class MockGuard implements CanActivate {
  protected readonly allow = true;

  public canActivate(): boolean {
    return this.allow;
  }
}

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
        canActivate: [MockGuard, 'canActivateToken'],
        component: LoginComponent,
        path: 'login',
      },
      {
        canActivate: [LoginGuard, MockGuard, 'canActivateToken'],
        component: DashboardComponent,
        path: '**',
      },
    ]),
  ],
  providers: [
    LoginService,
    LoginGuard,
    MockGuard,
    {
      provide: 'canActivateToken',
      useValue: () => true,
    },
  ],
})
class TargetModule {}

describe('TestRoutingGuard', () => {
  // Because we want to test the guard, it means that we want to
  // test its integration with RouterModule. Therefore, we pass
  // the guard as the first parameter of MockBuilder. Then, to
  // correctly satisfy its initialization, we need to pass its module
  // as the second parameter. The next step is to avoid mocking of
  // RouterModule to have its routes, and to add
  // RouterTestingModule.withRoutes([]), yes yes, with empty routes
  // to have tools for testing. And the last thing is to exclude
  // `NG_MOCKS_GUARDS` to remove all other guards.
  beforeEach(() => {
    return MockBuilder(
      [
        LoginGuard,
        RouterModule,
        RouterTestingModule.withRoutes([]),
        NG_MOCKS_ROOT_PROVIDERS,
      ],
      TargetModule,
    ).exclude(NG_MOCKS_GUARDS);
  });

  // It is important to run routing tests in fakeAsync.
  it('redirects to login', fakeAsync(() => {
    const fixture = MockRender(RouterOutlet, {});
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      tick(); // is needed for rendering of the current route.
    }

    // Because by default we are not logged, the guard should
    // redirect us /login page.
    expect(location.path()).toEqual('/login');
    expect(() => ngMocks.find(LoginComponent)).not.toThrow();
  }));

  it('loads dashboard', fakeAsync(() => {
    const fixture = MockRender(RouterOutlet, {});
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);
    const loginService: LoginService =
      fixture.point.injector.get(LoginService);

    // Letting the guard know we have been logged in.
    loginService.isLoggedIn = true;

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      tick(); // is needed for rendering of the current route.
    }

    // Because now we are logged in, the guard should let us land on
    // the dashboard.
    expect(location.path()).toEqual('/');
    expect(() => ngMocks.find(DashboardComponent)).not.toThrow();
  }));
});
```
