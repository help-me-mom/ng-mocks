import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import {
  Component,
  inject,
  Injectable,
  NgModule,
} from '@angular/core';
import {
  ActivatedRoute,
  ResolveFn,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { combineLatest, from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_GUARDS,
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
const dataResolver: ResolveFn<Observable<{ flag: boolean }>> = () =>
  combineLatest([inject(DataService).data()]).pipe(
    map(([flag]) => ({ flag })),
  );

// A resolver we want to ignore.
const sideEffectResolver: ResolveFn<
  Observable<{ mock: boolean }>
> = () => of({ mock: true });

// A dummy component.
// It will be replaced with a mock copy.
@Component({
  selector: 'route',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'route',
})
class RouteComponent {
  public routeTestRoutingFnResolver() {}
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
          data: dataResolver,
          mock: sideEffectResolver,
        },
      },
    ]),
  ],
  providers: [DataService],
})
class TargetModule {}

describe('TestRoutingResolver:fn', () => {
  // Because we want to test a resolver, it means that we want to
  // test its integration with RouterModule.
  // Therefore, RouterModule and the resolver should be kept,
  // and the rest of the module which defines the route can be mocked.
  // To configure RouterModule for the test,
  // RouterModule, RouterTestingModule.withRoutes([]), NG_MOCKS_ROOT_PROVIDERS
  // should be specified as the first parameter of MockBuilder (yes, with empty routes).
  // The module with routes and the resolver should be specified
  // as the second parameter of MockBuilder.
  // Then `NG_MOCKS_RESOLVERS` should be excluded to remove all resolvers,
  // and `dataResolver` should be kept to let you test it.
  beforeEach(() => {
    return MockBuilder(
      [
        RouteComponent, // not necessary, added for coverage
        RouterModule,
        NG_MOCKS_ROOT_PROVIDERS,
      ],
      TargetModule,
    )
      .exclude(NG_MOCKS_GUARDS)
      .exclude(NG_MOCKS_RESOLVERS)
      .keep(dataResolver)
      .provide(provideLocationMocks());
  });

  // It is important to run routing tests in async.
  it('provides data to on the route', async () => {
    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const location = ngMocks.get(Location);
    const dataService = ngMocks.get(DataService);

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
    const route = ngMocks.findInstance(el, ActivatedRoute);

    // Now we can assert that it has expected data.
    expect(route.snapshot.data).toEqual({
      data: {
        flag: false,
      },
    });
  });
});
