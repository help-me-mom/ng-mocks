import {
  Component,
  isSignal,
  model,
  reflectComponentType,
  signal,
} from '@angular/core';
import {
  form,
  FormCheckboxControl,
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
  selector: 'value-signal-model-control',
  template: '{{ value() }}',
})
class ValueControl implements FormValueControl<string> {
  public readonly value = model('');
}

@Component({
  selector: 'checkbox-signal-model-control',
  template: '{{ checked() }}',
})
class CheckboxControl implements FormCheckboxControl {
  public readonly checked = model(false);
}

@Component({
  selector: 'target-signal-model-controls',
  imports: [FormField, ValueControl, CheckboxControl],
  template: `
    <value-signal-model-control class="value" [formField]="f.name" />
    <checkbox-signal-model-control [formField]="f.enabled" />
    <value-signal-model-control
      class="sibling"
      [formField]="f.sibling"
    />
    <span class="summary"
      >{{ model().name }}:{{ model().enabled }}</span
    >
  `,
})
class TargetComponent {
  public readonly model = signal({
    name: 'Ada',
    enabled: false,
    sibling: 'unchanged',
  });
  public readonly f = form(this.model);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14909
describe('ng-mocks-change:signal-model-controls', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular-compiled spread targets exercise the signal form model bindings.
  if (
    !reflectComponentType(ValueControl)?.inputs.some(
      metadata => metadata.propName === 'value',
    ) ||
    !reflectComponentType(CheckboxControl)?.inputs.some(
      metadata => metadata.propName === 'checked',
    )
  ) {
    it('needs compiled model metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  for (const mode of ['real', 'mock']) {
    describe(`${mode} controls`, () => {
      beforeEach(() => {
        const builder = MockBuilder(TargetComponent)
          .keep(FormField)
          .keep(NG_MOCKS_ROOT_PROVIDERS);

        return mode === 'real'
          ? builder.keep(ValueControl).keep(CheckboxControl)
          : builder.mock(ValueControl).mock(CheckboxControl);
      });

      it('changes the value model without touching it or changing a sibling', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const child = ngMocks.find('.value');
        const control = ngMocks.get(child, ValueControl);
        const value = control.value;
        const values: string[] = [];
        const blurs: string[] = [];
        child.nativeElement.addEventListener('blur', () =>
          blurs.push('blur'),
        );
        ngMocks
          .output(child, 'valueChange')
          .subscribe(next => values.push(next));

        expect(isSignal(value)).toBe(true);
        expect(value()).toBe('Ada');

        // A custom signal control emits its model output, not a CVA callback or DOM input.
        ngMocks.change(child, 'Grace');
        fixture.detectChanges();

        expect(component.model()).toEqual({
          name: 'Grace',
          enabled: false,
          sibling: 'unchanged',
        });
        expect(control.value).toBe(value);
        expect(value()).toBe('Grace');
        expect(values).toEqual(['Grace']);
        expect(blurs).toEqual([]);
        expect(component.f.name().value()).toBe('Grace');
        expect(component.f.name().dirty()).toBe(true);
        expect(component.f.name().touched()).toBe(false);
        expect(component.f.enabled().dirty()).toBe(false);
        expect(component.f.enabled().touched()).toBe(false);
        expect(component.f.sibling().dirty()).toBe(false);
        expect(component.f.sibling().touched()).toBe(false);
        expect(ngMocks.get('.sibling', ValueControl).value()).toBe(
          'unchanged',
        );
        expect(ngMocks.formatText(ngMocks.find('.summary'))).toBe(
          'Grace:false',
        );
        if (mode === 'real') {
          expect(ngMocks.formatText(child)).toBe('Grace');
        }
      });

      it('changes the checked model in both directions without changing other fields', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const child = ngMocks.find(CheckboxControl);
        const control = ngMocks.get(child, CheckboxControl);
        const checked = control.checked;
        const values: boolean[] = [];
        const blurs: string[] = [];
        child.nativeElement.addEventListener('blur', () =>
          blurs.push('blur'),
        );
        ngMocks
          .output(child, 'checkedChange')
          .subscribe(next => values.push(next));

        expect(isSignal(checked)).toBe(true);
        expect(checked()).toBe(false);

        ngMocks.change(child, true);
        fixture.detectChanges();

        expect(component.model()).toEqual({
          name: 'Ada',
          enabled: true,
          sibling: 'unchanged',
        });
        expect(control.checked).toBe(checked);
        expect(checked()).toBe(true);
        expect(component.f.enabled().value()).toBe(true);
        expect(component.f.enabled().dirty()).toBe(true);
        expect(component.f.enabled().touched()).toBe(false);
        expect(ngMocks.formatText(ngMocks.find('.summary'))).toBe(
          'Ada:true',
        );
        if (mode === 'real') {
          expect(ngMocks.formatText(child)).toBe('true');
        }

        ngMocks.change(child, false);
        fixture.detectChanges();

        expect(component.model()).toEqual({
          name: 'Ada',
          enabled: false,
          sibling: 'unchanged',
        });
        expect(control.checked).toBe(checked);
        expect(checked()).toBe(false);
        expect(values).toEqual([true, false]);
        expect(blurs).toEqual([]);
        expect(component.f.enabled().dirty()).toBe(true);
        expect(component.f.enabled().touched()).toBe(false);
        expect(component.f.name().dirty()).toBe(false);
        expect(component.f.name().touched()).toBe(false);
        expect(component.f.sibling().dirty()).toBe(false);
        expect(component.f.sibling().touched()).toBe(false);
        expect(ngMocks.get('.value', ValueControl).value()).toBe(
          'Ada',
        );
        expect(ngMocks.get('.sibling', ValueControl).value()).toBe(
          'unchanged',
        );
        expect(ngMocks.formatText(ngMocks.find('.summary'))).toBe(
          'Ada:false',
        );
        if (mode === 'real') {
          expect(ngMocks.formatText(child)).toBe('false');
        }
      });

      it('renders parent model writes without emitting child changes or marking fields dirty', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const valueElement = ngMocks.find('.value');
        const checkboxElement = ngMocks.find(CheckboxControl);
        const valueControl = ngMocks.get(valueElement, ValueControl);
        const checkboxControl = ngMocks.get(
          checkboxElement,
          CheckboxControl,
        );
        const value = valueControl.value;
        const checked = checkboxControl.checked;
        const values: string[] = [];
        const checkedValues: boolean[] = [];
        ngMocks
          .output(valueElement, 'valueChange')
          .subscribe(next => values.push(next));
        ngMocks
          .output(checkboxElement, 'checkedChange')
          .subscribe(next => checkedValues.push(next));

        component.model.set({
          name: 'Katherine',
          enabled: true,
          sibling: 'unchanged',
        });
        fixture.detectChanges();

        expect(valueControl.value).toBe(value);
        expect(checkboxControl.checked).toBe(checked);
        expect(value()).toBe('Katherine');
        expect(checked()).toBe(true);
        expect(values).toEqual([]);
        expect(checkedValues).toEqual([]);
        expect(component.f.name().value()).toBe('Katherine');
        expect(component.f.name().dirty()).toBe(false);
        expect(component.f.name().touched()).toBe(false);
        expect(component.f.enabled().value()).toBe(true);
        expect(component.f.enabled().dirty()).toBe(false);
        expect(component.f.enabled().touched()).toBe(false);
        expect(component.f.sibling().dirty()).toBe(false);
        expect(component.f.sibling().touched()).toBe(false);
        expect(ngMocks.get('.sibling', ValueControl).value()).toBe(
          'unchanged',
        );
        expect(ngMocks.formatText(ngMocks.find('.summary'))).toBe(
          'Katherine:true',
        );
        if (mode === 'real') {
          expect(ngMocks.formatText(valueElement)).toBe('Katherine');
          expect(ngMocks.formatText(checkboxElement)).toBe('true');
        }
      });
    });
  }
});
