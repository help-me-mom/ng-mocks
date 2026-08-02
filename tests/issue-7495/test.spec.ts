import { Component } from '@angular/core';
import {
  ResolveFn,
  Router,
  RouterOutlet,
  provideRouter,
} from '@angular/router';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

let resolvedData: string | undefined;
const PinResolver: ResolveFn<string> = (route, state) => {
  resolvedData = `${route.routeConfig?.path}:${state.url}`;

  return resolvedData;
};

@Component({
  selector: 'issue-7495-route',
  template: 'route',
})
class RouteComponent {
  public issue7495() {}
}

@Component({
  imports: [RouterOutlet],
  selector: 'issue-7495-target',
  standalone: true,
  template: '<router-outlet></router-outlet>',
})
class TargetComponent {
  public issue7495Target() {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/7495
// A kept functional resolver used to be added as a class provider when its
// route came from provideRouter. Angular then treated the resolver's route
// arguments as constructor dependencies and raised NG0204.
describe('issue-7495', () => {
  beforeEach(() => {
    resolvedData = undefined;

    return MockBuilder(TargetComponent)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .provide(
        provideRouter([
          {
            component: RouteComponent,
            path: 'pin',
            resolve: {
              pin: PinResolver,
            },
          },
        ]),
      )
      .mock(RouteComponent)
      .keep(PinResolver);
  });

  it('keeps a functional resolver with route parameters', async () => {
    const fixture = MockRender(TargetComponent);
    const router = ngMocks.get(Router);

    if (fixture.ngZone) {
      await fixture.ngZone.run(() => router.navigateByUrl('/pin'));
      await fixture.whenStable();
    }

    expect(router.url).toEqual('/pin');
    expect(resolvedData).toEqual('pin:/pin');
  });
});
