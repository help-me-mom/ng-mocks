import { Location } from '@angular/common';
import {
  Component,
  inject,
  Injectable,
  NgModule,
} from '@angular/core';
import {
  CanLoadFn,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

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

// The canLoad guard we want to test.
const canLoadGuard: CanLoadFn = (route, segments) => {
  return !!(route && segments && inject(LoginService).isLoggedIn);
};

// Another canLoad guard like in a real world example,
// which should be removed from testing to avoid side effects on the route.
const sideEffectCanLoadGuard: CanLoadFn = () => {
  throw new Error('An excluded guard must not run');
};

// A simple component pretending to be a login form.
// It will be replaced with a mock copy.
@Component({
  selector: 'login',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'login',
})
class LoginComponent {
  public loginTestRoutingGuardCanLoad() {}
}

// A simple component pretending to be a protected dashboard.
// Angular loads it from the lazy module.
@Component({
  selector: 'dashboard',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'dashboard',
})
class DashboardComponent {
  public dashboardTestRoutingGuardCanLoad() {}
}

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
})
class DashboardModule {}

// The lazy module is loaded as-is by Angular. Its component is declared only
// in DashboardModule; it is not part of the mocked root module.
// Definition of the routing module.
@NgModule({
  declarations: [LoginComponent],
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
  // test its integration with RouterModule.
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
      [
        RouterModule,
        RouterTestingModule.withRoutes([]),
        NG_MOCKS_ROOT_PROVIDERS,
      ],
      [TargetModule],
    )
      .exclude(NG_MOCKS_GUARDS)
      .keep(canLoadGuard);
  });

  it('blocks dashboard and opens login', async () => {
    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const loader =
      typeof jest === 'undefined'
        ? spyOn(router.config[1], 'loadChildren').and.callThrough()
        : jest.spyOn(router.config[1], 'loadChildren');
    const location = ngMocks.get(Location);

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      const result = await fixture.ngZone.run(() =>
        router.navigateByUrl('/dashboard'),
      );
      // is needed to wait until routing is finished.
      await fixture.whenStable();

      expect(result).toEqual(false);
      expect(loader).not.toHaveBeenCalled();
      expect(router.url).toEqual('/');

      await fixture.ngZone.run(() => router.navigateByUrl('/login'));
      await fixture.whenStable();
    }

    // Because by default we are not logged, the guard should
    // prevent loading the dashboard module, but still let us open /login.
    expect(location.path()).toEqual('/login');
    expect(() => ngMocks.find(LoginComponent)).not.toThrow();
    expect(() => ngMocks.find(DashboardComponent)).toThrow();
  });

  it('loads dashboard', async () => {
    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const loader =
      typeof jest === 'undefined'
        ? spyOn(router.config[1], 'loadChildren').and.callThrough()
        : jest.spyOn(router.config[1], 'loadChildren');
    const location = ngMocks.get(Location);
    const loginService = ngMocks.get(LoginService);

    // Letting the guard know we have been logged in.
    loginService.isLoggedIn = true;

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      const result = await fixture.ngZone.run(() =>
        router.navigateByUrl('/dashboard'),
      );
      // is needed to wait until routing is finished.
      await fixture.whenStable();

      expect(result).toEqual(true);
      expect(loader).toHaveBeenCalledTimes(1);
    }

    // Because now we are logged in, the guard should let us land on
    // the dashboard.
    expect(location.path()).toEqual('/dashboard');
    expect(() => ngMocks.find(DashboardComponent)).not.toThrow();
  });
});
