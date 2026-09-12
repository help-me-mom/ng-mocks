import { Component, Directive, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[ancestorTouchControl]',
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
  selector: 'target-ng-mocks-touch-ancestor',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <div ancestorTouchControl class="bound" [formControl]="control">
      <span ancestorTouchControl class="unbound"></span>
      <input [value]="localValue" (blur)="localTouched = true" />
    </div>
  `,
})
class TargetComponent {
  public readonly control = new FormControl('parent');
  public localValue = 'local';
  public localTouched = false;
}

@NgModule({
  declarations: [TargetComponent, CvaDirective],
  exports: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14909
describe('ng-mocks-touch:ancestor', () => {
  for (const mode of ['real', 'mock']) {
    describe(`${mode} ancestor accessor`, () => {
      beforeEach(() => {
        const builder =
          MockBuilder(TargetComponent).keep(TargetModule);
        return mode === 'real' ? builder : builder.mock(CvaDirective);
      });

      it('rejects an unbound child without touching the ancestor control', () => {
        const component =
          MockRender(TargetComponent).point.componentInstance;

        // The child's accessor has no registered form callbacks of its own.
        try {
          ngMocks.touch('.unbound');
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain(
            'Cannot find ControlValueAccessor on the element',
          );
        }

        expect(component.control.touched).toBe(false);
        expect(component.control.dirty).toBe(false);
        expect(component.control.value).toBe('parent');
        expect(component.localValue).toBe('local');
        expect(component.localTouched).toBe(false);
      });

      it('touches the local input without touching the ancestor CVA', () => {
        const component =
          MockRender(TargetComponent).point.componentInstance;

        ngMocks.touch('input');

        expect(component.localTouched).toBe(true);
        expect(component.localValue).toBe('local');
        expect(component.control.touched).toBe(false);
        expect(component.control.dirty).toBe(false);
        expect(component.control.value).toBe('parent');
      });

      it('still touches the bound CVA host directly', () => {
        const component =
          MockRender(TargetComponent).point.componentInstance;
        const values: Array<string | null> = [];
        const subscription = component.control.valueChanges.subscribe(
          value => values.push(value),
        );

        ngMocks.touch('.bound');
        subscription.unsubscribe();

        expect(component.control.touched).toBe(true);
        expect(component.control.dirty).toBe(false);
        expect(component.control.value).toBe('parent');
        expect(values).toEqual([]);
        expect(component.localValue).toBe('local');
        expect(component.localTouched).toBe(false);
      });
    });
  }
});
