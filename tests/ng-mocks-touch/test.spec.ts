import { Component, Directive, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  DefaultValueAccessor,
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
      useExisting: CustomDirective,
    },
  ],
  selector: 'custom',
})
class CustomDirective implements ControlValueAccessor {
  public registerOnChange = () => undefined;
  public registerOnTouched = () => undefined;
  public setDisabledState = () => undefined;
  public writeValue = () => undefined;
}

@Component({
  selector: 'target-ng-mocks-touch',
  template: `
    <input data-testid="inputControl" [formControl]="myControl" />
    <custom [formControl]="myControl"></custom>
  `,
})
class TargetComponent {
  public readonly myControl = new FormControl();
}

@NgModule({
  declarations: [TargetComponent, CustomDirective],
  exports: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// checking how normal form works
describe('ng-mocks-touch:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('correctly touches CVA', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const valueAccessorEl = ngMocks.find([
      'data-testid',
      'inputControl',
    ]);

    // normal touch
    expect(component.myControl.touched).toEqual(false);
    ngMocks.touch(valueAccessorEl);
    expect(component.myControl.touched).toEqual(true);
  });
});

// a mock version should behavior similarly but via our own interface
describe('ng-mocks-touch:mock', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(TargetModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly touches CVA', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const valueAccessorEl = ngMocks.find([
      'data-testid',
      'inputControl',
    ]);

    // normal touch
    expect(component.myControl.touched).toEqual(false);
    ngMocks.touch(valueAccessorEl);
    expect(component.myControl.touched).toEqual(true);
  });

  it('throws on bad element', () => {
    const element = MockRender(TargetComponent).point;
    expect(() => ngMocks.touch(element)).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );
  });

  it('throws on unknown CVA', () => {
    MockRender(TargetComponent);
    const valueAccessorEl = ngMocks.find('custom');

    expect(() => ngMocks.touch(valueAccessorEl)).toThrowError(
      /Unsupported type of ControlValueAccessor/,
    );
  });
});
