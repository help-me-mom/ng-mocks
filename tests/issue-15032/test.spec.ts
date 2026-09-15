import {
  ChangeDetectorRef,
  Component,
  forwardRef,
  InjectionToken,
  NgModule,
  Optional,
  Self,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  FormControl,
  FormControlDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgModel,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  isMockOf,
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

type InputValue = string | { value: string } | null;
const UI_CONTROL = new InjectionToken<CvaComponent>('UI_CONTROL');

@Component({
  selector: 'own-select-15032',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ inputValue }}',
  providers: [
    {
      provide: UI_CONTROL,
      useExisting: forwardRef(() => CvaComponent),
    },
  ],
})
class CvaComponent implements ControlValueAccessor {
  public inputValue: InputValue = null;
  public onChange: (value: InputValue) => void = () => undefined;
  public onTouched: () => void = () => undefined;

  // Some controls select themselves through NgControl without an accessor token.
  public constructor(@Optional() @Self() control: NgControl) {
    if (control) {
      control.valueAccessor = this;
    }
  }

  public writeValue(value: InputValue): void {
    this.inputValue = value;
  }

  public registerOnChange(
    callback: (value: InputValue) => void,
  ): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }
}

@Component({
  selector: 'target-15032',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <own-select-15032
      name="inputName"
      [(ngModel)]="inputValue"
      (ngModelChange)="changes.push($event)"
    ></own-select-15032>
    <own-select-15032
      name="controlName"
      [formControl]="inputControl"
    ></own-select-15032>
    <own-select-15032 name="unboundName"></own-select-15032>
  `,
})
class TargetComponent {
  public inputValue: InputValue = 'initial';
  public readonly inputControl: FormControl = new FormControl(
    'initial',
  );
  public readonly changes: InputValue[] = [];
}

@NgModule({
  declarations: [TargetComponent, CvaComponent],
  imports: [FormsModule, ReactiveFormsModule],
  exports: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15032
// An attached proxy does not prove that a mocked forms directive registered callbacks.
// Its inherited no-op simulation methods must not hide the existing binding fallbacks.
describe('issue-15032', () => {
  MockInstance.scope();

  for (const mode of ['TestBed', 'kept', 'mock child', 'mock all']) {
    describe(mode, () => {
      beforeEach(() => {
        if (mode === 'TestBed') {
          return TestBed.configureTestingModule({
            imports: [TargetModule],
          });
        }
        if (mode === 'mock all') {
          return MockBuilder(TargetComponent, TargetModule);
        }

        const builder =
          MockBuilder(TargetComponent).keep(TargetModule);
        return mode === 'mock child'
          ? builder.mock(CvaComponent)
          : builder;
      });

      beforeEach(() => {
        // Observe writes and registrations without replacing the proxy's own forwarding.
        MockInstance(CvaComponent, instance => {
          instance.inputValue = null;
          instance.writeValue = value => {
            instance.inputValue = value;
          };
          instance.registerOnChange = callback => {
            instance.onChange = callback;
          };
          instance.registerOnTouched = callback => {
            instance.onTouched = callback;
          };
        });
      });

      it('changes ngModel once and preserves the payload and reactive sibling', async () => {
        const fixture = MockRender(TargetComponent);
        await fixture.whenStable();
        const component = fixture.point.componentInstance;
        const updated = { value: 'updated' };

        // Connected CVAs use their callback; mocked bindings use ngModelChange.
        ngMocks.change('[name="inputName"]', updated);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.inputValue).toBe(updated);
        expect(component.changes.length).toBe(1);
        expect(component.changes[0]).toBe(updated);
        expect(ngMocks.input('[name="inputName"]', 'ngModel')).toBe(
          updated,
        );
        expect(component.inputControl.value).toBe('initial');
        expect(component.inputControl.pristine).toBe(true);
        expect(component.inputControl.untouched).toBe(true);
      });

      it('changes the supplied FormControl once without updating ngModel', async () => {
        const fixture = MockRender(TargetComponent);
        await fixture.whenStable();
        const component = fixture.point.componentInstance;
        const updated = { value: 'updated' };
        const values: InputValue[] = [];
        const subscription =
          component.inputControl.valueChanges.subscribe(value =>
            values.push(value),
          );

        ngMocks.change('[name="controlName"]', updated);
        fixture.detectChanges();
        subscription.unsubscribe();

        expect(component.inputControl.value).toBe(updated);
        expect(values.length).toBe(1);
        expect(values[0]).toBe(updated);
        expect(component.inputControl.untouched).toBe(true);
        // setValue on a mocked binding does not reproduce the forms directive's lifecycle.
        expect(component.inputControl.dirty).toBe(
          mode !== 'mock all',
        );
        expect(component.inputValue).toBe('initial');
        expect(component.changes).toEqual([]);
      });

      it('preserves local aliases and only forwards parent writes when forms are real', async () => {
        const fixture = MockRender(TargetComponent);
        await fixture.whenStable();
        const component = fixture.point.componentInstance;
        const input = ngMocks.find('[name="inputName"]');
        const control = ngMocks.find('[name="controlName"]');
        const inputChild = ngMocks.get(input, CvaComponent);
        const controlChild = ngMocks.get(control, CvaComponent);
        const model = ngMocks.get(input, NgModel);
        const binding = ngMocks.get(control, FormControlDirective);
        const modelControl = ngMocks.get(input, NgControl);
        const reactiveControl = ngMocks.get(control, NgControl);

        expect(input.componentInstance).toBe(inputChild);
        expect(control.componentInstance).toBe(controlChild);
        expect(input.injector.get(CvaComponent)).toBe(inputChild);
        expect(control.injector.get(CvaComponent)).toBe(controlChild);
        expect(input.injector.get(UI_CONTROL)).toBe(inputChild);
        expect(control.injector.get(UI_CONTROL)).toBe(controlChild);
        expect(input.providerTokens).not.toContain(NG_VALUE_ACCESSOR);
        expect(control.providerTokens).not.toContain(
          NG_VALUE_ACCESSOR,
        );
        expect(inputChild === controlChild).toBe(false);
        expect(isMockOf(model, NgModel)).toBe(mode === 'mock all');
        expect(isMockOf(binding, FormControlDirective)).toBe(
          mode === 'mock all',
        );
        expect(isMockOf(inputChild, CvaComponent)).toBe(
          mode === 'mock child' || mode === 'mock all',
        );
        expect(ngMocks.input(control, 'formControl')).toBe(
          component.inputControl,
        );

        if (mode === 'mock child' || mode === 'mock all') {
          // A correct instance can be attached even though no callback was registered.
          expect(
            (
              modelControl.valueAccessor as ControlValueAccessor & {
                instance: CvaComponent;
              }
            ).instance,
          ).toBe(inputChild);
          expect(
            (
              reactiveControl.valueAccessor as ControlValueAccessor & {
                instance: CvaComponent;
              }
            ).instance,
          ).toBe(controlChild);
          if (mode === 'mock child') {
            expect(
              (
                inputChild as CvaComponent & {
                  __simulateChange: (value: InputValue) => void;
                }
              ).__simulateChange,
            ).toBe(inputChild.onChange);
            expect(
              (
                controlChild as CvaComponent & {
                  __simulateTouch: () => void;
                }
              ).__simulateTouch,
            ).toBe(controlChild.onTouched);
          } else {
            expect(inputChild.onChange).toBeUndefined();
            expect(controlChild.onTouched).toBeUndefined();
          }
        } else {
          expect(modelControl.valueAccessor).toBe(inputChild);
          expect(reactiveControl.valueAccessor).toBe(controlChild);
        }
        expect(inputChild.inputValue).toBe(
          mode === 'mock all' ? null : 'initial',
        );
        expect(controlChild.inputValue).toBe(
          mode === 'mock all' ? null : 'initial',
        );

        const modelValue = { value: 'parent model' };
        const controlValue = { value: 'parent control' };
        component.inputValue = modelValue;
        component.inputControl.setValue(controlValue);
        fixture.point.injector.get(ChangeDetectorRef).markForCheck();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(ngMocks.input(input, 'ngModel')).toBe(modelValue);
        expect(ngMocks.input(control, 'formControl')).toBe(
          component.inputControl,
        );
        expect(inputChild.inputValue).toBe(
          mode === 'mock all' ? null : modelValue,
        );
        expect(controlChild.inputValue).toBe(
          mode === 'mock all' ? null : controlValue,
        );
        expect(component.changes).toEqual([]);
        expect(component.inputControl.pristine).toBe(true);
        expect(component.inputControl.untouched).toBe(true);
      });

      it('touches the supplied control without inventing a mocked NgModel touch contract', async () => {
        const fixture = MockRender(TargetComponent);
        await fixture.whenStable();
        const component = fixture.point.componentInstance;
        const input = ngMocks.find('[name="inputName"]');
        const values: InputValue[] = [];
        const subscription =
          component.inputControl.valueChanges.subscribe(value =>
            values.push(value),
          );

        // A real FormControl is available even when its binding and CVA are mocked.
        ngMocks.touch('[name="controlName"]');

        expect(component.inputControl.touched).toBe(true);
        expect(component.inputControl.pristine).toBe(true);
        expect(component.inputControl.value).toBe('initial');
        expect(component.inputValue).toBe('initial');
        expect(component.changes).toEqual([]);
        expect(values).toEqual([]);
        subscription.unsubscribe();

        if (mode === 'mock all') {
          // NgModel's mocked output supports changes, but it exposes no touch fallback.
          let message = '';
          try {
            ngMocks.touch(input);
          } catch (error) {
            message = (error as Error).message;
          }
          expect(message).toContain('ControlValueAccessor');
          expect(component.inputValue).toBe('initial');
          expect(component.changes).toEqual([]);
        } else {
          expect(ngMocks.get(input, NgModel).control.untouched).toBe(
            true,
          );
          ngMocks.touch(input);
          expect(ngMocks.get(input, NgModel).control.touched).toBe(
            true,
          );
          expect(component.inputValue).toBe('initial');
        }
      });

      if (mode === 'mock all') {
        it('prefers the registered change callback while allowing an unregistered touch fallback', async () => {
          const fixture = MockRender(TargetComponent);
          await fixture.whenStable();
          const component = fixture.point.componentInstance;
          const input = ngMocks.find('[name="controlName"]');
          const child = ngMocks.get(input, CvaComponent);
          const accessor = ngMocks.get(input, NgControl)
            .valueAccessor as ControlValueAccessor;
          const received: InputValue[] = [];
          const change = (value: InputValue): void => {
            received.push(value);
          };
          const updated = { value: 'registered' };

          // Register only change: it takes precedence over the real FormControl fallback.
          accessor.registerOnChange(change);
          expect(child.onChange).toBe(change);
          expect(
            (
              child as CvaComponent & {
                __simulateChange: (value: InputValue) => void;
              }
            ).__simulateChange,
          ).toBe(change);
          ngMocks.change(input, updated);

          expect(received.length).toBe(1);
          expect(received[0]).toBe(updated);
          expect(component.inputControl.value).toBe('initial');
          expect(component.inputValue).toBe('initial');
          expect(component.changes).toEqual([]);

          // Change registration must not falsely mark touch as connected too.
          ngMocks.touch(input);
          expect(component.inputControl.touched).toBe(true);
          expect(component.inputControl.pristine).toBe(true);
          expect(received.length).toBe(1);
        });

        it('prefers the registered touch callback while allowing an unregistered change fallback', async () => {
          const fixture = MockRender(TargetComponent);
          await fixture.whenStable();
          const component = fixture.point.componentInstance;
          const input = ngMocks.find('[name="controlName"]');
          const child = ngMocks.get(input, CvaComponent);
          const accessor = ngMocks.get(input, NgControl)
            .valueAccessor as ControlValueAccessor;
          const touches: string[] = [];
          const touch = (): void => {
            touches.push('touch');
          };

          // Register only touch: the callback, rather than markAsTouched, owns the operation.
          accessor.registerOnTouched(touch);
          expect(child.onTouched).toBe(touch);
          expect(
            (child as CvaComponent & { __simulateTouch: () => void })
              .__simulateTouch,
          ).toBe(touch);
          ngMocks.touch(input);

          expect(touches).toEqual(['touch']);
          expect(component.inputControl.untouched).toBe(true);
          const updated = { value: 'fallback' };
          const values: InputValue[] = [];
          const subscription =
            component.inputControl.valueChanges.subscribe(value =>
              values.push(value),
            );

          // Touch registration must not prevent change from reaching the supplied control.
          ngMocks.change(input, updated);
          subscription.unsubscribe();
          expect(component.inputControl.value).toBe(updated);
          expect(values.length).toBe(1);
          expect(values[0]).toBe(updated);
          expect(component.inputControl.untouched).toBe(true);
          expect(component.inputValue).toBe('initial');
          expect(component.changes).toEqual([]);
          expect(touches).toEqual(['touch']);
        });

        it('rejects changes and touches on an unbound mocked CVA', async () => {
          const fixture = MockRender(TargetComponent);
          await fixture.whenStable();
          const component = fixture.point.componentInstance;
          const input = ngMocks.find('[name="unboundName"]');
          const child = ngMocks.get(input, CvaComponent);

          expect(input.injector.get(UI_CONTROL)).toBe(child);
          expect(input.providerTokens).not.toContain(
            NG_VALUE_ACCESSOR,
          );
          let changeMessage = '';
          let touchMessage = '';
          try {
            ngMocks.change(input, 'unsupported');
          } catch (error) {
            changeMessage = (error as Error).message;
          }
          try {
            ngMocks.touch(input);
          } catch (error) {
            touchMessage = (error as Error).message;
          }

          expect(changeMessage).toContain('ControlValueAccessor');
          expect(touchMessage).toContain('ControlValueAccessor');
          expect(component.inputValue).toBe('initial');
          expect(component.inputControl.value).toBe('initial');
          expect(component.changes).toEqual([]);
        });
      }
    });
  }
});
