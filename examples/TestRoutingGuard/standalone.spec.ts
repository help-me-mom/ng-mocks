import {
  Component,
  inject,
  Injectable,
  VERSION,
} from '@angular/core';
import {
  CanActivateFn,
  Router,
  RouterModule,
  provideRouter,
} from '@angular/router';
import { from } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

// A simple service simulating login check.
// It will be replaced with its mock copy.
@Injectable({
  providedIn: 'root',
})
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

// A simple component pretending a login form.
// It will be replaced with a mock copy.
@Component({
  selector: 'login',
  standalone: true,
  template: 'login',
})
class LoginComponent {}

// A simple component pretending a protected dashboard.
// It will be replaced with a mock copy.
@Component({
  selector: 'dashboard',
  standalone: true,
  template: 'dashboard',
})
class DashboardComponent {}

@Component({
  imports: [RouterModule],
  standalone: true,
  template: '<router-outlet></router-outlet>',
})
class TargetComponent {}

describe('TestRoutingGuard:standalone', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

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

  it('redirects to login', async () => {
    const fixture = MockRender(TargetComponent);
    const router = ngMocks.get(Router);

    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      await fixture.whenStable();
    }

    expect(router.url).toEqual('/login');
  });
});
