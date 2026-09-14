import { Component, NgModule } from '@angular/core';
import {
  DefaultValueAccessor,
  FormControl,
  FormControlName,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-form-bindings-groups',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <form [formGroup]="form">
      <input formControlName="inputValue" />
    </form>
  `,
})
class TargetComponent {
  public readonly form = new FormGroup({
    inputValue: new FormControl('Ada'),
  });
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('MockFormBindings:groups', () => {
  // Mock the directives to inspect the group and name supplied by the parent.
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('preserves the group and control name without connecting the native input', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the bound group and named input.
    const form = ngMocks.reveal(['formGroup', component.form]);
    const input = ngMocks.reveal(['formControlName', 'inputValue']);

    // Read the bindings.
    expect(
      isMockOf(
        ngMocks.get(form, FormGroupDirective),
        FormGroupDirective,
      ),
    ).toBe(true);
    expect(
      isMockOf(ngMocks.get(input, FormControlName), FormControlName),
    ).toBe(true);
    expect(
      isMockOf(
        ngMocks.get(input, DefaultValueAccessor),
        DefaultValueAccessor,
      ),
    ).toBe(true);
    expect(ngMocks.input(form, 'formGroup')).toBe(component.form);
    expect(ngMocks.input(input, 'formControlName')).toBe(
      'inputValue',
    );
    expect(component.form.value).toEqual({ inputValue: 'Ada' });
    expect(input.nativeNode.value).toBe('');

    // Change the native input through its mocked value accessor.
    ngMocks.change(input, 'Grace');
    fixture.detectChanges();

    // The native value changes without updating the disconnected group.
    expect(component.form.value).toEqual({ inputValue: 'Ada' });
    expect(ngMocks.input(form, 'formGroup')).toBe(component.form);
    expect(ngMocks.input(input, 'formControlName')).toBe(
      'inputValue',
    );
    expect(input.nativeNode.value).toBe('Grace');
  });
});
