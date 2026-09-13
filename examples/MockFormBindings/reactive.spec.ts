import {
  ChangeDetectorRef,
  Component,
  NgModule,
} from '@angular/core';
import {
  FormControl,
  FormControlDirective,
  ReactiveFormsModule,
} from '@angular/forms';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-form-bindings-reactive',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: ` <input [formControl]="inputValue" /> `,
})
class TargetComponent {
  public readonly inputValue = new FormControl('Ada');
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('MockFormBindings:reactive', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('updates the real control supplied to a mocked formControl binding', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.reveal([
      'formControl',
      component.inputValue,
    ]);

    // Read the binding and its real control value.
    expect(
      isMockOf(
        ngMocks.get(input, FormControlDirective),
        FormControlDirective,
      ),
    ).toBe(true);
    expect(ngMocks.input(input, 'formControl')).toBe(
      component.inputValue,
    );
    expect(component.inputValue.value).toBe('Ada');
    expect(input.nativeNode.value).toBe('');

    const values: Array<string | null> = [];
    const subscription = component.inputValue.valueChanges.subscribe(
      value => values.push(value),
    );

    // Change the supplied FormControl through its setValue fallback.
    ngMocks.change(input, 'Grace');
    subscription.unsubscribe();

    // Assert the result.
    expect(component.inputValue.value).toBe('Grace');
    expect(ngMocks.input(input, 'formControl')).toBe(
      component.inputValue,
    );
    expect(values).toEqual(['Grace']);
  });

  it('keeps the control reference without connecting parent writes to the native input', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input = ngMocks.reveal([
      'formControl',
      component.inputValue,
    ]);

    expect(ngMocks.input(input, 'formControl')).toBe(
      component.inputValue,
    );
    expect(input.nativeNode.value).toBe('');

    component.inputValue.setValue('Grace');
    fixture.point.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();

    expect(component.inputValue.value).toBe('Grace');
    expect(ngMocks.input(input, 'formControl')).toBe(
      component.inputValue,
    );
    expect(input.nativeNode.value).toBe('');
  });
});
