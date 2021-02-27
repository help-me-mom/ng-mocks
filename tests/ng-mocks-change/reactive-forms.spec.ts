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
describe('ng-mocks-change:reactive-forms:real', () => {
  beforeEach(() => MockBuilder(MyComponent).keep(MyModule));

  it('correctly changes CVA', () => {
    const component = MockRender(MyComponent).point.componentInstance;
    const valueAccessorEl = ngMocks.find([
      'data-testid',
      'inputControl',
    ]);

    // normal change
    expect(component.myControl.value).toEqual(null);
    ngMocks.change(valueAccessorEl, 123);
    expect(component.myControl.value).toEqual(123);
  });
});

// a mock version should behavior similarly but via our own interface
describe('ng-mocks-change:reactive-forms:mock', () => {
  beforeEach(() =>
    MockBuilder(MyComponent)
      .keep(MyModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly changes CVA', () => {
    const component = MockRender(MyComponent).point.componentInstance;
    const valueAccessorEl = ngMocks.find([
      'data-testid',
      'inputControl',
    ]);

    // normal change
    expect(component.myControl.value).toEqual(null);
    ngMocks.change(valueAccessorEl, 123);
    expect(component.myControl.value).toEqual(123);
  });

  it('throws on bad element', () => {
    const element = MockRender(MyComponent).point;
    expect(() => ngMocks.change(element, 123)).toThrowError(
      'Cannot find ControlValueAccessor on the element',
    );
  });

  it('throws on unknown CVA', () => {
    MockRender(MyComponent);
    const valueAccessorEl = ngMocks.find('custom');

    expect(() => ngMocks.change(valueAccessorEl, 123)).toThrowError(
      'Unsupported type of ControlValueAccessor',
    );
  });
});
