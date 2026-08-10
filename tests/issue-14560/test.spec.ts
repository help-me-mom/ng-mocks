import { Component, inject, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetService {
  public static constructed = 0;

  public constructor() {
    TargetService.constructed += 1;
  }

  public echo(): string {
    return 'real';
  }
}

@Component({
  selector: 'target-field-14560',
  standalone: false,
  template: '',
})
class TargetFieldComponent {
  public readonly service = inject(TargetService);
}

@Component({
  selector: 'target-constructor-14560',
  standalone: false,
  template: '',
})
class TargetConstructorComponent {
  public readonly service: TargetService;

  public constructor() {
    this.service = inject(TargetService);
  }
}

// The runtime inject hook covered standalone declarations but skipped classic
// components, so their inject() calls resolved real root services. Auto-mock
// mode now wraps both declaration styles while kept modules retain their roots.
// @see https://github.com/help-me-mom/ng-mocks/issues/14560
describe('issue-14560', () => {
  beforeEach(() =>
    ngMocks.autoSpy(
      typeof jest === 'undefined'
        ? 'jasmine'
        : typeof (window as any).vi === 'undefined'
          ? 'jest'
          : 'vitest',
    ),
  );
  afterEach(() => ngMocks.autoSpy('reset'));

  beforeEach(() => {
    TargetService.constructed = 0;
  });

  describe('field injection', () => {
    beforeEach(() => MockBuilder(TargetFieldComponent));

    it('mocks inject() dependencies of kept components', () => {
      const fixture = MockRender(TargetFieldComponent);
      const service = TestBed.inject(TargetService);

      service.echo();

      expect(fixture.point.componentInstance.service).toBe(service);
      expect(service.echo).toHaveBeenCalledTimes(1);
      expect(TargetService.constructed).toBe(0);
    });
  });

  describe('constructor body injection', () => {
    beforeEach(() => MockBuilder(TargetConstructorComponent));

    it('mocks inject() dependencies of kept components', () => {
      const fixture = MockRender(TargetConstructorComponent);
      const service = TestBed.inject(TargetService);

      service.echo();

      expect(fixture.point.componentInstance.service).toBe(service);
      expect(service.echo).toHaveBeenCalledTimes(1);
      expect(TargetService.constructed).toBe(0);
    });
  });
});
