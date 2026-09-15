import {
  Component,
  forwardRef,
  InjectionToken,
  Optional,
  Self,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

import {
  isMockOf,
  MockBuilder,
  MockDirective,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

const UI_CONTROL = new InjectionToken<CvaComponent>('UI_CONTROL');

@Component({
  selector: 'own-policy-control-15033',
  template: '{{ inputValue }}',
  providers: [
    {
      provide: UI_CONTROL,
      useExisting: forwardRef(() => CvaComponent),
    },
  ],
})
class CvaComponent implements ControlValueAccessor {
  public inputValue = 'unwritten';
  public readonly writes: string[] = [];
  public readonly callbackValues: string[] = [];
  public callbackTouches = 0;
  public onChange = (value: string): void => {
    this.callbackValues.push(value);
  };
  public onTouched = (): void => {
    this.callbackTouches += 1;
  };

  // The control selects itself through NgControl and has no NG_VALUE_ACCESSOR provider.
  public constructor(@Optional() @Self() control: NgControl) {
    if (control) {
      control.valueAccessor = this;
    }
  }

  public writeValue(value: string): void {
    this.writes.push(value);
    this.inputValue = value;
  }

  public registerOnChange(callback: (value: string) => void): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }
}

@Component({
  selector: 'target-policy-15033',
  imports: [CvaComponent, FormField],
  template: `
    <own-policy-control-15033
      name="inputName"
      [formField]="inputForm.inputValue"
    />
    <own-policy-control-15033
      name="siblingName"
      [formField]="inputForm.siblingValue"
    />
  `,
})
class TargetComponent {
  public readonly inputModel = signal({
    inputValue: 'initial',
    siblingValue: 'unchanged',
  });
  public readonly inputForm = form(this.inputModel);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15033
// A real accessor can exist without a connection when FormField itself is mocked.
describe('issue-15033:policy', () => {
  for (const mode of ['TestBed', 'kept']) {
    describe(`${mode} control with mocked FormField`, () => {
      beforeEach(() => {
        if (mode === 'TestBed') {
          // Replace only the binding; the child's constructor still runs normally.
          return TestBed.configureTestingModule({
            imports: [TargetComponent],
          }).overrideComponent(TargetComponent, {
            remove: { imports: [FormField] },
            add: { imports: [MockDirective(FormField)] },
          });
        }

        return MockBuilder(TargetComponent)
          .keep(CvaComponent)
          .mock(FormField)
          .keep(NG_MOCKS_ROOT_PROVIDERS);
      });

      it('uses the mocked binding without writing or invoking the real child', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const field = component.inputForm.inputValue;
        const state = field();
        const input = ngMocks.find('[name="inputName"]');
        const child = ngMocks.get(input, CvaComponent);
        const values: string[] = [];
        const setValue = state.controlValue.set;
        let touches = 0;
        const markAsTouched = state.markAsTouched.bind(state);

        // Observe field operations while retaining their real Angular behavior.
        state.controlValue.set = value => {
          values.push(value);
          setValue(value);
        };
        state.markAsTouched = () => {
          touches += 1;
          markAsTouched();
        };

        expect(isMockOf(child, CvaComponent)).toBe(false);
        expect(
          isMockOf(ngMocks.get(input, FormField), FormField),
        ).toBe(true);
        expect(input.injector.get(UI_CONTROL)).toBe(child);
        expect(input.injector.get(NgControl).valueAccessor).toBe(
          child,
        );
        expect(input.providerTokens).not.toContain(NG_VALUE_ACCESSOR);
        expect(child.writes).toEqual([]);

        // Accessor existence does not replace the intentionally mocked field binding.
        ngMocks.change(input, 'updated');
        fixture.detectChanges();

        expect(component.inputModel()).toEqual({
          inputValue: 'updated',
          siblingValue: 'unchanged',
        });
        expect(values).toEqual(['updated']);
        expect(state.dirty()).toBe(true);
        expect(state.touched()).toBe(false);
        expect(touches).toBe(0);
        expect(component.inputForm.inputValue).toBe(field);
        expect(ngMocks.input(input, 'formField')).toBe(field);
        expect(child.inputValue).toBe('unwritten');
        expect(child.writes).toEqual([]);
        expect(child.callbackValues).toEqual([]);
        expect(child.callbackTouches).toBe(0);

        // Touch also belongs to the binding and does not invoke the child's callback.
        ngMocks.touch(input);

        expect(touches).toBe(1);
        expect(state.touched()).toBe(true);
        expect(values).toEqual(['updated']);
        expect(child.callbackTouches).toBe(0);
        expect(component.inputForm.siblingValue().value()).toBe(
          'unchanged',
        );
        expect(component.inputForm.siblingValue().dirty()).toBe(
          false,
        );
        expect(component.inputForm.siblingValue().touched()).toBe(
          false,
        );
      });
    });
  }

  describe('explicit callback names', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .keep(CvaComponent)
        .mock(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('honors requested real callbacks without also editing the mocked binding', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const initialModel = component.inputModel();
      const field = component.inputForm.inputValue;
      const input = ngMocks.find('[name="inputName"]');
      const child = ngMocks.get(input, CvaComponent);

      // An explicit method name requests the accessor path instead of the binding bridge.
      ngMocks.change(input, 'updated', 'onChange');
      ngMocks.touch(input, 'onTouched');

      expect(child.inputValue).toBe('updated');
      expect(child.writes).toEqual(['updated']);
      expect(child.callbackValues).toEqual(['updated']);
      expect(child.callbackTouches).toBe(1);
      expect(component.inputModel()).toBe(initialModel);
      expect(field().value()).toBe('initial');
      expect(field().dirty()).toBe(false);
      expect(field().touched()).toBe(false);
      expect(ngMocks.input(input, 'formField')).toBe(field);
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().touched()).toBe(
        false,
      );
    });
  });

  for (const mode of ['TestBed', 'kept', 'mock child']) {
    describe(`${mode} with real FormField`, () => {
      beforeEach(() => {
        if (mode === 'TestBed') {
          return TestBed.configureTestingModule({
            imports: [TargetComponent],
          });
        }

        const builder = MockBuilder(TargetComponent)
          .keep(FormField)
          .keep(NG_MOCKS_ROOT_PROVIDERS);
        return mode === 'kept'
          ? builder.keep(CvaComponent)
          : builder.mock(CvaComponent);
      });

      it('preserves one connected change and a separate touch on the selected field', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const field = component.inputForm.inputValue;
        const state = field();
        const input = ngMocks.find('[name="inputName"]');
        const child = ngMocks.get(input, CvaComponent);
        const accessor = input.injector.get(NgControl)
          .valueAccessor as ControlValueAccessor & {
          instance?: CvaComponent;
        };
        const values: string[] = [];
        const setValue = state.controlValue.set;
        let touches = 0;
        const markAsTouched = state.markAsTouched.bind(state);

        // Count the real field operations without changing the registered callbacks.
        state.controlValue.set = value => {
          values.push(value);
          setValue(value);
        };
        state.markAsTouched = () => {
          touches += 1;
          markAsTouched();
        };

        expect(
          isMockOf(ngMocks.get(input, FormField), FormField),
        ).toBe(false);
        expect(isMockOf(child, CvaComponent)).toBe(
          mode === 'mock child',
        );
        expect(input.injector.get(UI_CONTROL)).toBe(child);
        expect(accessor.instance || accessor).toBe(child);
        expect(input.providerTokens).not.toContain(NG_VALUE_ACCESSOR);

        // The existing FormField/CVA connection must handle the edit exactly once.
        ngMocks.change(input, 'updated');
        fixture.detectChanges();

        expect(component.inputModel()).toEqual({
          inputValue: 'updated',
          siblingValue: 'unchanged',
        });
        expect(values).toEqual(['updated']);
        expect(state.dirty()).toBe(true);
        expect(state.touched()).toBe(false);
        expect(touches).toBe(0);
        expect(component.inputForm.inputValue).toBe(field);
        expect(ngMocks.input(input, 'formField')).toBe(field);

        ngMocks.touch(input);

        expect(touches).toBe(1);
        expect(state.touched()).toBe(true);
        expect(values).toEqual(['updated']);
        expect(component.inputForm.siblingValue().value()).toBe(
          'unchanged',
        );
        expect(component.inputForm.siblingValue().dirty()).toBe(
          false,
        );
        expect(component.inputForm.siblingValue().touched()).toBe(
          false,
        );
      });
    });
  }
});
