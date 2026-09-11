import {
  Component,
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetDependency {
  public static constructed = 0;
  public static recorded: number[] = [];

  public constructor() {
    TargetDependency.constructed += 1;
  }

  public record(value: number): void {
    TargetDependency.recorded.push(value);
  }
}

@Injectable({ providedIn: 'root' })
class TargetService {
  public readonly dependency = inject(TargetDependency);
  public readonly value = signal(1);
  public readonly observed: number[] = [];

  public constructor() {
    effect(() => {
      const value = this.value();
      this.observed.push(value);
      this.dependency.record(value);
    });
  }
}

@Component({
  selector: 'host-14896-effect',
  standalone: false,
  template: 'host:{{ target.value() }}',
})
class HostComponent {
  public constructor(public readonly target: TargetService) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14896
// Directly keeping the service activates runtime injection while its
// constructor registers the effect with Angular 16's EffectManager.
describe('issue-14896:effect', () => {
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
    TargetDependency.recorded = [];
  });

  beforeEach(() => MockBuilder([TargetService, HostComponent]));

  it('runs and reschedules a kept service effect while mocking application dependencies', async () => {
    const fixture = MockRender(HostComponent);
    await fixture.whenStable();
    const target = fixture.point.componentInstance.target;

    expect(target.observed).toEqual([1]);
    expect(target.dependency.record).toHaveBeenCalledTimes(1);
    expect(target.dependency.record).toHaveBeenCalledWith(1);
    expect(TargetDependency.constructed).toEqual(0);
    expect(TargetDependency.recorded).toEqual([]);
    expect(ngMocks.formatText(fixture)).toEqual('host:1');

    target.value.set(2);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(target.observed).toEqual([1, 2]);
    expect(target.dependency.record).toHaveBeenCalledTimes(2);
    expect(target.dependency.record).toHaveBeenCalledWith(2);
    expect(TargetDependency.constructed).toEqual(0);
    expect(TargetDependency.recorded).toEqual([]);
    expect(ngMocks.formatText(fixture)).toEqual('host:2');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(target.observed).toEqual([1, 2]);
    expect(target.dependency.record).toHaveBeenCalledTimes(2);
  });
});
