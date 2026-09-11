import { Component, Directive, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[ancestorChangeControl]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CvaDirective,
      multi: true,
    },
  ],
})
class CvaDirective implements ControlValueAccessor {
  public value = '';
  public onChange: (value: string) => void = () => undefined;
  public onTouched: () => void = () => undefined;

  public writeValue(value: string): void {
    this.value = value;
  }

  public registerOnChange(callback: (value: string) => void): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }
}

@Component({
  selector: 'target-ng-mocks-change-ancestor',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <div ancestorChangeControl class="bound" [formControl]="control">
      <span ancestorChangeControl class="unbound"></span>
      <input
        [value]="localValue"
        (input)="onInput($event)"
        (blur)="localTouched = true"
      />
    </div>
  `,
})
class TargetComponent {
  public readonly control = new FormControl('parent');
  public localValue = 'local';
  public localTouched = false;

  public onInput(event: any): void {
    this.localValue = event.target.value;
  }
}

@NgModule({
  declarations: [TargetComponent, CvaDirective],
  exports: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14909
describe('ng-mocks-change:ancestor', () => {
  for (const mode of ['real', 'mock']) {
    describe(`${mode} ancestor accessor`, () => {
      beforeEach(() => {
        const builder =
          MockBuilder(TargetComponent).keep(TargetModule);
        return mode === 'real' ? builder : builder.mock(CvaDirective);
      });

      it('rejects an unbound child without changing the ancestor control', () => {
        const component =
          MockRender(TargetComponent).point.componentInstance;
        const values: Array<string | null> = [];
        const subscription = component.control.valueChanges.subscribe(
          value => values.push(value),
        );

        // The child has its own CVA, but only the ancestor has a form binding.
        try {
          ngMocks.change('.unbound', 'updated');
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain(
            'Cannot find ControlValueAccessor on the element',
          );
        }
        subscription.unsubscribe();

        expect(component.control.value).toBe('parent');
        expect(component.control.dirty).toBe(false);
        expect(component.control.touched).toBe(false);
        expect(values).toEqual([]);
        expect(component.localValue).toBe('local');
        expect(component.localTouched).toBe(false);
      });

      it('changes the local input without emitting through the ancestor CVA', () => {
        const component =
          MockRender(TargetComponent).point.componentInstance;
        const values: Array<string | null> = [];
        const subscription = component.control.valueChanges.subscribe(
          value => values.push(value),
        );

        // This input owns its event handling and does not delegate to the ancestor.
        ngMocks.change('input', 'updated');
        subscription.unsubscribe();

        expect(component.localValue).toBe('updated');
        expect(component.localTouched).toBe(true);
        expect(component.control.value).toBe('parent');
        expect(component.control.dirty).toBe(false);
        expect(component.control.touched).toBe(false);
        expect(values).toEqual([]);
      });

      it('still changes the bound CVA host directly', () => {
        const component =
          MockRender(TargetComponent).point.componentInstance;
        const values: Array<string | null> = [];
        const subscription = component.control.valueChanges.subscribe(
          value => values.push(value),
        );

        ngMocks.change('.bound', 'updated');
        subscription.unsubscribe();

        expect(component.control.value).toBe('updated');
        expect(component.control.dirty).toBe(true);
        expect(component.control.touched).toBe(false);
        expect(values).toEqual(['updated']);
        expect(component.localValue).toBe('local');
        expect(component.localTouched).toBe(false);
      });
    });
  }
});
