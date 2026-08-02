import { Component, inject, Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ResolveFn,
  Router,
  RouterOutlet,
  provideRouter,
} from '@angular/router';
import { combineLatest, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class DataService {
  protected flag = true;

  public data(): Observable<boolean> {
    return from([this.flag]);
  }
}

const dataResolver: ResolveFn<
  Observable<{
    flag: boolean;
    path: string | undefined;
    url: string;
  }>
> = (route, state) =>
  combineLatest([inject(DataService).data()]).pipe(
    map(([flag]) => ({
      flag,
      path: route.routeConfig?.path,
      url: state.url,
    })),
  );

@Component({
  selector: 'standalone-route',
  standalone: true,
  template: 'route',
})
class RouteComponent {
  public routeTestRoutingStandaloneResolver() {}
}

@Component({
  imports: [RouterOutlet],
  selector: 'ng-mocks-routing-resolver',
  standalone: true,
  template: '<router-outlet></router-outlet>',
})
class TargetComponent {}

describe('TestRoutingResolver:standalone', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(RouterOutlet)
      .provide(
        provideRouter([
          {
            component: RouteComponent,
            path: 'route',
            resolve: {
              data: dataResolver,
            },
          },
        ]),
      )
      .mock(RouteComponent)
      .mock(DataService),
  );

  it('provides data on the route', async () => {
    const fixture = MockRender(TargetComponent);
    const router = ngMocks.get(Router);
    const dataService = ngMocks.get(DataService);

    dataService.data = () => from([false]);

    if (fixture.ngZone) {
      await fixture.ngZone.run(() => router.navigateByUrl('/route'));
      await fixture.whenStable();
    }

    expect(router.url).toEqual('/route');

    const el = ngMocks.find(RouteComponent);
    const route = ngMocks.findInstance(el, ActivatedRoute);

    expect(route.snapshot.data).toEqual({
      data: {
        flag: false,
        path: 'route',
        url: '/route',
      },
    });
  });
});
