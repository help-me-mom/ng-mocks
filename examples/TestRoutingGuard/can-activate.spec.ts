import { Location } from '@angular/common';
import {
  Component,
  inject,
  Injectable,
  NgModule,
  VERSION,
} from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
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
const sideEffectGuard: CanActivateFn = () => false;

// A simple component pretending a login form.
// It will be replaced with a mock copy.
@Component({
  selector: 'login',
  template: 'login',
})
class LoginComponent {
  public loginTestRoutingGuardCanActivate() {}
}

// A simple component pretending a protected dashboard.
// It will be replaced with a mock copy.
@Component({
  selector: 'dashboard',
  template: 'dashboard',
})
class DashboardComponent {
  public dashboardTestRoutingGuardCanActivate() {}
}

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

  // It is important to run routing tests in fakeAsync.
  it('redirects to login', fakeAsync(() => {
    if (Number.parseInt(VERSION.major, 10) < 7) {
      pending('Need Angular 7+');

      return;
    }

    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const location = ngMocks.get(Location);

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
    const router = ngMocks.get(Router);
    const location = ngMocks.get(Location);
    const loginService = ngMocks.get(LoginService);

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
