import {
  Component,
  EventEmitter,
  forwardRef,
  InjectionToken,
  Input,
  Optional,
  Output,
  Self,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

import {
  isMockOf,
  MockBuilder,
  MockInstance,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

const UI_CONTROL = new InjectionToken<CvaComponent>('UI_CONTROL');

@Component({
  selector: 'own-classic-cva-15034',
  standalone: true,
  template: '{{ value }}',
  providers: [
    {
      provide: UI_CONTROL,
      useExisting: forwardRef(() => CvaComponent),
    },
  ],
})
class CvaComponent implements ControlValueAccessor {
  @Input() public value = 'unwritten';
  @Output() public readonly valueChange = new EventEmitter<string>();
  public readonly writes: string[] = [];
  public readonly changeRegistrations: Array<
    (value: string) => void
  > = [];
  public readonly touchRegistrations: Array<() => void> = [];
  public onChange: (value: string) => void = () => undefined;
  public onTouched: () => void = () => undefined;

  // The UI alias and constructor registration mirror a control with no accessor token.
  public constructor(@Optional() @Self() control: NgControl) {
    if (control) {
      control.valueAccessor = this;
    }
  }

  public writeValue(value: string): void {
    this.value = value;
    this.writes.push(value);
  }

  public registerOnChange(callback: (value: string) => void): void {
    this.changeRegistrations.push(callback);
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.touchRegistrations.push(callback);
    this.onTouched = callback;
  }
}

@Component({
  selector: 'target-classic-cva-15034',
  standalone: true,
  imports: [CvaComponent, FormField],
  template: `
    <own-classic-cva-15034 [formField]="inputForm.inputValue" />
    <own-classic-cva-15034 [formField]="inputForm.siblingValue" />
  `,
})
class TargetComponent {
  public readonly inputModel = signal({
    inputValue: 'initial',
    siblingValue: 'unchanged',
  });
  public readonly inputForm = form(this.inputModel);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15034#issuecomment-5679943941
// An attached CVA takes priority over the same component's classic value/valueChange pair.
describe('issue-15034:classic-cva', () => {
  MockInstance.scope();

  for (const mode of ['kept child', 'mocked child']) {
    describe(mode, () => {
      beforeEach(() => {
        const builder = MockBuilder(TargetComponent)
          .keep(FormField)
          .keep(NG_MOCKS_ROOT_PROVIDERS);

        return mode === 'mocked child'
          ? builder.mock(CvaComponent)
          : builder.keep(CvaComponent);
      });

      beforeEach(() => {
        // Observe registrations on the mock without registering a callback ourselves.
        MockInstance(CvaComponent, instance => ({
          writes: [],
          changeRegistrations: [],
          touchRegistrations: [],
          writeValue: (value: string) => {
            instance.value = value;
            instance.writes.push(value);
          },
          registerOnChange: (callback: (value: string) => void) => {
            instance.changeRegistrations.push(callback);
            instance.onChange = callback;
          },
          registerOnTouched: (callback: () => void) => {
            instance.touchRegistrations.push(callback);
            instance.onTouched = callback;
          },
        }));
      });

      it('preserves host identities and registers the CVA instead of the classic output', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const tree = component.inputForm.inputValue;
        const input = ngMocks.reveal(['formField', tree]);
        const child = ngMocks.get(input, CvaComponent);
        const field = ngMocks.get(input, FormField);
        const control = ngMocks.get(input, NgControl);
        const changes: string[] = [];
        child.valueChange.subscribe(value => changes.push(value));

        // Angular registers the accessor attached to this host, including the mock's proxy.
        expect(isMockOf(child, CvaComponent)).toBe(
          mode === 'mocked child',
        );
        expect(isMockOf(field, FormField)).toBe(false);
        expect(input.componentInstance).toBe(child);
        expect(input.injector.get(CvaComponent)).toBe(child);
        expect(input.injector.get(UI_CONTROL)).toBe(child);
        expect(input.injector.get(FormField)).toBe(field);
        expect(input.injector.get(NgControl)).toBe(control);
        expect(input.providerTokens).not.toContain(NG_VALUE_ACCESSOR);
        if (mode === 'mocked child') {
          expect(
            (
              control.valueAccessor as ControlValueAccessor & {
                instance: CvaComponent;
              }
            ).instance,
          ).toBe(child);
        } else {
          expect(control.valueAccessor).toBe(child);
        }
        expect(child.changeRegistrations).toEqual([child.onChange]);
        expect(child.touchRegistrations).toEqual([child.onTouched]);
        expect(child.writes).toEqual(['initial']);
        expect(child.value).toBe('initial');
        expect(ngMocks.input(input, 'formField')).toBe(tree);

        // The classic output exists, but it is not the connection chosen by FormField.
        child.valueChange.emit('updated');
        fixture.detectChanges();

        expect(component.inputModel()).toEqual({
          inputValue: 'initial',
          siblingValue: 'unchanged',
        });
        expect(tree().value()).toBe('initial');
        expect(tree().dirty()).toBe(false);
        expect(tree().touched()).toBe(false);
        expect(child.value).toBe('initial');
        expect(changes).toEqual(['updated']);
        expect(child.changeRegistrations).toEqual([child.onChange]);
        expect(child.touchRegistrations).toEqual([child.onTouched]);
        expect(child.writes).toEqual(['initial']);
        expect(component.inputForm.siblingValue().dirty()).toBe(
          false,
        );
        expect(component.inputForm.siblingValue().touched()).toBe(
          false,
        );
      });

      it('changes the field through the registered CVA without emitting its classic output', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const tree = component.inputForm.inputValue;
        const input = ngMocks.reveal(['formField', tree]);
        const child = ngMocks.get(input, CvaComponent);
        const changes: string[] = [];
        child.valueChange.subscribe(value => changes.push(value));

        // ngMocks.change must retain the registered CVA route despite the classic output.
        ngMocks.change(input, 'updated');
        // Check the helper's writes before Angular applies its own version-specific write-back.
        expect(child.value).toBe(
          mode === 'mocked child' ? 'initial' : 'updated',
        );
        expect(child.writes).toEqual(
          mode === 'mocked child'
            ? ['initial']
            : ['initial', 'updated'],
        );
        fixture.detectChanges();

        expect(component.inputModel()).toEqual({
          inputValue: 'updated',
          siblingValue: 'unchanged',
        });
        expect(tree().value()).toBe('updated');
        expect(tree().dirty()).toBe(true);
        expect(tree().touched()).toBe(false);
        expect(child.changeRegistrations).toEqual([child.onChange]);
        expect(child.touchRegistrations).toEqual([child.onTouched]);
        expect(changes).toEqual([]);
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
