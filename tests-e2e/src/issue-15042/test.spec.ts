import { MediaMatcher } from '@angular/cdk/layout';
import { Component, inject, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButton } from '@angular/material/button';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import {
  isMockOf,
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class ApplicationService {
  public static constructed = 0;

  public constructor() {
    ApplicationService.constructed += 1;
  }

  public label(): string {
    return 'real application';
  }
}

@Component({
  imports: [MatButton, MatIcon],
  selector: 'target-15042',
  standalone: true,
  template: '<button matButton><mat-icon>home</mat-icon></button>',
})
class TargetComponent {
  public readonly service = inject(ApplicationService);
}

@Component({
  imports: [MatIcon],
  selector: 'icon-15042',
  standalone: true,
  template: '<mat-icon>home</mat-icon>',
})
class IconComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15042
describe('issue-15042:material', () => {
  for (const mode of ['default', 'auto-spy']) {
    describe(mode, () => {
      beforeEach(() => {
        const runnerWindow = window as Window & { vi?: unknown };
        ngMocks.autoSpy(
          mode === 'default'
            ? 'default'
            : runnerWindow.vi === undefined
              ? 'jasmine'
              : 'vitest',
        );
        ApplicationService.constructed = 0;
      });
      afterEach(() => ngMocks.autoSpy('reset'));

      it('reproduces unconfigured root mocks in the original kept Material setup', async () => {
        await MockBuilder(TargetComponent)
          .keep(MatButton)
          .keep(MatIcon);

        // Material caches its motion preference, so the first error can be matches
        // during button construction or filter when the icon reaches initialization.
        expect(() => MockRender(TargetComponent)).toThrowError(
          /reading '(matches|filter)'/,
        );
        expect(ApplicationService.constructed).toBe(0);
      });

      it('reproduces the icon registry failure independently of the animation cache', async () => {
        await MockBuilder(IconComponent).keep(MatIcon);

        const fixture = MockRender(IconComponent, {}, false);
        const registry = TestBed.inject(MatIconRegistry);

        expect(registry.getDefaultFontSetClass()).toBeUndefined();
        expect(() => fixture.detectChanges()).toThrowError(/filter/);
      });

      it('renders Material with specific root keeps while application roots stay mocked', async () => {
        await MockBuilder(TargetComponent)
          .keep(MatButton)
          .keep(MatIcon)
          .keep(MediaMatcher)
          .keep(MatIconRegistry);

        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const button = ngMocks.findInstance(MatButton);
        const icon = ngMocks.findInstance(MatIcon);
        const registry = TestBed.inject(MatIconRegistry);
        const matcher = TestBed.inject(MediaMatcher);
        // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
        const element = ngMocks.find('mat-icon');

        expect(ngMocks.formatText(fixture)).toEqual('home');
        expect(isMockOf(button, MatButton)).toBe(false);
        expect(isMockOf(icon, MatIcon)).toBe(false);
        expect(registry.getDefaultFontSetClass()).toEqual([
          'material-icons',
          'mat-ligature-font',
        ]);
        expect(
          element.nativeElement.classList.contains('material-icons'),
        ).toBe(true);
        expect(
          typeof matcher.matchMedia('(prefers-reduced-motion)')
            .matches,
        ).toBe('boolean');
        expect(component.service).toBe(
          TestBed.inject(ApplicationService),
        );
        expect(component.service.label()).toBeUndefined();
        if (mode === 'auto-spy') {
          expect(component.service.label).toHaveBeenCalledTimes(1);
        }
        expect(ApplicationService.constructed).toBe(0);
      });

      it('also keeps application services when keeping all root providers', async () => {
        await MockBuilder(TargetComponent)
          .keep(MatButton)
          .keep(MatIcon)
          .keep(NG_MOCKS_ROOT_PROVIDERS);

        const fixture = MockRender(TargetComponent);
        const service = fixture.point.componentInstance.service;

        expect(ngMocks.formatText(fixture)).toEqual('home');
        expect(service).toBe(TestBed.inject(ApplicationService));
        expect(service.label()).toBe('real application');
        expect(ApplicationService.constructed).toBe(1);
      });

      it('keeps all root providers while respecting an explicit application mock', async () => {
        await MockBuilder(TargetComponent)
          .keep(MatButton)
          .keep(MatIcon)
          .keep(NG_MOCKS_ROOT_PROVIDERS)
          .mock(ApplicationService, {
            label: () => 'mock application',
          });

        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const button = ngMocks.findInstance(MatButton);
        const icon = ngMocks.findInstance(MatIcon);
        const matcher = TestBed.inject(MediaMatcher);
        // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
        const element = ngMocks.find('mat-icon');

        expect(ngMocks.formatText(fixture)).toEqual('home');
        expect(isMockOf(button, MatButton)).toBe(false);
        expect(isMockOf(icon, MatIcon)).toBe(false);
        expect(
          TestBed.inject(MatIconRegistry).getDefaultFontSetClass(),
        ).toEqual(['material-icons', 'mat-ligature-font']);
        expect(
          element.nativeElement.classList.contains('material-icons'),
        ).toBe(true);
        expect(
          typeof matcher.matchMedia('(prefers-reduced-motion)')
            .matches,
        ).toBe('boolean');
        expect(component.service).toBe(
          TestBed.inject(ApplicationService),
        );
        expect(component.service.label()).toBe('mock application');
        expect(ApplicationService.constructed).toBe(0);
      });

      it('renders a kept icon with a configured registry mock', async () => {
        await MockBuilder(IconComponent)
          .keep(MatIcon)
          .mock(MatIconRegistry, {
            getDefaultFontSetClass: () => ['custom-icon', ''],
          });

        const fixture = MockRender(IconComponent);
        const registry = TestBed.inject(MatIconRegistry);
        // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
        const element = ngMocks.find('mat-icon');

        expect(ngMocks.formatText(fixture)).toEqual('home');
        expect(isMockOf(ngMocks.findInstance(MatIcon), MatIcon)).toBe(
          false,
        );
        expect(registry.getDefaultFontSetClass()).toEqual([
          'custom-icon',
          '',
        ]);
        expect(
          element.nativeElement.classList.contains('custom-icon'),
        ).toBe(true);
        expect(
          element.nativeElement.classList.contains('material-icons'),
        ).toBe(false);
      });
    });
  }
});
