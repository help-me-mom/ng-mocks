import {
  Component,
  forwardRef,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  FormControl,
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

const UI_CONTROL = new InjectionToken<CvaComponent>('UI_CONTROL');

@Component({
  selector: 'cva-15030',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ value }}',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
    {
      provide: UI_CONTROL,
      useExisting: forwardRef(() => CvaComponent),
    },
  ],
})
class CvaComponent implements ControlValueAccessor {
  public value = '';
  public disabled = false;
  public _controlValueAccessorChangeFn: (value: string) => void =
    () => undefined;
  public onTouched: () => void = () => undefined;

  public registerOnChange(callback: (value: string) => void): void {
    this._controlValueAccessorChangeFn = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }

  public writeValue(value: string): void {
    this.value = value;
  }

  public setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}

@Component({
  selector: 'target-15030',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <cva-15030
      name="inputName"
      [formControl]="inputControl"
    ></cva-15030>
    <cva-15030
      name="modelName"
      [(ngModel)]="inputValue"
      (ngModelChange)="changes.push($event)"
    ></cva-15030>
  `,
})
class TargetComponent {
  public readonly inputControl = new FormControl('initial');
  public inputValue = 'sibling';
  public readonly changes: string[] = [];
}

@NgModule({
  declarations: [TargetComponent, CvaComponent],
  imports: [FormsModule, ReactiveFormsModule],
  exports: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15030
// Some CVAs store Angular's registered callback under this Material-style name.
// The custom host has no input/change listener to bypass callback discovery.
describe('issue-15030', () => {
  MockInstance.scope();

  for (const mode of ['TestBed', 'kept', 'mock']) {
    describe(mode, () => {
      beforeEach(() => {
        if (mode === 'TestBed') {
          return TestBed.configureTestingModule({
            imports: [TargetModule],
          });
        }
        const builder =
          MockBuilder(TargetComponent).keep(TargetModule);
        return mode === 'mock' ? builder.mock(CvaComponent) : builder;
      });

      it('changes a reactive control once without touching it or its sibling', async () => {
        const fixture = MockRender(TargetComponent);
        await fixture.whenStable();
        const component = fixture.point.componentInstance;
        const values: Array<string | null> = [];
        const subscription =
          component.inputControl.valueChanges.subscribe(value =>
            values.push(value),
          );

        ngMocks.change('[name="inputName"]', 'updated');
        fixture.detectChanges();
        subscription.unsubscribe();

        expect(component.inputControl.value).toBe('updated');
        expect(values).toEqual(['updated']);
        expect(component.inputControl.dirty).toBe(true);
        expect(component.inputControl.touched).toBe(false);
        expect(component.inputValue).toBe('sibling');
        expect(component.changes).toEqual([]);
        const sibling = ngMocks.get(
          ngMocks.find('[name="modelName"]'),
          NgModel,
        ).control;
        expect(sibling.dirty).toBe(false);
        expect(sibling.touched).toBe(false);
      });

      it('changes ngModel once without editing the reactive sibling', async () => {
        const fixture = MockRender(TargetComponent);
        await fixture.whenStable();
        const component = fixture.point.componentInstance;
        const input = ngMocks.find('[name="modelName"]');

        ngMocks.change(input, 'updated');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.inputValue).toBe('updated');
        expect(component.changes).toEqual(['updated']);
        expect(ngMocks.get(input, NgModel).control.dirty).toBe(true);
        expect(ngMocks.get(input, NgModel).control.touched).toBe(
          false,
        );
        expect(component.inputControl.value).toBe('initial');
        expect(component.inputControl.dirty).toBe(false);
        expect(component.inputControl.touched).toBe(false);
      });

      it('preserves explicit callbacks, aliases, writes, touch and disabled state', async () => {
        const writes: Array<string | null> = [];
        MockInstance(
          CvaComponent,
          'writeValue',
          (value: string | null) => writes.push(value),
        );
        const fixture = MockRender(TargetComponent);
        await fixture.whenStable();
        const component = fixture.point.componentInstance;
        const input = ngMocks.find('[name="inputName"]');
        const child = ngMocks.get(input, CvaComponent);
        const accessor = input.injector.get(NG_VALUE_ACCESSOR)[0];

        expect(input.componentInstance).toBe(child);
        expect(input.injector.get(UI_CONTROL)).toBe(child);
        // Older Angular versions type this multi-token as a single accessor.
        expect<object>(input.injector.get(NG_VALUE_ACCESSOR)).toEqual(
          [accessor],
        );
        expect(ngMocks.get(input, NgControl).valueAccessor).toBe(
          accessor,
        );
        expect(isMockOf(child, CvaComponent)).toBe(mode === 'mock');
        if (mode === 'mock') {
          expect(
            (
              accessor as ControlValueAccessor & {
                instance: CvaComponent;
              }
            ).instance,
          ).toBe(child);
          expect(writes).toContain('initial');
        } else {
          expect(accessor).toBe(child);
          expect(child.value).toBe('initial');
        }

        component.inputControl.setValue('parent');
        fixture.detectChanges();
        if (mode === 'mock') {
          expect(writes).toContain('parent');
        } else {
          expect(child.value).toBe('parent');
        }
        expect(component.inputControl.dirty).toBe(false);

        // Touch is a separate callback; it must not write a value or mark an edit.
        ngMocks.touch(input);
        expect(component.inputControl.touched).toBe(true);
        expect(component.inputControl.dirty).toBe(false);
        expect(component.inputControl.value).toBe('parent');

        const values: Array<string | null> = [];
        const subscription =
          component.inputControl.valueChanges.subscribe(value =>
            values.push(value),
          );
        const writesBeforeChange = writes.length;
        ngMocks.change(
          input,
          'explicit',
          '_controlValueAccessorChangeFn',
        );
        fixture.detectChanges();
        subscription.unsubscribe();

        expect(component.inputControl.value).toBe('explicit');
        expect(component.inputControl.dirty).toBe(true);
        expect(values).toEqual(['explicit']);
        if (mode === 'mock') {
          // A mock edit invokes its registered callback, not a parent-to-child write.
          expect(writes.length).toBe(writesBeforeChange);
        } else {
          expect(child.value).toBe('explicit');
        }

        const disabledStates: boolean[] = [];
        ngMocks.stubMember(
          child,
          'setDisabledState',
          (disabled: boolean) => disabledStates.push(disabled),
        );
        component.inputControl.disable();
        expect(disabledStates).toEqual([true]);
        component.inputControl.enable();
        expect(disabledStates).toEqual([true, false]);
        expect(component.inputValue).toBe('sibling');
        expect(component.changes).toEqual([]);
        const sibling = ngMocks.get(
          ngMocks.find('[name="modelName"]'),
          NgModel,
        ).control;
        expect(sibling.dirty).toBe(false);
        expect(sibling.touched).toBe(false);
        expect(sibling.enabled).toBe(true);
      });
    });
  }
});
