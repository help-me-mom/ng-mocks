import { Component, Directive, Injector } from '@angular/core';
import { NgControl } from '@angular/forms';

import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { ngMocks } from '../mock-helper/mock-helper';
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
    ngMocks.stub(injector, 'get');
    spyOn(injector, 'get')
      .withArgs(NgControl, undefined, 0b1010)
      .and.returnValue(ngControl);

    const instanceInjected = new mockClass(null, injector);
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
    ngMocks.stub(injector, 'get');
    spyOn(injector, 'get')
      .withArgs(NgControl, undefined, 0b1010)
      .and.returnValue(ngControl);

    const instanceInjected = new mockClass(injector);
    expect(isMockControlValueAccessor(instanceInjected)).toEqual(
      true,
    );
  });
});
