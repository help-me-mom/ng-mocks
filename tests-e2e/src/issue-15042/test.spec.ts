import { Component, inject, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButton } from '@angular/material/button';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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
  beforeEach(() => {
    ngMocks.autoSpy('default');
    ApplicationService.constructed = 0;
  });
  afterEach(() => ngMocks.autoSpy('reset'));

  it('renders the kept Material button and icon', async () => {
    await MockBuilder(TargetComponent).keep(MatButton).keep(MatIcon);
    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('home');
    expect(ngMocks.findInstance(MatButton)).toBeDefined();
    expect(ngMocks.findInstance(MatIcon)).toBeDefined();
    expect(isMockOf(ngMocks.findInstance(MatButton), MatButton)).toBe(
      false,
    );
    expect(isMockOf(ngMocks.findInstance(MatIcon), MatIcon)).toBe(
      false,
    );
    expect(
      TestBed.inject(MatIconRegistry).getDefaultFontSetClass(),
    ).toEqual(['material-icons', 'mat-ligature-font']);
    expect(fixture.point.componentInstance.service).toBe(
      TestBed.inject(ApplicationService),
    );
    expect(
      fixture.point.componentInstance.service.label(),
    ).toBeUndefined();
    expect(ApplicationService.constructed).toBe(0);
  });

  it('renders the kept icon independently', async () => {
    await MockBuilder(IconComponent).keep(MatIcon);

    expect(ngMocks.formatText(MockRender(IconComponent))).toEqual(
      'home',
    );
  });

  it('respects a customized root mock for a kept icon', async () => {
    await MockBuilder(IconComponent)
      .keep(MatIcon)
      .mock(MatIconRegistry, {
        getDefaultFontSetClass: () => ['custom-icon'],
      });

    const fixture = MockRender(IconComponent);
    // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
    const icon = ngMocks.find('mat-icon');

    expect(ngMocks.formatText(fixture)).toEqual('home');
    expect(icon.nativeElement.classList.contains('custom-icon')).toBe(
      true,
    );
  });

  it('keeps the same Material setup working with auto-spy enabled', async () => {
    const runnerWindow = window as Window & { vi?: unknown };
    ngMocks.autoSpy(
      runnerWindow.vi === undefined ? 'jasmine' : 'vitest',
    );
    await MockBuilder(TargetComponent).keep(MatButton).keep(MatIcon);

    const fixture = MockRender(TargetComponent);
    const service = fixture.point.componentInstance.service;
    service.label();

    expect(ngMocks.formatText(fixture)).toEqual('home');
    expect(service.label).toHaveBeenCalledTimes(1);
    expect(ApplicationService.constructed).toBe(0);
  });
});
