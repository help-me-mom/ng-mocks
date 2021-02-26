import { Component, Directive, Injector } from '@angular/core';

import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockService } from '../mock-service/mock-service';

import { isMockControlValueAccessor } from './func.is-mock-control-value-accessor';

@Component({
  selector: 'target',
  template: '',
})
class TargetComponent {
  public writeValue(obj: any) {
    return obj;
  }
}

@Directive({
  selector: '[target]',
})
class TargetDirective {
  public writeValue(obj: any) {
    return obj;
  }
}

describe('isMockControlValueAccessor', () => {
  it('does not decorate components by default', () => {
    const instanceReal = new TargetComponent();
    expect(isMockControlValueAccessor(instanceReal)).toEqual(false);

    const mockClass = MockComponent(TargetComponent);
    const instanceDefault = new mockClass();
    expect(isMockControlValueAccessor(instanceDefault)).toEqual(
      false,
    );

    const ngControl = {};
    const injector = MockService(Injector);
    const instanceInjected = new mockClass(null, injector, ngControl);
    expect(isMockControlValueAccessor(instanceInjected)).toEqual(
      true,
    );
  });

  it('does not decorate directives by default', () => {
    const instanceReal = new TargetDirective();
    expect(isMockControlValueAccessor(instanceReal)).toEqual(false);

    const mockClass = MockDirective(TargetDirective);
    const instanceDefault = new mockClass();
    expect(isMockControlValueAccessor(instanceDefault)).toEqual(
      false,
    );

    const ngControl = {};
    const injector = MockService(Injector);
    const instanceInjected = new mockClass(injector, ngControl);
    expect(isMockControlValueAccessor(instanceInjected)).toEqual(
      true,
    );
  });
});
