import { Component } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import coreReflectDirective from 'ng-mocks/dist/lib/common/core.reflect.directive';

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

describe('issue-145:components', () => {
  it('does not add NG_VALUE_ACCESSOR to components', () => {
    const mock = MockComponent(ComponentDefault);
    const { providers } = coreReflectDirective().resolve(mock);
    expect(providers).toEqual([
      {
        provide: ComponentDefault,
        useExisting: jasmine.anything(),
      },
    ]);
  });

  it('adds NG_VALUE_ACCESSOR to components that provide it', () => {
    const mock = MockComponent(ComponentValueAccessor);
    const { providers } = coreReflectDirective().resolve(mock);
    expect(providers).toEqual([
      {
        provide: ComponentValueAccessor,
        useExisting: jasmine.anything(),
      },
      {
        multi: true,
        provide: NG_VALUE_ACCESSOR,
        useFactory: jasmine.anything(),
      },
    ]);
  });

  it('respects NG_VALIDATORS too', () => {
    const mock = MockComponent(ComponentValidator);
    const { providers } = coreReflectDirective().resolve(mock);
    expect(providers).toEqual([
      {
        provide: ComponentValidator,
        useExisting: jasmine.anything(),
      },
      {
        multi: true,
        provide: NG_VALIDATORS,
        useFactory: jasmine.anything(),
      },
    ]);
  });
});
