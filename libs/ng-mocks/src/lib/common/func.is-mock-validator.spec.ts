import {
  Component,
  Directive,
  forwardRef,
  Injector,
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';

import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { ngMocks } from '../mock-helper/mock-helper';
import { MockService } from '../mock-service/mock-service';

import { isMockValidator } from './func.is-mock-validator';
import {
  MockAsyncValidatorProxy,
  MockValidatorProxy,
} from './mock-control-value-accessor-proxy';

@Component({
  providers: [
    {
      provide: NG_VALIDATORS,
      useClass: forwardRef(() => TargetComponent),
    },
  ],
  selector: 'target',
  template: '',
})
class TargetComponent implements Validator {
  public validate(control: AbstractControl): ValidationErrors | null {
    return control ? null : {};
  }
}

@Directive({
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useClass: forwardRef(() => TargetDirective),
    },
  ],
  selector: '[target]',
})
class TargetDirective implements AsyncValidator {
  public async validate(
    control: AbstractControl,
  ): Promise<ValidationErrors | null> {
    return control ? null : {};
  }
}

describe('isMockValidator', () => {
  it('does not decorate components by default', () => {
    const instanceReal = new TargetComponent();
    expect(isMockValidator(instanceReal)).toEqual(false);

    const mockClass = MockComponent(TargetComponent);
    const instanceDefault = new mockClass();
    expect(isMockValidator(instanceDefault)).toEqual(false);

    const ngControl = {
      _rawValidators: [new MockValidatorProxy(mockClass)],
      valueAccessor: {},
    };
    const injector = MockService(Injector);
    const instanceInjected = new mockClass(injector, ngControl);
    expect(isMockValidator(instanceInjected)).toEqual(true);
  });

  it('does not decorate directives by default', () => {
    const instanceReal = new TargetDirective();
    expect(isMockValidator(instanceReal)).toEqual(false);

    const mockClass = MockDirective(TargetDirective);
    const instanceDefault = new mockClass();
    expect(isMockValidator(instanceDefault)).toEqual(false);

    const ngControl = {
      _rawValidators: [new MockAsyncValidatorProxy(mockClass)],
      valueAccessor: {},
    };
    const injector = MockService(Injector);
    ngMocks.stub(injector, 'get');
    const instanceInjected = new mockClass(injector, ngControl);
    expect(isMockValidator(instanceInjected)).toEqual(true);
  });
});
