import {
  Component,
  Directive,
  forwardRef,
  InjectionToken,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockModule,
  MockPipe,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const FAILURE = new Error('issue-14911 provider resolution');
const ALIAS = new InjectionToken('issue-14911 alias');
const VALUE = new InjectionToken('issue-14911 value');
let fail = false;

@Component({
  selector: 'child-issue-14911',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real child',
})
class ChildComponent {}

@NgModule({
  declarations: [ChildComponent],
  exports: [ChildComponent],
})
class ChildModule {}

@Directive({
  selector: '[broken-issue-14911]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  providers: [
    {
      provide: ALIAS,
      useExisting: forwardRef(() => {
        if (fail) {
          throw FAILURE;
        }
        return BrokenDirective;
      }),
    },
  ],
})
class BrokenDirective {}

@NgModule({ declarations: [BrokenDirective] })
class BrokenModule {}

@NgModule({ imports: [ChildModule, BrokenModule] })
class FailingModule {}

@NgModule({ imports: [ChildModule], exports: [ChildModule] })
class RecoveryModule {}

@NgModule({ providers: [{ provide: VALUE, useValue: 'real value' }] })
class ProviderModule {}

@Pipe({
  name: 'issue14911',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return value;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14911
describe('issue-14911', () => {
  beforeEach(() => {
    ngMocks.reset();
    fail = true;
  });

  afterEach(() => {
    fail = false;
    ngMocks.globalWipe(ChildComponent);
    ngMocks.reset();
  });

  it('respects a new keep policy after nested construction fails', () => {
    expect(() => MockModule(FailingModule)).toThrow(FAILURE);

    // The completed sibling must not remain in a failed call's temporary resolver.
    fail = false;
    ngMocks.globalKeep(ChildComponent);
    TestBed.configureTestingModule({
      imports: [MockModule(RecoveryModule)],
    });

    const fixture = MockRender(
      '<child-issue-14911></child-issue-14911>',
    );
    expect(ngMocks.formatText(fixture)).toEqual('real child');
    expect(
      ngMocks.findInstance(ChildComponent) instanceof ChildComponent,
    ).toBe(true);
  });

  it('keeps completed sibling mocks reusable after a later failure', () => {
    const child = MockComponent(ChildComponent);
    const module = MockModule(ChildModule);

    expect(() => MockModule(FailingModule)).toThrow(FAILURE);
    expect(MockComponent(ChildComponent)).toBe(child);
    expect(MockModule(ChildModule)).toBe(module);

    fail = false;
    TestBed.configureTestingModule({
      imports: [MockModule(RecoveryModule)],
    });
    const fixture = MockRender(
      '<child-issue-14911></child-issue-14911>',
    );
    expect(ngMocks.formatText(fixture)).toEqual('');
    expect(
      isMockOf(ngMocks.findInstance(ChildComponent), ChildComponent),
    ).toBe(true);
  });

  it('keeps subsequent pipe transforms independent after a failure', () => {
    expect(() => MockModule(FailingModule)).toThrow(FAILURE);

    const first = MockPipe(TargetPipe, value => `first:${value}`);
    const second = MockPipe(TargetPipe, value => `second:${value}`);

    expect(first).not.toBe(second);
    expect(new first().transform('value')).toEqual('first:value');
    expect(new second().transform('value')).toEqual('second:value');
  });

  it('retries ModuleWithProviders without discarding its completed base module', () => {
    const module = MockModule(ProviderModule);
    const withProviders = {
      ngModule: ProviderModule,
      providers: [
        {
          provide: ALIAS,
          useExisting: forwardRef(() => {
            if (fail) {
              throw FAILURE;
            }
            return VALUE;
          }),
        },
      ],
    };

    expect(() => MockModule(withProviders)).toThrow(FAILURE);
    expect(MockModule(ProviderModule)).toBe(module);

    fail = false;
    const retry = MockModule(withProviders);
    expect(retry.ngModule).toBe(module);
    TestBed.configureTestingModule({ imports: [retry] });
    MockRender();
    expect(ngMocks.findInstance(ALIAS)).toBe(
      ngMocks.findInstance(VALUE),
    );
    expect(ngMocks.findInstance(VALUE)).toEqual('');
  });

  it('does not keep a module because an earlier guts call failed', () => {
    expect(() =>
      ngMocks.guts(RecoveryModule, BrokenDirective),
    ).toThrow(FAILURE);

    fail = false;
    const module = MockModule(RecoveryModule);
    expect(module).not.toBe(RecoveryModule);
    TestBed.configureTestingModule({ imports: [module] });

    const fixture = MockRender(
      '<child-issue-14911></child-issue-14911>',
    );
    expect(ngMocks.formatText(fixture)).toEqual('');
    expect(
      isMockOf(ngMocks.findInstance(ChildComponent), ChildComponent),
    ).toBe(true);
  });

  it('preserves recovery after a failed MockBuilder build', () => {
    expect(() => MockBuilder(null, FailingModule).build()).toThrow(
      FAILURE,
    );

    fail = false;
    ngMocks.globalKeep(ChildComponent);
    TestBed.configureTestingModule({
      imports: [MockModule(RecoveryModule)],
    });

    const fixture = MockRender(
      '<child-issue-14911></child-issue-14911>',
    );
    expect(ngMocks.formatText(fixture)).toEqual('real child');
  });
});
