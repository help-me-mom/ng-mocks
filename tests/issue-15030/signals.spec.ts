import { Component, forwardRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

import {
  isMockControlValueAccessor,
  isMockOf,
  MockBuilder,
  MockInstance,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'cva-15030-signals',
  standalone: true,
  template: '{{ value }}',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
  ],
})
class CvaComponent implements ControlValueAccessor {
  public value = '';
  public _controlValueAccessorChangeFn: (value: string) => void =
    () => undefined;
  public onTouched: () => void = () => undefined;

  public writeValue(value: string): void {
    this.value = value;
  }

  public registerOnChange(callback: (value: string) => void): void {
    this._controlValueAccessorChangeFn = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }
}

@Component({
  selector: 'target-15030-signals',
  standalone: true,
  imports: [FormField, CvaComponent],
  template: `
    <cva-15030-signals [formField]="f.inputValue" />
    <cva-15030-signals [formField]="f.siblingValue" />
  `,
})
class TargetComponent {
  public readonly model = signal({
    inputValue: 'initial',
    siblingValue: 'sibling',
  });
  public readonly f = form(this.model);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15030
// This control stores the registered callback like Material's group controls.
// It has no input/change listener that could bypass callback discovery.
describe('issue-15030:signals', () => {
  MockInstance.scope();

  for (const mode of ['real', 'kept', 'mock']) {
    describe(mode, () => {
      beforeEach(() => {
        if (mode === 'real') {
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

      for (const methodName of [
        undefined,
        '_controlValueAccessorChangeFn',
      ]) {
        it(`changes once with ${methodName || 'default discovery'}`, () => {
          const writes: string[] = [];
          if (mode === 'mock') {
            MockInstance(CvaComponent, 'writeValue', value => {
              writes.push(value);
            });
          }

          const fixture = MockRender(TargetComponent);
          const component = fixture.point.componentInstance;
          const element = ngMocks.reveal([
            'formField',
            component.f.inputValue,
          ]);
          const control = ngMocks.get(element, CvaComponent);
          const accessors = element.injector.get(NG_VALUE_ACCESSOR);
          const accessor = accessors[0];
          const changes: string[] = [];

          // Count calls to the callback Angular actually registered.
          if (isMockControlValueAccessor(control)) {
            const callback = control.__simulateChange;
            control.__simulateChange = (value: string) => {
              changes.push(value);
              callback(value);
            };
          } else {
            const callback = control._controlValueAccessorChangeFn;
            control._controlValueAccessorChangeFn = value => {
              changes.push(value);
              callback(value);
            };
          }

          expect(isMockOf(control, CvaComponent)).toBe(
            mode === 'mock',
          );
          expect(element.componentInstance).toBe(control);
          expect(element.injector.get(CvaComponent)).toBe(control);
          expect(accessors.length).toBe(1);
          expect(
            isMockOf(ngMocks.get(element, FormField), FormField),
          ).toBe(false);
          expect(
            element.listeners.some(
              listener =>
                listener.name === 'input' ||
                listener.name === 'change',
            ),
          ).toBe(false);
          if (mode === 'mock') {
            // A mocked token accessor forwards to the rendered component.
            expect(
              (
                accessor as ControlValueAccessor & {
                  instance: CvaComponent;
                }
              ).instance,
            ).toBe(control);
            expect(writes).toEqual(['initial', 'sibling']);
          } else {
            expect(accessor).toBe(control);
            expect(control.value).toBe('initial');
          }

          // Parent writes are not user edits and must not call onChange.
          component.model.set({
            inputValue: 'parent',
            siblingValue: 'sibling',
          });
          fixture.detectChanges();
          if (mode === 'mock') {
            expect(writes).toEqual(['initial', 'sibling', 'parent']);
          } else {
            expect(control.value).toBe('parent');
          }
          expect(changes).toEqual([]);
          expect(component.f.inputValue().dirty()).toBe(false);

          if (methodName) {
            ngMocks.change(element, 'updated', methodName);
          } else {
            ngMocks.change(element, 'updated');
          }

          expect(changes).toEqual(['updated']);
          expect(component.model()).toEqual({
            inputValue: 'updated',
            siblingValue: 'sibling',
          });
          expect(component.f.inputValue().dirty()).toBe(true);
          expect(component.f.inputValue().touched()).toBe(false);

          ngMocks.touch(element);

          expect(component.f.inputValue().touched()).toBe(true);
          expect(component.model().inputValue).toBe('updated');
          expect(changes).toEqual(['updated']);
          expect(component.f.siblingValue().dirty()).toBe(false);
          expect(component.f.siblingValue().touched()).toBe(false);
        });
      }

      it('touches the field without changing or dirtying either value', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const element = ngMocks.reveal([
          'formField',
          component.f.inputValue,
        ]);

        ngMocks.touch(element);

        expect(component.model()).toEqual({
          inputValue: 'initial',
          siblingValue: 'sibling',
        });
        expect(component.f.inputValue().touched()).toBe(true);
        expect(component.f.inputValue().dirty()).toBe(false);
        expect(component.f.siblingValue().touched()).toBe(false);
        expect(component.f.siblingValue().dirty()).toBe(false);
      });
    });
  }
});
