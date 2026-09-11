import { Component, inject, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetDependency {
  public static constructed = 0;

  public constructor() {
    TargetDependency.constructed += 1;
  }

  public echo(): string {
    return 'real';
  }
}

@Component({
  selector: 'exclude-14899',
  standalone: false,
  template: '{{ value }}',
})
class TargetComponent {
  public readonly dependency = inject(TargetDependency);
  public readonly value = this.dependency.echo();
}

@Injectable({ providedIn: 'root' })
class TargetService {
  public readonly dependency = inject(TargetDependency);
  public readonly value = this.dependency.echo();
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14899
describe('issue-14899:exclude', () => {
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
    TargetDependency.constructed = 0;

    return MockBuilder(TargetComponent).exclude(TargetDependency);
  });

  it('preserves an explicitly excluded root fallback when auto-spy is enabled', () => {
    const fixture = MockRender(TargetComponent);
    const dependency = TestBed.inject(TargetDependency);

    expect(fixture.point.componentInstance.dependency).toBe(
      dependency,
    );
    expect(fixture.point.componentInstance.value).toBe('real');
    expect(dependency.echo()).toBe('real');
    expect(TargetDependency.constructed).toBe(1);
    expect(ngMocks.formatText(fixture)).toEqual('real');
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/14899
describe('issue-14899:exclude-service', () => {
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
    TargetDependency.constructed = 0;

    return MockBuilder(TargetService).exclude(TargetDependency);
  });

  it('preserves the excluded root fallback during directly kept service construction', () => {
    const service = MockRender(TargetService).point.componentInstance;
    const dependency = TestBed.inject(TargetDependency);

    expect(service).toBe(TestBed.inject(TargetService));
    expect(service.dependency).toBe(dependency);
    expect(service.value).toBe('real');
    expect(dependency.echo()).toBe('real');
    expect(TargetDependency.constructed).toBe(1);
  });
});
