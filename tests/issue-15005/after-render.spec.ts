import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injectable,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

let constructions = 0;
let recorded = 0;

@Injectable({ providedIn: 'root' })
class AfterRenderImpl {
  public constructor() {
    constructions += 1;
  }

  public record(): void {
    recorded += 1;
  }
}

@Injectable({ providedIn: 'root' })
class TargetService {
  public readonly manager = inject(AfterRenderImpl);
  public calls = 0;

  public constructor() {
    afterNextRender(() => {
      this.calls += 1;
      this.manager.record();
    });
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'host-15005-after-render',
  standalone: false,
  template: 'host rendered',
})
class HostComponent {
  public constructor(public readonly target: TargetService) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15005
describe('issue-15005:after-render', () => {
  beforeEach(() => {
    constructions = 0;
    recorded = 0;
  });

  it('registers a native render callback before a view while mocking application AfterRenderImpl', async () => {
    await MockBuilder([TargetService, HostComponent]);

    // Register with Angular before a component exists; do not warm its manager.
    const target = ngMocks.get(TargetService);
    expect(ngMocks.get(AfterRenderImpl)).toBe(target.manager);
    expect(target.calls).toBe(0);
    expect(constructions).toBe(0);
    expect(recorded).toBe(0);

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.target).toBe(target);
    expect(target.calls).toBe(1);
    expect(fixture.nativeElement.textContent).toBe('host rendered');
    expect(constructions).toBe(0);
    expect(recorded).toBe(0);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(target.calls).toBe(1);
    expect(ngMocks.get(AfterRenderImpl)).toBe(target.manager);
    expect(constructions).toBe(0);
    expect(recorded).toBe(0);
  });
});
