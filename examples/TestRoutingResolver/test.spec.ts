import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { Component, Injectable, NgModule } from '@angular/core';
import {
  ActivatedRoute,
  Resolve,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { combineLatest, from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_RESOLVERS,
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
  selector: 'route',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'route',
})
class RouteComponent {
  public routeTestRoutingResolver() {}
}

// Definition of the routing module.
@NgModule({
  declarations: [RouteComponent],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot([
      {
        component: RouteComponent,
        path: 'route',
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

describe('TestRoutingResolver:test', () => {
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
      [DataResolver, RouterModule, NG_MOCKS_ROOT_PROVIDERS],
      TargetModule,
    )
      .exclude(NG_MOCKS_RESOLVERS)
      .provide(provideLocationMocks());
  });

  // It is important to run routing tests in async.
  it('provides data to on the route', async () => {
    const fixture = MockRender(RouterOutlet, {});
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);
    const dataService: DataService =
      fixture.point.injector.get(DataService);

    // DataService has been replaced with a mock copy,
    // let's set a custom value we will assert later on.
    dataService.data = () => from([false]);

    // Let's switch to the route with the resolver.
    location.go('/route');

    // Now we can initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      await fixture.whenStable(); // is needed for rendering of the current route.
    }

    // Checking that we are on the right page.
    expect(location.path()).toEqual('/route');

    // Let's extract ActivatedRoute of the current component.
    const el = ngMocks.find(RouteComponent);
    const route: ActivatedRoute = el.injector.get(ActivatedRoute);

    // Now we can assert that it has expected data.
    expect(route.snapshot.data).toEqual({
      data: {
        flag: false,
      },
    });
  });
});
