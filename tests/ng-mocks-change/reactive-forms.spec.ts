import { Component, Directive, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  DefaultValueAccessor,
  FormControl,
  FormsModule,
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
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class CustomDirective implements ControlValueAccessor {
  public registerOnChange = () => undefined;
  public registerOnTouched = () => undefined;
  public setDisabledState = () => undefined;
  public writeValue = () => undefined;
}

@Component({
  selector: 'target-ng-mocks-change-reactive-forms',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input data-testid="inputControl" [formControl]="myControl" />
    <input data-testid="ngModel" [(ngModel)]="value" />
    <custom [formControl]="myControl"></custom>
  `,
})
class TargetComponent {
  public readonly myControl = new FormControl();
  public value: any = null;
}

@NgModule({
  declarations: [TargetComponent, CustomDirective],
  exports: [TargetComponent],
  imports: [ReactiveFormsModule, FormsModule],
})
class TargetModule {}

// checking how normal form works
describe('ng-mocks-change:reactive-forms:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('correctly changes CVA', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
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
    MockBuilder(TargetComponent)
      .keep(TargetModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly changes CVA', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const valueAccessorEl = ngMocks.find([
      'data-testid',
      'inputControl',
    ]);

    // normal change
    expect(component.myControl.value).toEqual(null);
    ngMocks.change(valueAccessorEl, 123);
    expect(component.myControl.value).toEqual(123);
  });

  it('correctly changes ngModel', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const valueAccessorEl = ngMocks.find(['data-testid', 'ngModel']);

    // normal change
    expect(component.value).toEqual(null);
    ngMocks.change(valueAccessorEl, 123);
    expect(component.value).toEqual(123);
  });

  it('throws on bad element', () => {
    const element = MockRender(TargetComponent).point;
    try {
      ngMocks.change(element, 123);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `Cannot find ControlValueAccessor on the element`,
      );
    }
  });

  it('throws on unknown CVA', () => {
    MockRender(TargetComponent);
    const valueAccessorEl = ngMocks.find('custom');

    try {
      ngMocks.change(valueAccessorEl, 123);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `Unsupported type of ControlValueAccessor`,
      );
    }
  });
});
