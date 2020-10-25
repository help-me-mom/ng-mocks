import { Location } from '@angular/common';
import { Component, Injectable, NgModule, VERSION } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CanActivate, Router, RouterModule, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { from, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

// A simple service simulating login check.
// It will be mocked.
@Injectable()
class LoginService {
  public isLoggedIn = false;
}

// A guard we want to test.
@Injectable()
class LoginGuard implements CanActivate {
  protected router: Router;
  protected service: LoginService;

  constructor(router: Router, service: LoginService) {
    this.router = router;
    this.service = service;
  }

  canActivate(): boolean | Observable<boolean> {
    if (this.service.isLoggedIn) {
      return true;
    }

    return from(this.router.navigate(['/login'])).pipe(mapTo(false));
  }
}

// A simple component pretending a login form.
// It will be mocked.
@Component({
  selector: 'login',
  template: 'login',
})
class LoginComponent {}

// A simple component pretending a protected dashboard.
// It will be mocked.
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
        canActivate: [LoginGuard],
        component: DashboardComponent,
        path: '**',
      },
    ]),
  ],
  providers: [LoginService, LoginGuard],
})
class TargetModule {}

describe('TestRoutingGuard', () => {
  // Because we want to test the guard, it means that we want to
  // test its integration with RouterModule. Therefore, we pass
  // the guard as the first parameter of MockBuilder. Then, to
  // correctly satisfy its initialization, we need to pass its module
  // as the second parameter. And, the last but not the least, we
  // need to avoid mocking of RouterModule to have its routes, and to
  // add RouterTestingModule.withRoutes([]), yes yes, with empty
  // routes to have tools for testing.
  beforeEach(() => MockBuilder(LoginGuard, TargetModule).keep(RouterModule).keep(RouterTestingModule.withRoutes([])));

  // It is important to run routing tests in fakeAsync.
  it('redirects to login', fakeAsync(() => {
    if (parseInt(VERSION.major, 10) <= 6) {
      pending('Need Angular > 6');
      return;
    }

    const fixture = MockRender(RouterOutlet);
    const router: Router = TestBed.get(Router);
    const location: Location = TestBed.get(Location);

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      tick(); // is needed for rendering of the current route.
    }

    // Because by default we are not logged, the guard should
    // redirect us /login page.
    expect(location.path()).toEqual('/login');
    expect(() => ngMocks.find(fixture, LoginComponent)).not.toThrow();
  }));

  it('loads dashboard', fakeAsync(() => {
    const fixture = MockRender(RouterOutlet);
    const router: Router = TestBed.get(Router);
    const location: Location = TestBed.get(Location);
    const loginService: LoginService = TestBed.get(LoginService);

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
    expect(() => ngMocks.find(fixture, DashboardComponent)).not.toThrow();
  }));
});
