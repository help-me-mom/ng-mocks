import { Location } from '@angular/common';
import { Component, Injectable, NgModule } from '@angular/core';
import {
  CanLoad,
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

@Injectable()
class Issue1008Guard implements CanLoad {
  public canLoad(): boolean {
    throw new Error('The excluded canLoad guard must not run');
  }
}

@Component({
  selector: 'issue-1008-lazy',
  ['standalone' as never]: false,
  template: 'lazy destination',
})
class LazyComponent {}

@NgModule({
  declarations: [LazyComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: LazyComponent }]),
  ],
})
class LazyModule {}

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'lazy',
        canLoad: [Issue1008Guard],
        loadChildren: () => Promise.resolve(LazyModule),
      },
    ]),
  ],
  providers: [Issue1008Guard],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/1008
// Mocking a class guard leaves its method returning undefined. Excluding guards
// must remove canLoad from the route before Angular attempts to load its module.
describe('issue-1008', () => {
  it('loads a lazy module without calling its excluded class guard', async () => {
    await MockBuilder(
      [
        RouterModule,
        RouterTestingModule.withRoutes([]),
        NG_MOCKS_ROOT_PROVIDERS,
      ],
      TargetModule,
    ).exclude(NG_MOCKS_GUARDS);

    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const loader =
      typeof jest === 'undefined'
        ? spyOn(router.config[0], 'loadChildren').and.callThrough()
        : jest.spyOn(
            // Older Angular versions also allow legacy string loaders.
            router.config[0] as {
              loadChildren: () => Promise<typeof LazyModule>;
            },
            'loadChildren',
          );

    expect(router.config[0].canLoad).toEqual([]);
    const result = await (fixture.ngZone
      ? fixture.ngZone.run(() => router.navigateByUrl('/lazy'))
      : router.navigateByUrl('/lazy'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(result).toEqual(true);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(ngMocks.get(Location).path()).toEqual('/lazy');
    expect(
      ngMocks.find(LazyComponent).nativeElement.textContent,
    ).toEqual('lazy destination');
  });

  it('keeps a selected class guard and prevents lazy loading when it rejects navigation', async () => {
    await MockBuilder(
      [
        RouterModule,
        RouterTestingModule.withRoutes([]),
        NG_MOCKS_ROOT_PROVIDERS,
      ],
      TargetModule,
    )
      .exclude(NG_MOCKS_GUARDS)
      .keep(Issue1008Guard);

    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const loader =
      typeof jest === 'undefined'
        ? spyOn(router.config[0], 'loadChildren').and.callThrough()
        : jest.spyOn(
            // Older Angular versions also allow legacy string loaders.
            router.config[0] as {
              loadChildren: () => Promise<typeof LazyModule>;
            },
            'loadChildren',
          );

    const guard =
      typeof jest === 'undefined'
        ? spyOn(
            ngMocks.get(Issue1008Guard),
            'canLoad',
          ).and.returnValue(false)
        : jest
            .spyOn(ngMocks.get(Issue1008Guard), 'canLoad')
            .mockReturnValue(false);

    expect(router.config[0].canLoad).toEqual([Issue1008Guard]);
    const result = await (fixture.ngZone
      ? fixture.ngZone.run(() => router.navigateByUrl('/lazy'))
      : router.navigateByUrl('/lazy'));
    await fixture.whenStable();

    expect(result).toEqual(false);
    expect(guard).toHaveBeenCalledTimes(1);
    expect(loader).not.toHaveBeenCalled();
    expect(ngMocks.find(LazyComponent, null)).toBeNull();
  });
});
