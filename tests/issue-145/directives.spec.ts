import { Directive } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MockDirective } from 'ng-mocks';
import { directiveResolver } from 'ng-mocks/dist/lib/common/reflect';

@Directive({
  selector: 'directive',
})
export class DirectiveDefault {}

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: DirectiveValueAccessor,
    },
  ],
  selector: 'directive',
})
export class DirectiveValueAccessor {}

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALIDATORS,
      useExisting: DirectiveValidator,
    },
  ],
  selector: 'directive',
})
export class DirectiveValidator {}

// providers should be added to directives only in case if they were specified in the original directive.
describe('issue-145', () => {
  it('DirectiveDefault', () => {
    const mock = MockDirective(DirectiveDefault);
    const { providers } = directiveResolver.resolve(mock);
    expect(providers).toEqual([
      {
        provide: DirectiveDefault,
        useExisting: jasmine.anything(),
      },
    ]);
  });

  it('DirectiveValueAccessor', () => {
    const mock = MockDirective(DirectiveValueAccessor);
    const { providers } = directiveResolver.resolve(mock);
    expect(providers).toEqual([
      {
        provide: DirectiveValueAccessor,
        useExisting: jasmine.anything(),
      },
      {
        multi: true,
        provide: NG_VALUE_ACCESSOR,
        useExisting: jasmine.anything(),
      },
    ]);
  });

  it('DirectiveValidator', () => {
    const mock = MockDirective(DirectiveValidator);
    const { providers } = directiveResolver.resolve(mock);
    expect(providers).toEqual([
      {
        provide: DirectiveValidator,
        useExisting: jasmine.anything(),
      },
      {
        multi: true,
        provide: NG_VALIDATORS,
        useExisting: jasmine.anything(),
      },
    ]);
  });
});
