import {
  Component,
  Injectable,
  NgModule,
  OnDestroy,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class LocalService {
  public value = 'original local provider';
}

@Injectable()
class ModuleService implements OnDestroy {
  public destroyCalls = 0;
  public error?: Error;

  public ngOnDestroy(): void {
    this.destroyCalls += 1;
    if (this.error) {
      throw this.error;
    }
  }
}

@Component({
  selector: 'issue-14912-overrides',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  providers: [LocalService],
  template: '{{ local.value }}',
})
class TargetComponent {
  public constructor(
    public readonly local: LocalService,
    public readonly module: ModuleService,
  ) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  providers: [ModuleService],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14912
describe('issue-14912: pending overrides', () => {
  it('restores declaration metadata and Angular compiler state after teardown throws during reset', () => {
    TestBed.configureTestingModule({
      ...MockBuilder(TargetComponent, TargetModule)
        .keep(ModuleService)
        .mock(LocalService, { value: 'mocked local provider' })
        .build(),
      teardown: { destroyAfterEach: true, rethrowErrors: true },
    });
    const first = MockRender(TargetComponent);
    expect(ngMocks.formatText(first)).toBe('mocked local provider');
    const original = first.point.componentInstance.module;
    const error = new Error('module provider destruction failed');
    original.error = error;

    let actual: unknown;
    try {
      TestBed.resetTestingModule();
    } catch (error_) {
      actual = error_;
    }
    expect(actual).toBe(error);
    expect(original.destroyCalls).toBe(1);

    // Reset must finish even when the preliminary flush for pending overrides fails.
    TestBed.configureTestingModule({
      imports: [TargetModule],
      teardown: { destroyAfterEach: true, rethrowErrors: true },
    });
    const next = MockRender(TargetComponent);
    expect(next.point.componentInstance.module).not.toBe(original);
    expect(ngMocks.formatText(next)).toBe('original local provider');
    expect(original.destroyCalls).toBe(1);
  });
});
