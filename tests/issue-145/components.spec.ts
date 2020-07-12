import { Component } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import { directiveResolver } from 'ng-mocks/dist/lib/common/reflect';

@Component({
  selector: 'component',
  template: '',
})
export class ComponentDefault {}

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: ComponentValueAccessor,
    },
  ],
  selector: 'component',
  template: '',
})
export class ComponentValueAccessor {}

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALIDATORS,
      useExisting: ComponentValidator,
    },
  ],
  selector: 'component',
  template: '',
})
export class ComponentValidator {}

// providers should be added to components only in case if they were specified in the original component.
describe('issue-145', () => {
  it('ComponentDefault', () => {
    const mock = MockComponent(ComponentDefault);
    const { providers } = directiveResolver.resolve(mock);
    expect(providers).toEqual([
      {
        provide: ComponentDefault,
        useExisting: jasmine.anything(),
      },
    ]);
  });

  // this test was changed due to issue 157: https://github.com/ike18t/ng-mocks/issues/157
  it('should skip NG_VALUE_ACCESSOR in mocked component ComponentValueAccessor', () => {
    const mock = MockComponent(ComponentValueAccessor);
    const { providers } = directiveResolver.resolve(mock);
    expect(providers as any).not.toEqual(
      jasmine.arrayContaining([
        {
          multi: true,
          provide: NG_VALUE_ACCESSOR,
          useExisting: jasmine.anything(),
        },
      ])
    );
  });

  it('ComponentValidator', () => {
    const mock = MockComponent(ComponentValidator);
    const { providers } = directiveResolver.resolve(mock);
    expect(providers).toEqual([
      {
        provide: ComponentValidator,
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
