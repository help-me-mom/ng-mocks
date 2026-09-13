import {
  Component,
  model,
  reflectComponentType,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormValueControl,
} from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'signal-multi-select-control',
  template: `
    <select multiple (change)="changeSelection($any($event.target))">
      <option
        value="first"
        [selected]="value().indexOf('first') !== -1"
      >
        First
      </option>
      <option
        value="second"
        [selected]="value().indexOf('second') !== -1"
      >
        Second
      </option>
      <option
        value="third"
        [selected]="value().indexOf('third') !== -1"
      >
        Third
      </option>
    </select>
  `,
})
class MultiSelectControl implements FormValueControl<string[]> {
  public readonly value = model<string[]>([]);

  public changeSelection(select: HTMLSelectElement): void {
    const values: string[] = [];
    for (
      let index = 0;
      index < select.selectedOptions.length;
      index += 1
    ) {
      values.push(select.selectedOptions[index].value);
    }
    this.value.set(values);
  }
}

@Component({
  selector: 'target-signal-forms-multi-select',
  imports: [FormField, MultiSelectControl],
  template:
    '<signal-multi-select-control [formField]="f.multiSelectValue" />',
})
class TargetComponent {
  public readonly model = signal({
    multiSelectValue: ['first'],
    inputValue: 'Ada',
  });
  public readonly f = form(this.model);
}

