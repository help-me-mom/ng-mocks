import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

interface InputValue {
  label: string;
}

@Directive()
class ValueControlBase {
  // Angular connects public aliases, even when the pair is inherited.
  @Input('value') public inputValue: InputValue = { label: '' };
  @Output('valueChange')
  public readonly inputValueChange = new EventEmitter<InputValue>();
}

@Component({
  selector: 'value-classic-model-control',
  template: '{{ inputValue.label }}',
})
class ValueControl extends ValueControlBase {}

@Component({
  selector: 'checkbox-classic-model-control',
  template: '{{ checked }}',
})
class CheckboxControl {
  @Input() public checked = false;
  @Output() public readonly checkedChange =
    new EventEmitter<boolean>();
}

@Component({
  selector: 'dual-classic-model-control',
  template: '{{ value }}',
})
class DualControl {
  // Declaration order must not override Angular's preference for the value pair.
  @Input() public checked = false;
  @Output() public readonly checkedChange =
    new EventEmitter<boolean>();
  @Input() public value = false;
  @Output() public readonly valueChange = new EventEmitter<boolean>();
}

@Component({
  selector: 'target-classic-model-controls',
  imports: [FormField, ValueControl, CheckboxControl, DualControl],
  template: `
    <value-classic-model-control
      class="value"
      [formField]="inputForm.inputValue"
    />
    <value-classic-model-control
      class="sibling"
      [formField]="inputForm.siblingValue"
    />
    <checkbox-classic-model-control
      [formField]="inputForm.checkboxValue"
    />
    <dual-classic-model-control [formField]="inputForm.dualValue" />
  `,
})
class TargetComponent {
  public readonly inputModel = signal({
    inputValue: { label: 'initial' },
    siblingValue: { label: 'sibling' },
    checkboxValue: false,
    dualValue: false,
  });
  public readonly inputForm = form(this.inputModel);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15034
describe('ng-mocks-change:classic-model-controls', () => {
  for (const mode of ['kept', 'mocked']) {
    describe(`${mode} controls`, () => {
      beforeEach(() => {
        // Keep Angular's binding real so it owns output subscriptions and field state.
        const builder = MockBuilder(TargetComponent)
          .keep(FormField)
          .keep(NG_MOCKS_ROOT_PROVIDERS);

        return mode === 'kept'
          ? builder
              .keep(ValueControl)
              .keep(CheckboxControl)
              .keep(DualControl)
          : builder
              .mock(ValueControl)
              .mock(CheckboxControl)
              .mock(DualControl);
      });

      it('changes an inherited aliased value pair without changing its sibling', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const input = ngMocks.find('.value');
        const control = ngMocks.get(input, ValueControl);
        const siblingValue = component.inputModel().siblingValue;
        const values: InputValue[] = [];
        ngMocks
          .output(input, 'valueChange')
          .subscribe(value => values.push(value));

        expect(control.inputValue).toBe(
          component.inputModel().inputValue,
        );

        // Preserve the object itself while Angular receives the public output alias.
        const inputValue = { label: 'updated' };
        ngMocks.change(input, inputValue);
        fixture.detectChanges();

        expect(component.inputModel().inputValue).toBe(inputValue);
        expect(component.inputForm.inputValue().value()).toBe(
          inputValue,
        );
        expect(control.inputValue).toBe(inputValue);
        expect(values).toEqual([inputValue]);
        expect(values[0]).toBe(inputValue);
        expect(component.inputForm.inputValue().dirty()).toBe(true);
        expect(component.inputForm.inputValue().touched()).toBe(
          false,
        );
        expect(component.inputModel().siblingValue).toBe(
          siblingValue,
        );
        expect(ngMocks.get('.sibling', ValueControl).inputValue).toBe(
          siblingValue,
        );
        expect(component.inputForm.siblingValue().dirty()).toBe(
          false,
        );
        expect(component.inputForm.siblingValue().touched()).toBe(
          false,
        );
      });

      it('changes a checked pair in both directions without touching it', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const control = ngMocks.findInstance(CheckboxControl);
        const values: boolean[] = [];
        ngMocks
          .output('checkbox-classic-model-control', 'checkedChange')
          .subscribe(value => values.push(value));

        // Both edits use the connected checkedChange output rather than a DOM checkbox.
        ngMocks.change(CheckboxControl, true);
        fixture.detectChanges();

        expect(component.inputModel().checkboxValue).toBe(true);
        expect(control.checked).toBe(true);
        expect(component.inputForm.checkboxValue().dirty()).toBe(
          true,
        );
        expect(component.inputForm.checkboxValue().touched()).toBe(
          false,
        );

        ngMocks.change(CheckboxControl, false);
        fixture.detectChanges();

        expect(component.inputModel().checkboxValue).toBe(false);
        expect(control.checked).toBe(false);
        expect(values).toEqual([true, false]);
        expect(component.inputForm.checkboxValue().dirty()).toBe(
          true,
        );
        expect(component.inputForm.checkboxValue().touched()).toBe(
          false,
        );
        expect(component.inputForm.inputValue().dirty()).toBe(false);
        expect(component.inputForm.siblingValue().dirty()).toBe(
          false,
        );
        expect(component.inputForm.dualValue().dirty()).toBe(false);
      });

      it('uses valueChange when the same control also declares checkedChange first', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const control = ngMocks.findInstance(DualControl);
        const values: boolean[] = [];
        const checkedValues: boolean[] = [];
        ngMocks
          .output('dual-classic-model-control', 'valueChange')
          .subscribe(value => values.push(value));
        ngMocks
          .output('dual-classic-model-control', 'checkedChange')
          .subscribe(value => checkedValues.push(value));

        // Angular selects value/valueChange, so emitting checkedChange would miss the field.
        ngMocks.change(DualControl, true);
        fixture.detectChanges();

        expect(component.inputModel().dualValue).toBe(true);
        expect(control.value).toBe(true);
        expect(values).toEqual([true]);
        expect(checkedValues).toEqual([]);
        expect(component.inputForm.dualValue().dirty()).toBe(true);
        expect(component.inputForm.dualValue().touched()).toBe(false);
        expect(component.inputModel().checkboxValue).toBe(false);
        expect(component.inputForm.checkboxValue().dirty()).toBe(
          false,
        );
      });

      it('writes parent values without emitting child changes or marking fields dirty', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const values: InputValue[] = [];
        const checkedValues: boolean[] = [];
        const dualValues: boolean[] = [];
        ngMocks
          .output('.value', 'valueChange')
          .subscribe(value => values.push(value));
        ngMocks
          .output('checkbox-classic-model-control', 'checkedChange')
          .subscribe(value => checkedValues.push(value));
        ngMocks
          .output('dual-classic-model-control', 'valueChange')
          .subscribe(value => dualValues.push(value));

        // A model write updates inputs; it is not an edit originating from the child.
        const inputValue = { label: 'parent' };
        const siblingValue = component.inputModel().siblingValue;
        component.inputModel.set({
          inputValue,
          siblingValue,
          checkboxValue: true,
          dualValue: true,
        });
        fixture.detectChanges();

        expect(ngMocks.get('.value', ValueControl).inputValue).toBe(
          inputValue,
        );
        expect(ngMocks.get('.sibling', ValueControl).inputValue).toBe(
          siblingValue,
        );
        expect(ngMocks.findInstance(CheckboxControl).checked).toBe(
          true,
        );
        expect(ngMocks.findInstance(DualControl).value).toBe(true);
        expect(values).toEqual([]);
        expect(checkedValues).toEqual([]);
        expect(dualValues).toEqual([]);
        expect(component.inputForm.inputValue().dirty()).toBe(false);
        expect(component.inputForm.inputValue().touched()).toBe(
          false,
        );
        expect(component.inputForm.siblingValue().dirty()).toBe(
          false,
        );
        expect(component.inputForm.siblingValue().touched()).toBe(
          false,
        );
        expect(component.inputForm.checkboxValue().dirty()).toBe(
          false,
        );
        expect(component.inputForm.checkboxValue().touched()).toBe(
          false,
        );
        expect(component.inputForm.dualValue().dirty()).toBe(false);
        expect(component.inputForm.dualValue().touched()).toBe(false);
      });
    });
  }
});
