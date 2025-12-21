import { Component, Directive, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: CvaDirective,
    },
  ],
  selector: 'custom',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class CvaDirective implements ControlValueAccessor {
  public registerOnChange = (fn: never) =>
    (this.customChangeClb = fn);
  public registerOnTouched = (fn: never) =>
    (this.customTouchedClb = fn);
  public setDisabledState = () => undefined;
  public writeValue = () => undefined;

  public customChangeClb() {}
  public customTouchedClb() {}
}

@Component({
  selector: 'target-ng-mocks-change-3341',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: ` <custom [formControl]="myControl"></custom> `,
})
class TargetComponent {
  public readonly myControl = new FormControl();
}

@NgModule({
  declarations: [TargetComponent, CvaDirective],
  exports: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/3341
describe('ng-mocks-change:3341', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('throws error about the default method', () => {
    MockRender(TargetComponent);
    const cvaEl = ngMocks.find('custom');

    try {
      ngMocks.change(cvaEl, 123);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `please ensure it has 'onChange' method`,
      );
    }
  });

  it('throws error with suggestions', () => {
    MockRender(TargetComponent);
    const cvaEl = ngMocks.find('custom');

    try {
      ngMocks.change(cvaEl, 123);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `customChangeClb, customTouchedClb`,
      );
    }
  });

  it('throws error about the wrongly provided method', () => {
    MockRender(TargetComponent);
    const cvaEl = ngMocks.find('custom');

    try {
      ngMocks.change(cvaEl, 123, 'triggerChange');
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `please ensure it has 'triggerChange' method`,
      );
    }
  });

  it('triggers change correctly', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const cvaEl = ngMocks.find('custom');

    expect(component.myControl.value).toEqual(null);
    ngMocks.change(cvaEl, 123, 'customChangeClb');
    expect(component.myControl.value).toEqual(123);
  });
});