describe('TestSignalForms:multi-select', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular-compiled spread targets exercise the custom array model binding.
  if (
    !reflectComponentType(MultiSelectControl)?.inputs.some(
      metadata => metadata.propName === 'value',
    )
  ) {
    it('needs compiled model metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  for (const mode of ['real', 'mock']) {
    describe(`${mode} control`, () => {
      beforeEach(() => {
        const builder = MockBuilder(TargetComponent)
          .keep(FormField)
          .keep(NG_MOCKS_ROOT_PROVIDERS);

        return mode === 'real'
          ? builder.keep(MultiSelectControl)
          : builder.mock(MultiSelectControl);
      });

      it('finds, reads, and changes the selected values', () => {
        // Render the component.
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;

        // Find the control.
        const host = ngMocks.reveal([
          'formField',
          component.f.multiSelectValue,
        ]);
        const control = ngMocks.get(host, MultiSelectControl);
        const values: string[][] = [];
        ngMocks
          .output(host, 'valueChange')
          .subscribe(value => values.push(value));

        // Read the value.
        expect(component.f.multiSelectValue().value()).toEqual([
          'first',
        ]);
        expect(control.value()).toEqual(['first']);
        if (mode === 'real') {
          // Find the select.
          const select = ngMocks.find(
            'signal-multi-select-control select',
          );
          expect(select.nativeElement.options[0].selected).toBe(true);
          expect(select.nativeElement.options[1].selected).toBe(
            false,
          );
          expect(select.nativeElement.options[2].selected).toBe(
            false,
          );
        }

        // Change the value.
        ngMocks.change(host, ['first', 'third']);
        fixture.detectChanges();

        // Assert the result.
        expect(component.model().multiSelectValue).toEqual([
          'first',
          'third',
        ]);
        expect(component.f.multiSelectValue().value()).toEqual([
          'first',
          'third',
        ]);
        expect(control.value()).toEqual(['first', 'third']);
        expect(values).toEqual([['first', 'third']]);
        expect(component.f.multiSelectValue().dirty()).toBe(true);
        expect(component.f.multiSelectValue().touched()).toBe(false);
        if (mode === 'real') {
          // Find the select.
          const select = ngMocks.find(
            'signal-multi-select-control select',
          );
          expect(select.nativeElement.options[0].selected).toBe(true);
          expect(select.nativeElement.options[1].selected).toBe(
            false,
          );
          expect(select.nativeElement.options[2].selected).toBe(true);
        }

        // Change the model.
        component.model.set({
          multiSelectValue: ['second'],
          inputValue: 'Ada',
        });
        fixture.detectChanges();

        // Assert the result.
        expect(component.f.multiSelectValue().value()).toEqual([
          'second',
        ]);
        expect(control.value()).toEqual(['second']);
        expect(values).toEqual([['first', 'third']]);
        expect(component.f.multiSelectValue().dirty()).toBe(true);
        expect(component.f.multiSelectValue().touched()).toBe(false);
        expect(component.model().inputValue).toBe('Ada');
        expect(component.f.inputValue().dirty()).toBe(false);
        expect(component.f.inputValue().touched()).toBe(false);
        if (mode === 'real') {
          // Find the select.
          const select = ngMocks.find(
            'signal-multi-select-control select',
          );
          expect(select.nativeElement.options[0].selected).toBe(
            false,
          );
          expect(select.nativeElement.options[1].selected).toBe(true);
          expect(select.nativeElement.options[2].selected).toBe(
            false,
          );
        }

        // Clear the selection through the same real or mocked host.
        ngMocks.change(host, []);
        fixture.detectChanges();

        // Assert the result.
        expect(component.model().multiSelectValue).toEqual([]);
        expect(component.f.multiSelectValue().value()).toEqual([]);
        expect(control.value()).toEqual([]);
        expect(values).toEqual([['first', 'third'], []]);
        expect(component.f.multiSelectValue().dirty()).toBe(true);
        expect(component.f.multiSelectValue().touched()).toBe(false);
        expect(component.model().inputValue).toBe('Ada');
        expect(component.f.inputValue().dirty()).toBe(false);
        expect(component.f.inputValue().touched()).toBe(false);
        if (mode === 'real') {
          // Find the select.
          const select = ngMocks.find(
            'signal-multi-select-control select',
          );
          expect(select.nativeElement.options[0].selected).toBe(
            false,
          );
          expect(select.nativeElement.options[1].selected).toBe(
            false,
          );
          expect(select.nativeElement.options[2].selected).toBe(
            false,
          );
          expect(select.nativeElement.selectedIndex).toBe(-1);
        }
      });

      if (mode === 'real') {
        it('updates the field through the real multi-select template', () => {
          // Render the component.
          const fixture = MockRender(TargetComponent);
          const component = fixture.point.componentInstance;

          // Find the control.
          const host = ngMocks.reveal([
            'formField',
            component.f.multiSelectValue,
          ]);

          // Find the select.
          const select = ngMocks.find(
            'signal-multi-select-control select',
          );

          // Read the selection rendered by the real child.
          expect(component.f.multiSelectValue().value()).toEqual([
            'first',
          ]);
          expect(select.nativeElement.options[0].selected).toBe(true);
          expect(select.nativeElement.options[1].selected).toBe(
            false,
          );
          expect(select.nativeElement.options[2].selected).toBe(
            false,
          );

          // Change the value.
          ngMocks.change(select, ['second', 'third']);
          fixture.detectChanges();

          // Assert the result.
          expect(component.model().multiSelectValue).toEqual([
            'second',
            'third',
          ]);
          expect(
            ngMocks.get(host, MultiSelectControl).value(),
          ).toEqual(['second', 'third']);
          expect(select.nativeElement.options[0].selected).toBe(
            false,
          );
          expect(select.nativeElement.options[1].selected).toBe(true);
          expect(select.nativeElement.options[2].selected).toBe(true);
          expect(component.model().inputValue).toBe('Ada');

          // Clear the selection through the child's native template.
          ngMocks.change(select, []);
          fixture.detectChanges();

          // Assert the result.
          expect(component.model().multiSelectValue).toEqual([]);
          expect(component.f.multiSelectValue().value()).toEqual([]);
          expect(
            ngMocks.get(host, MultiSelectControl).value(),
          ).toEqual([]);
          expect(select.nativeElement.options[0].selected).toBe(
            false,
          );
          expect(select.nativeElement.options[1].selected).toBe(
            false,
          );
          expect(select.nativeElement.options[2].selected).toBe(
            false,
          );
          expect(select.nativeElement.selectedIndex).toBe(-1);
          expect(component.model().inputValue).toBe('Ada');
        });
      }
    });
  }
});
