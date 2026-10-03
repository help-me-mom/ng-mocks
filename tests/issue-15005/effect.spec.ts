import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

let constructions = 0;
let recorded: number[] = [];

@Injectable({ providedIn: 'root' })
class EffectManager {
  public constructor() {
    constructions += 1;
  }

  public record(value: number): void {
    recorded.push(value);
  }
}

@Injectable({ providedIn: 'root' })
class TargetService {
  public readonly manager = inject(EffectManager);
  public readonly value = signal(1);
  public readonly observed: number[] = [];

  public constructor() {
    effect(() => {
      const value = this.value();
      this.observed.push(value);
      this.manager.record(value);
    });
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'host-15005-effect',
  standalone: false,
  template: 'value:{{ target.value() }}',
})
class HostComponent {
  public constructor(public readonly target: TargetService) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15005
describe('issue-15005:effect', () => {
  beforeEach(() => {
    constructions = 0;
    recorded = [];
  });

  it('registers a native effect before a view while mocking the application EffectManager', async () => {
    await MockBuilder([TargetService, HostComponent]);

    // Resolve the kept constructor before creating any component or wrapper.
    const target = ngMocks.get(TargetService);
    expect(ngMocks.get(EffectManager)).toBe(target.manager);
    expect(target.observed).toEqual([]);
    expect(constructions).toBe(0);
    expect(recorded).toEqual([]);

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.target).toBe(target);
    expect(target.observed).toEqual([1]);
    expect(fixture.nativeElement.textContent).toBe('value:1');
    expect(constructions).toBe(0);
    expect(recorded).toEqual([]);

    target.value.set(2);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(target.observed).toEqual([1, 2]);
    expect(fixture.nativeElement.textContent).toBe('value:2');
    expect(ngMocks.get(EffectManager)).toBe(target.manager);
    expect(constructions).toBe(0);
    expect(recorded).toEqual([]);

    fixture.detectChanges();
    await fixture.whenStable();
    expect(target.observed).toEqual([1, 2]);
  });
});
