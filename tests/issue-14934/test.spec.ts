import { Component, Injectable, NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  DefaultTitleStrategy,
  Router,
  RouterModule,
  RouterOutlet,
  RouterStateSnapshot,
  TitleStrategy,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import {
  isMockOf,
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

let applicationConstructions = 0;

@Injectable({ providedIn: 'root' })
class ApplicationService {
  public constructor() {
    applicationConstructions += 1;
  }

  public read(): string {
    return 'real application';
  }
}

@Component({
  selector: 'issue-14934-first',
  standalone: false,
  template: '<span>first route</span>{{ service.read() }}',
})
class FirstComponent {
  public constructor(public readonly service: ApplicationService) {}
}

@Component({
  selector: 'issue-14934-second',
  standalone: false,
  template: 'second route',
})
class SecondComponent {}

@NgModule({
  declarations: [FirstComponent, SecondComponent],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot([
      {
        component: FirstComponent,
        path: 'first',
        title: 'First title',
      },
      {
        component: SecondComponent,
        path: 'second',
        title: 'Second title',
      },
    ]),
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14934
// The runner's default TitleStrategy mock must not replace kept router root providers.
describe('issue-14934', () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
    document.title = 'Original title';
    applicationConstructions = 0;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('keeps the real title strategy and explicit application mocks across navigation', async () => {
    await MockBuilder(
      [
        RouterModule,
        RouterTestingModule.withRoutes([]),
        FirstComponent,
        SecondComponent,
      ],
      TargetModule,
    )
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(ApplicationService);

    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const strategy = ngMocks.get(TitleStrategy);
    const title = ngMocks.get(Title);
    const writeTitle =
      typeof jest === 'undefined'
        ? spyOn(title, 'setTitle').and.callThrough()
        : jest.spyOn(title, 'setTitle');

    expect(strategy instanceof DefaultTitleStrategy).toBe(true);
    expect(isMockOf(strategy, DefaultTitleStrategy)).toBe(false);

    const first = await (fixture.ngZone
      ? fixture.ngZone.run(() => router.navigateByUrl('/first'))
      : router.navigateByUrl('/first'));
    await fixture.whenStable();
    fixture.detectChanges();

    const application = ngMocks.get(ApplicationService);

    expect(first).toBe(true);
    expect(router.url).toBe('/first');
    expect(
      ngMocks.find(FirstComponent).nativeElement.textContent,
    ).toBe('first route');
    expect(ngMocks.find(SecondComponent, null)).toBeNull();
    expect(ngMocks.findInstance(FirstComponent).service).toBe(
      application,
    );
    expect(isMockOf(application, ApplicationService)).toBe(true);
    expect(application.read()).toBeUndefined();
    expect(applicationConstructions).toBe(0);
    expect(writeTitle).toHaveBeenCalledTimes(1);
    expect(writeTitle).toHaveBeenCalledWith('First title');
    expect(title.getTitle()).toBe('First title');
    expect(document.title).toBe('First title');

    const second = await (fixture.ngZone
      ? fixture.ngZone.run(() => router.navigateByUrl('/second'))
      : router.navigateByUrl('/second'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(second).toBe(true);
    expect(router.url).toBe('/second');
    expect(
      ngMocks.find(SecondComponent).nativeElement.textContent,
    ).toBe('second route');
    expect(ngMocks.find(FirstComponent, null)).toBeNull();
    expect(ngMocks.get(TitleStrategy)).toBe(strategy);
    expect(ngMocks.get(ApplicationService)).toBe(application);
    expect(applicationConstructions).toBe(0);
    expect(writeTitle).toHaveBeenCalledTimes(2);
    expect(writeTitle).toHaveBeenCalledWith('Second title');
    expect(title.getTitle()).toBe('Second title');
    expect(document.title).toBe('Second title');
  });

  it('uses an explicit strategy customization without writing the document title', async () => {
    const snapshots: RouterStateSnapshot[] = [];
    const customization = {
      updateTitle: (snapshot: RouterStateSnapshot) => {
        snapshots.push(snapshot);
      },
    };

    await MockBuilder(
      [
        RouterModule,
        RouterTestingModule.withRoutes([]),
        FirstComponent,
        SecondComponent,
      ],
      TargetModule,
    )
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(ApplicationService)
      .mock(TitleStrategy, customization);

    const fixture = MockRender(RouterOutlet, {});
    const router = ngMocks.get(Router);
    const strategy = ngMocks.get(TitleStrategy);
    const title = ngMocks.get(Title);
    const writeTitle =
      typeof jest === 'undefined'
        ? spyOn(title, 'setTitle').and.callThrough()
        : jest.spyOn(title, 'setTitle');

    expect(snapshots).toEqual([]);

    const result = await (fixture.ngZone
      ? fixture.ngZone.run(() => router.navigateByUrl('/first'))
      : router.navigateByUrl('/first'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(result).toBe(true);
    expect(router.url).toBe('/first');
    expect(
      ngMocks.find(FirstComponent).nativeElement.textContent,
    ).toBe('first route');
    expect(ngMocks.find(SecondComponent, null)).toBeNull();
    expect(
      isMockOf(ngMocks.get(ApplicationService), ApplicationService),
    ).toBe(true);
    expect(applicationConstructions).toBe(0);
    expect(snapshots.length).toBe(1);
    expect(snapshots[0]).toBe(router.routerState.snapshot);
    expect(snapshots[0].url).toBe('/first');
    expect(strategy.updateTitle).toBe(customization.updateTitle);
    expect(ngMocks.get(TitleStrategy)).toBe(strategy);
    expect(writeTitle).not.toHaveBeenCalled();
    expect(title.getTitle()).toBe('Original title');
    expect(document.title).toBe('Original title');
  });
});
