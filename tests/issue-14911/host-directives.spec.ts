import {
  Directive,
  forwardRef,
  HostBinding,
  InjectionToken,
  Input,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockDirective,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const constructionError = new Error('host directive construction');
const TOKEN = new InjectionToken<unknown>(
  'issue-14911-host-directives',
);
let failConstruction = false;

@Directive({
  selector: '[issue14911KeptHost]',
  standalone: true,
})
class KeptDirective {
  @HostBinding('attr.data-value')
  @Input()
  public value = 'default';
}

@Directive({
  providers: [
    {
      provide: TOKEN,
      useExisting: forwardRef(() => {
        if (failConstruction) {
          throw constructionError;
        }

        return FailingDirective;
      }),
    },
  ],
  selector: '[issue14911FailingHost]',
  standalone: true,
})
class FailingDirective {}

@Directive({
  hostDirectives: [
    {
      directive: KeptDirective,
      inputs: ['value'],
    },
    FailingDirective,
  ],
  selector: '[issue14911Host]',
  standalone: true,
})
class TargetDirective {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14911
describe('issue-14911:host-directives', () => {
  beforeEach(() => ngMocks.reset());

  afterEach(() => {
    failConstruction = false;
    ngMocks.globalWipe(KeptDirective);
    ngMocks.reset();
  });

  it('retries failed host directives with the current global keep policy', async () => {
    failConstruction = true;
    let actualError: unknown;
    try {
      MockDirective(TargetDirective);
    } catch (error) {
      actualError = error;
    }
    expect(actualError).toBe(constructionError);

    failConstruction = false;
    // A failed host directive must not retain earlier sibling mock resolutions.
    ngMocks.globalKeep(KeptDirective);
    const mock = MockDirective(TargetDirective);
    expect(mock).not.toBe(TargetDirective);
    expect(MockDirective(TargetDirective)).toBe(mock);

    await TestBed.configureTestingModule({
      imports: [mock],
    }).compileComponents();

    const fixture = MockRender(
      '<div issue14911Host [value]="value"></div>',
      { value: 'kept host' },
    );
    const directive = ngMocks.findInstance(KeptDirective);

    expect(directive.value).toEqual('kept host');
    expect(isMockOf(directive, KeptDirective)).toBe(false);
    expect(ngMocks.formatHtml(fixture)).toContain(
      ' data-value="kept host"',
    );
    expect(
      isMockOf(
        ngMocks.findInstance(FailingDirective),
        FailingDirective,
      ),
    ).toBe(true);
  });
});
