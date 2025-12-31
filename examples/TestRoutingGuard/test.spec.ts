import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import {
  Component,
  Injectable,
  NgModule,
  VERSION,
} from '@angular/core';
import {
  CanActivate,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { from, Observable } from 'rxjs';
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
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'login',
})
class LoginComponent {
  public loginTestRoutingGuard() {}
}

// A simple component pretending a protected dashboard.
// It will be replaced with a mock copy.
@Component({
  selector: 'dashboard',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'dashboard',
})
class DashboardComponent {
  public dashboardTestRoutingGuard() {}
}

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

describe('TestRoutingGuard:test', () => {
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
      [LoginGuard, RouterModule, NG_MOCKS_ROOT_PROVIDERS],
      TargetModule,
    )
      .exclude(NG_MOCKS_GUARDS)
      .provide(provideLocationMocks());
  });

  // It is important to run routing tests in async.
  it('redirects to login', async () => {
    if (Number.parseInt(VERSION.major, 10) <= 6) {
      pending('Need Angular > 6'); // TODO pending

      return;
    }

    const fixture = MockRender(RouterOutlet, {});
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);

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
    // Set up the LoginService to be logged in BEFORE rendering
    MockInstance(LoginService, 'isLoggedIn', true);

    const fixture = MockRender(RouterOutlet, {});
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);

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
