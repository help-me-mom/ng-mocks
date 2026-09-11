import {
  afterNextRender,
  Component,
  inject,
  Injectable,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetDependency {
  public static constructed = 0;
  public static recorded = 0;

  public constructor() {
    TargetDependency.constructed += 1;
  }

  public record(): void {
    TargetDependency.recorded += 1;
  }
}

@Injectable({ providedIn: 'root' })
class TargetService {
  public readonly dependency = inject(TargetDependency);
  public calls = 0;

  public constructor() {
    afterNextRender(() => {
      this.calls += 1;
      this.dependency.record();
    });
  }
}

@Component({
  selector: 'host-14896-after-render',
  standalone: false,
  template: 'host rendered',
})
class HostComponent {
  public constructor(public readonly target: TargetService) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14896
// The directly kept service must retain Angular's after-render infrastructure
// while its own root dependencies are mocked during construction.
describe('issue-14896:after-render', () => {
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
    TargetDependency.recorded = 0;
  });

  beforeEach(() => MockBuilder([TargetService, HostComponent]));

  it('runs the render callback once while mocking application dependencies', async () => {
    const fixture = MockRender(HostComponent);
    await fixture.whenStable();
    const target = fixture.point.componentInstance.target;

    expect(target.calls).toEqual(1);
    expect(target.dependency.record).toHaveBeenCalledTimes(1);
    expect(TargetDependency.constructed).toEqual(0);
    expect(TargetDependency.recorded).toEqual(0);
    expect(ngMocks.formatText(fixture)).toEqual('host rendered');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(target.calls).toEqual(1);
    expect(target.dependency.record).toHaveBeenCalledTimes(1);
    expect(TargetDependency.constructed).toEqual(0);
    expect(TargetDependency.recorded).toEqual(0);
  });
});
