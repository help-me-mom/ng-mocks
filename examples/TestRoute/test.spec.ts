import { Location } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

// A layout component that renders the current route.
@Component({
  selector: 'target',
  template: `
    <a routerLink="/1">1</a>
    <a routerLink="/2">2</a>
    <router-outlet></router-outlet>
  `,
})
class TargetComponent {}

// A simple component for the first route.
@Component({
  selector: 'target1',
  template: 'target1',
})
class Target1Component {}

// A simple component for the second route.
@Component({
  selector: 'target2',
  template: 'target2',
})
class Target2Component {}

// Definition of the routing module.
@NgModule({
  declarations: [Target1Component, Target2Component],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot([
      {
        component: Target1Component,
        path: '1',
      },
      {
        component: Target2Component,
        path: '2',
      },
    ]),
  ],
})
class TargetRoutingModule {}

// Definition of the main module.
@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [TargetRoutingModule],
})
class TargetModule {}

describe('TestRoute:Route', () => {
  beforeEach(() => {
    return MockBuilder(
      [
        RouterModule,
        RouterTestingModule.withRoutes([]),
        NG_MOCKS_ROOT_PROVIDERS,
      ],
      TargetModule,
    );
  });

  it('renders /1 with Target1Component', fakeAsync(() => {
    const fixture = MockRender(RouterOutlet, {});
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);

    // First we need to initialize navigation.
    location.go('/1');
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      tick(); // is needed for rendering of the current route.
    }

    // We should see Target1Component component on /1 page.
    expect(location.path()).toEqual('/1');
    expect(() => ngMocks.find(Target1Component)).not.toThrow();
  }));

  it('renders /2 with Target2Component', fakeAsync(() => {
    const fixture = MockRender(RouterOutlet, {});
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);

    // First we need to initialize navigation.
    location.go('/2');
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      tick(); // is needed for rendering of the current route.
    }

    // We should see Target2Component component on /2 page.
    expect(location.path()).toEqual('/2');
    expect(() => ngMocks.find(Target2Component)).not.toThrow();
  }));
});

describe('TestRoute:Component', () => {
  // Because we want to test navigation, it means that we want to
  // test a component with 'router-outlet' and its integration with
  // RouterModule. Therefore, we pass the component as the first
  // parameter of MockBuilder. Then, to correctly satisfy its
  // initialization, we need to pass its module as the second
  // parameter. And, the last but not the least, we need keep
  // RouterModule to have its routes, and to add
  // RouterTestingModule.withRoutes([]), yes yes, with empty routes
  // to have tools for testing.
  beforeEach(() => {
    return MockBuilder(
      [
        TargetComponent,
        RouterModule,
        RouterTestingModule.withRoutes([]),
        NG_MOCKS_ROOT_PROVIDERS,
      ],
      TargetModule,
    );
  });

  it('navigates between pages', fakeAsync(() => {
    const fixture = MockRender(TargetComponent);
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);

    // First we need to initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      tick(); // is needed for rendering of the current route.
    }

    // By default, our routes do not have a component.
    // Therefore, none of them should be rendered.
    expect(location.path()).toEqual('/');
    expect(() => ngMocks.find(Target1Component)).toThrow();
    expect(() => ngMocks.find(Target2Component)).toThrow();

    // Let's extract our navigation links.
    const links = ngMocks.findAll('a');

    // Checking where we land if we click the first link.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => {
        // To simulate a correct click we need to let the router know
        // that it is the left mouse button via setting its parameter
        // to 0 (not undefined, null or anything else).
        links[0].triggerEventHandler('click', {
          button: 0,
        });
      });
      tick(); // is needed for rendering of the current route.
    }
    // We should see Target1Component component on /1 page.
    expect(location.path()).toEqual('/1');
    expect(() => ngMocks.find(Target1Component)).not.toThrow();

    // Checking where we land if we click the second link.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => {
        // A click of the left mouse button.
        links[1].triggerEventHandler('click', {
          button: 0,
        });
      });
      tick(); // is needed for rendering of the current route.
    }
    // We should see Target2Component component on /2 page.
    expect(location.path()).toEqual('/2');
    expect(() => ngMocks.find(Target2Component)).not.toThrow();
  }));
});
