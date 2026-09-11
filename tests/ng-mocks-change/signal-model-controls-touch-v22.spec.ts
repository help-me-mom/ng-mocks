import {
  Component,
  input,
  model,
  output,
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
  selector: 'value-signal-model-touch-v22',
  template: '{{ value() }}:{{ touched() }}',
})
class ValueControl implements FormValueControl<string> {
  public readonly value = model('');
  public readonly touched = input(false);
  public readonly touch = output<void>();
}

@Component({
  selector: 'checkbox-signal-model-touch-v22',
  template: '{{ checked() }}:{{ touched() }}',
})
class CheckboxControl implements FormCheckboxControl {
  public readonly checked = model(false);
  public readonly touched = input(false);
  public readonly touch = output<void>();
}

@Component({
  selector: 'target-signal-model-touch-v22',
  imports: [FormField, ValueControl, CheckboxControl],
  template: `
    <value-signal-model-touch-v22 [formField]="f.name" />
    <checkbox-signal-model-touch-v22 [formField]="f.enabled" />
  `,
})
class TargetComponent {
  public readonly model = signal({ name: 'Ada', enabled: false });
  public readonly f = form(this.model);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14909
describe('ng-mocks-change:signal-model-controls-touch-v22', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular 22 spread targets exercise the dedicated touch output.
  if (
    !reflectComponentType(ValueControl)?.outputs.some(
      metadata => metadata.propName === 'touch',
    ) ||
    !reflectComponentType(CheckboxControl)?.outputs.some(
      metadata => metadata.propName === 'touch',
    )
  ) {
    it('needs compiled model and output metadata', () => {
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

      it('emits touch once for a value model without changing values or dirty state', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const child = ngMocks.find(ValueControl);
        const control = ngMocks.get(child, ValueControl);
        const touched = control.touched;
        const touches: unknown[] = [];
        const values: string[] = [];
        ngMocks
          .output(child, 'touch')
          .subscribe(next => touches.push(next));
        ngMocks
          .output(child, 'valueChange')
          .subscribe(next => values.push(next));

        // Angular 22 separates the touch event from the touched input signal.
        ngMocks.touch(child);
        fixture.detectChanges();

        expect(component.model()).toEqual({
          name: 'Ada',
          enabled: false,
        });
        expect(component.f.name().value()).toBe('Ada');
        expect(component.f.name().dirty()).toBe(false);
        expect(component.f.name().touched()).toBe(true);
        expect(control.value()).toBe('Ada');
        expect(control.touched).toBe(touched);
        expect(touched()).toBe(true);
        expect(touches).toEqual([undefined]);
        expect(values).toEqual([]);
        expect(component.f.enabled().dirty()).toBe(false);
        expect(component.f.enabled().touched()).toBe(false);
        expect(ngMocks.findInstance(CheckboxControl).checked()).toBe(
          false,
        );
        expect(ngMocks.findInstance(CheckboxControl).touched()).toBe(
          false,
        );
        if (mode === 'real') {
          expect(ngMocks.formatText(child)).toBe('Ada:true');
        }
      });

      it('emits touch once for a checked model without toggling it or touching a sibling', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const child = ngMocks.find(CheckboxControl);
        const control = ngMocks.get(child, CheckboxControl);
        const touched = control.touched;
        const touches: unknown[] = [];
        const values: boolean[] = [];
        ngMocks
          .output(child, 'touch')
          .subscribe(next => touches.push(next));
        ngMocks
          .output(child, 'checkedChange')
          .subscribe(next => values.push(next));

        ngMocks.touch(child);
        fixture.detectChanges();

        expect(component.model()).toEqual({
          name: 'Ada',
          enabled: false,
        });
        expect(component.f.enabled().value()).toBe(false);
        expect(component.f.enabled().dirty()).toBe(false);
        expect(component.f.enabled().touched()).toBe(true);
        expect(control.checked()).toBe(false);
        expect(control.touched).toBe(touched);
        expect(touched()).toBe(true);
        expect(touches).toEqual([undefined]);
        expect(values).toEqual([]);
        expect(component.f.name().dirty()).toBe(false);
        expect(component.f.name().touched()).toBe(false);
        expect(ngMocks.findInstance(ValueControl).value()).toBe(
          'Ada',
        );
        expect(ngMocks.findInstance(ValueControl).touched()).toBe(
          false,
        );
        if (mode === 'real') {
          expect(ngMocks.formatText(child)).toBe('false:true');
        }
      });
    });
  }
});
