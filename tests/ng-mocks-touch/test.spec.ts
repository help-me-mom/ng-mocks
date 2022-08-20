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
  selector: 'my',
  template: `
    <input data-testid="inputControl" [formControl]="myControl" />
    <custom [formControl]="myControl"></custom>
  `,
})
class MyComponent {
  public readonly myControl = new FormControl();
}

@NgModule({
  declarations: [MyComponent, CustomDirective],
  exports: [MyComponent],
  imports: [ReactiveFormsModule],
})
class MyModule {}

// checking how normal form works
describe('ng-mocks-touch:real', () => {
  beforeEach(() => MockBuilder(MyComponent).keep(MyModule));

  it('correctly touches CVA', () => {
    const component = MockRender(MyComponent).point.componentInstance;
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
    MockBuilder(MyComponent)
      .keep(MyModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly touches CVA', () => {
    const component = MockRender(MyComponent).point.componentInstance;
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
    const element = MockRender(MyComponent).point;
    expect(() => ngMocks.touch(element)).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );
  });

  it('throws on unknown CVA', () => {
    MockRender(MyComponent);
    const valueAccessorEl = ngMocks.find('custom');

    expect(() => ngMocks.touch(valueAccessorEl)).toThrowError(
      /Unsupported type of ControlValueAccessor/,
    );
  });
});
