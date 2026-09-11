import {
  Component,
  Injectable,
  NgModule,
  OnDestroy,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService implements OnDestroy {
  public destroyCalls = 0;
  public error?: Error;
  public value = 'fresh provider';

  public ngOnDestroy(): void {
    this.destroyCalls += 1;
    if (this.error) {
      throw this.error;
    }
  }
}

@Component({
  selector: 'issue-14912-target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ service.value }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14912
describe('issue-14912', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      ...MockBuilder(TargetComponent, TargetModule)
        .keep(TargetService)
        .build(),
      teardown: { destroyAfterEach: true, rethrowErrors: true },
    });
  });

  it('recovers after explicit flush rethrows a provider destruction error', () => {
    const first = MockRender(TargetComponent);
    const original = first.point.componentInstance.service;
    const error = new Error('provider destruction failed');
    original.error = error;

    // Angular destroys its injector before rethrowing, so keeping that module reference breaks retries.
    let actual: unknown;
    try {
      ngMocks.flushTestBed();
    } catch (error_) {
      actual = error_;
    }
    expect(actual).toBe(error);
    expect(original.destroyCalls).toBe(1);

    const next = MockRender(TargetComponent, null, { reset: true });
    const replacement = next.point.componentInstance.service;
    expect(replacement).not.toBe(original);
    expect(TestBed.inject(TargetService)).toBe(replacement);
    expect(ngMocks.formatText(next)).toBe('fresh provider');
    expect(original.destroyCalls).toBe(1);
    expect(replacement.destroyCalls).toBe(0);

    ngMocks.flushTestBed();
    expect(original.destroyCalls).toBe(1);
    expect(replacement.destroyCalls).toBe(1);
  });

  it('recovers when MockRender reset triggers the failing teardown', () => {
    const first = MockRender(TargetComponent);
    const original = first.point.componentInstance.service;
    const error = new Error('reset destruction failed');
    original.error = error;

    let actual: unknown;
    try {
      MockRender(
        '<issue-14912-target></issue-14912-target>',
        {},
        { reset: true },
      );
    } catch (error_) {
      actual = error_;
    }
    expect(actual).toBe(error);
    expect(original.destroyCalls).toBe(1);

    const next = MockRender(
      '<issue-14912-target></issue-14912-target>',
      {},
      { reset: true },
    );
    const replacement = ngMocks.findInstance(next, TargetService);
    expect(replacement).not.toBe(original);
    expect(TestBed.inject(TargetService)).toBe(replacement);
    expect(ngMocks.formatText(next)).toBe('fresh provider');
    expect(original.destroyCalls).toBe(1);
  });

  it('preserves recovery through Angular resetTestingModule', () => {
    const first = MockRender(TargetComponent);
    const original = first.point.componentInstance.service;
    const error = new Error('Angular reset destruction failed');
    original.error = error;

    let actual: unknown;
    try {
      TestBed.resetTestingModule();
    } catch (error_) {
      actual = error_;
    }
    expect(actual).toBe(error);
    expect(original.destroyCalls).toBe(1);

    TestBed.configureTestingModule({
      ...MockBuilder(TargetComponent, TargetModule)
        .keep(TargetService)
        .build(),
      teardown: { destroyAfterEach: true, rethrowErrors: true },
    });
    const next = MockRender(TargetComponent);
    expect(next.point.componentInstance.service).not.toBe(original);
    expect(TestBed.inject(TargetService)).toBe(
      next.point.componentInstance.service,
    );
    expect(ngMocks.formatText(next)).toBe('fresh provider');
    expect(original.destroyCalls).toBe(1);
  });

  it('preserves the configured suppression of teardown errors', () => {
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    });
    const first = MockRender(TargetComponent);
    const original = first.point.componentInstance.service;
    const error = new Error('logged destruction failure');
    original.error = error;
    const log = console.error;
    ngMocks.stubMember(
      console,
      'error',
      typeof jest === 'undefined'
        ? jasmine.createSpy('console.error')
        : jest.fn(),
    );

    try {
      expect(() => ngMocks.flushTestBed()).not.toThrow();
      expect(original.destroyCalls).toBe(1);
      expect(console.error).toHaveBeenCalledTimes(1);

      const next = MockRender(TargetComponent, null, { reset: true });
      expect(next.point.componentInstance.service).not.toBe(original);
      expect(ngMocks.formatText(next)).toBe('fresh provider');
      expect(original.destroyCalls).toBe(1);
    } finally {
      ngMocks.stubMember(console, 'error', log);
    }
  });

  it('does not destroy providers when module teardown is disabled', () => {
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false, rethrowErrors: true },
    });
    const first = MockRender(TargetComponent);
    const original = first.point.componentInstance.service;
    original.error = new Error('disabled teardown must not run');

    expect(() => ngMocks.flushTestBed()).not.toThrow();
    expect(original.destroyCalls).toBe(0);

    const next = MockRender(TargetComponent, null, { reset: true });
    expect(next.point.componentInstance.service).not.toBe(original);
    expect(ngMocks.formatText(next)).toBe('fresh provider');
    expect(original.destroyCalls).toBe(0);
  });
});
