import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import {
  Component,
  inject,
  Injectable,
  NgModule,
  VERSION,
} from '@angular/core';
import {
  CanLoadFn,
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
// It will be replaced with it's mock copy.
@Injectable()
class LoginService {
  public isLoggedIn = false;
}

// The canLoad guard we want to test.
const canLoadGuard: CanLoadFn = (route, segments) => {
  if (route && segments && inject(LoginService).isLoggedIn) {
    return true;
  }

  return from(inject(Router).navigate(['/login'])).pipe(mapTo(false));
};

// Another canLoad guard like in a real world example,
// which should be removed from testing to avoid side effects on the route.
const sideEffectCanLoadGuard: CanLoadFn = () => false;

// A simple component pretending to be a login form.
// It will be replaced with a mock copy.
@Component({
  selector: 'login',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'login',
})
class LoginComponent {}

// A simple component pretending to be a protected dashboard.
// It will be replaced with a mock copy.
@Component({
  selector: 'dashboard',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'dashboard',
})
class DashboardComponent {}

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    RouterModule.forChild([
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ]),
  ],
  exports: [],
})
class DashboardModule {}

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
        canLoad: [canLoadGuard, sideEffectCanLoadGuard],
        path: '',
        loadChildren: () => DashboardModule,
      },
    ]),
  ],
  providers: [LoginService],
})
class TargetModule {}

describe('TestRoutingGuard:canLoad', () => {
  // Because we want to test a canLoad guard, it means that we want to
  // test it's integration with RouterModule.
  // Therefore, RouterModule and guard should be kept,
  // and the rest of the module which defines the route can be mocked.
  // To configure the RouterModule for the test,
  // RouterModule, RouterTestingModule.withRoutes([]), NG_MOCKS_ROOT_PROVIDERS
  // should be specified as the first parameter of MockBuilder (with empty routes).
  // The module with routes and the guard should be specified
  // as the second parameter of MockBuilder.
  // Then NG_MOCKS_GUARDS should be excluded to remove all guards,
  // and canLoadGuard should be kept to let you test it.
  beforeEach(() => {
    return MockBuilder(
      [RouterModule, NG_MOCKS_ROOT_PROVIDERS],
      [TargetModule],
    )
      .exclude(NG_MOCKS_GUARDS)
      .keep(canLoadGuard)
      .provide(provideLocationMocks());
  });

  it('redirects to login', async () => {
    if (Number.parseInt(VERSION.major, 10) < 7) {
      pending('Need Angular  7+'); // TODO pending

      return;
    }

    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const location = ngMocks.get(Location);

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      // is needed to wait until routing is finished.
      await fixture.whenStable();
    }

    // Because by default we are not logged, the guard should
    // redirect us /login page.
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
      // is needed to wait until routing is finished.
      await fixture.whenStable();
    }

    // Because now we are logged in, the guard should let us land on
    // the dashboard.
    expect(location.path()).toEqual('/dashboard');
    expect(() => ngMocks.find(DashboardComponent)).not.toThrow();
  });
});
