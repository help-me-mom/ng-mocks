import {
  Component,
  forwardRef,
  InjectionToken,
  Optional,
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
  MockControlValueAccessor,
  MockInstance,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

type InputValue = string | { value: string } | string[] | null;
const UI_CONTROL = new InjectionToken<CvaComponent>('UI_CONTROL');

@Component({
  selector: 'own-select-15033',
  standalone: true,
  template: '{{ inputValue }}',
  providers: [
    {
      provide: UI_CONTROL,
      useExisting: forwardRef(() => CvaComponent),
    },
  ],
})
class CvaComponent implements ControlValueAccessor {
  public inputValue: InputValue = 'unwritten';
  public writes: InputValue[] = [];
  public changeRegistrations: Array<(value: InputValue) => void> = [];
  public touchRegistrations: Array<() => void> = [];
  public unregisteredChanges: InputValue[] = [];
  public unregisteredTouches = 0;

  // Like constructor-registering controls, this component has no accessor token.
  public constructor(@Optional() @Self() control: NgControl) {
    if (control) {
      control.valueAccessor = this;
    }
  }

  public writeValue(value: InputValue): void {
    this.inputValue = value;
    this.writes.push(value);
  }

  public registerOnChange(
    callback: (value: InputValue) => void,
  ): void {
    this.changeRegistrations.push(callback);
  }

  public registerOnTouched(callback: () => void): void {
    this.touchRegistrations.push(callback);
  }
}

@Component({
  selector: 'target-15033',
  standalone: true,
  imports: [CvaComponent, FormField],
  template: `
    <own-select-15033
      name="inputName"
      [formField]="inputForm.inputValue"
    />
    <own-select-15033
      name="siblingName"
      [formField]="inputForm.siblingValue"
    />
    <own-select-15033 name="unboundName" />
  `,
})
class TargetComponent {
  public readonly inputModel = signal<{
    inputValue: InputValue;
    siblingValue: InputValue;
  }>({ inputValue: 'initial', siblingValue: 'sibling' });
  public readonly inputForm = form(this.inputModel);
}

@Component({
  selector: 'native-15033',
  standalone: true,
  imports: [FormField],
  template: `
    <input
      name="inputName"
      value="native text"
      [formField]="inputForm.inputValue"
      (focus)="events.push('focus')"
      (input)="events.push('input')"
      (change)="events.push('change')"
      (blur)="events.push('blur')"
    />
    <input
      type="checkbox"
      name="checkboxName"
      value="accepted"
      [formField]="inputForm.checkboxValue"
    />
    <input
      type="radio"
      name="radioName"
      value="first"
      checked
      [formField]="inputForm.radioValue"
    />
    <input
      type="radio"
      name="radioName"
      value="second"
      [formField]="inputForm.radioValue"
    />
    <input name="siblingName" [formField]="inputForm.siblingValue" />
  `,
})
class NativeComponent {
  public readonly inputModel = signal({
    inputValue: 'initial',
    checkboxValue: false,
    radioValue: 'first',
    siblingValue: 'sibling',
  });
  public readonly inputForm = form(this.inputModel);
  public readonly events: string[] = [];
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15033
// A mocked FormField keeps the real FieldTree input but registers no CVA callbacks.
// Helpers should use that binding without pretending the original forms directive ran.
describe('issue-15033', () => {
  MockInstance.scope();

  describe('custom control', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .mock(CvaComponent)
        .mock(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    beforeEach(() => {
      // Record unused mock hooks as well as real registrations and parent writes.
      MockInstance(CvaComponent, instance => {
        instance.inputValue = 'unwritten';
        instance.writes = [];
        instance.changeRegistrations = [];
        instance.touchRegistrations = [];
        instance.unregisteredChanges = [];
        instance.unregisteredTouches = 0;
        instance.writeValue = value => {
          instance.inputValue = value;
          instance.writes.push(value);
        };
        instance.registerOnChange = callback => {
          instance.changeRegistrations.push(callback);
        };
        instance.registerOnTouched = callback => {
          instance.touchRegistrations.push(callback);
        };
        const mock = instance as CvaComponent &
          MockControlValueAccessor;
        mock.__simulateChange = value =>
          instance.unregisteredChanges.push(value);
        mock.__simulateTouch = () => {
          instance.unregisteredTouches += 1;
        };
      });
    });

    it('changes the bound field once and preserves local provider and field identities', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const input = ngMocks.find('[name="inputName"]');
      const child = ngMocks.get(input, CvaComponent);
      const sibling = ngMocks.get(
        ngMocks.find('[name="siblingName"]'),
        CvaComponent,
      );
      const field = ngMocks.get(input, FormField);
      const control = ngMocks.get(input, NgControl);
      const tree = component.inputForm.inputValue;
      const state = tree();
      const writes: InputValue[] = [];
      const set = state.controlValue.set;
      state.controlValue.set = value => {
        writes.push(value);
        set(value);
      };

      // A proxy is attached, but the mocked binding never registers it with the field.
      expect(isMockOf(child, CvaComponent)).toBe(true);
      expect(isMockOf(field, FormField)).toBe(true);
      expect(input.componentInstance).toBe(child);
      expect(input.injector.get(CvaComponent)).toBe(child);
      expect(input.injector.get(UI_CONTROL)).toBe(child);
      expect(input.injector.get(FormField)).toBe(field);
      expect(input.injector.get(NgControl)).toBe(control);
      expect(
        (
          control.valueAccessor as ControlValueAccessor & {
            instance: CvaComponent;
          }
        ).instance,
      ).toBe(child);
      expect(input.providerTokens).not.toContain(NG_VALUE_ACCESSOR);
      expect(child.changeRegistrations).toEqual([]);
      expect(child.touchRegistrations).toEqual([]);
      expect(child.writes).toEqual([]);
      expect(ngMocks.input(input, 'formField')).toBe(tree);

      ngMocks.change('[name="inputName"]', 'updated');

      expect(writes).toEqual(['updated']);
      expect(component.inputModel()).toEqual({
        inputValue: 'updated',
        siblingValue: 'sibling',
      });
      expect(state.value()).toBe('updated');
      expect(state.dirty()).toBe(true);
      expect(state.touched()).toBe(false);
      expect(component.inputForm.inputValue).toBe(tree);
      expect(ngMocks.input(input, 'formField')).toBe(tree);
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().touched()).toBe(
        false,
      );
      expect(child.unregisteredChanges).toEqual([]);
      expect(child.unregisteredTouches).toBe(0);
      expect(child.writes).toEqual([]);
      expect(sibling.unregisteredChanges).toEqual([]);
      expect(sibling.unregisteredTouches).toBe(0);
      expect(sibling.writes).toEqual([]);
    });

    for (const payload of [
      { value: 'object' },
      ['first', 'second'],
      null,
    ]) {
      it(`preserves ${payload === null ? 'null' : Array.isArray(payload) ? 'array' : 'object'} payload identity`, () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const tree = component.inputForm.inputValue;
        const input = ngMocks.reveal(['formField', tree]);
        const child = ngMocks.get(input, CvaComponent);

        // A custom control forwards the raw value, including arrays and objects.
        ngMocks.change(input, payload);

        expect(component.inputModel().inputValue).toBe(payload);
        expect(tree().value()).toBe(payload);
        expect(tree().controlValue()).toBe(payload);
        expect(tree().dirty()).toBe(true);
        expect(tree().touched()).toBe(false);
        expect(ngMocks.input(input, 'formField')).toBe(tree);
        expect(component.inputModel().siblingValue).toBe('sibling');
        expect(component.inputForm.siblingValue().dirty()).toBe(
          false,
        );
        expect(component.inputForm.siblingValue().touched()).toBe(
          false,
        );
        expect(child.unregisteredChanges).toEqual([]);
        expect(child.unregisteredTouches).toBe(0);
        expect(child.writes).toEqual([]);
      });
    }

    it('touches a pristine field once without editing it or invoking unregistered callbacks', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const tree = component.inputForm.inputValue;
      const state = tree();
      const child = ngMocks.get(
        ngMocks.find('[name="inputName"]'),
        CvaComponent,
      );
      const markAsTouched = state.markAsTouched.bind(state);
      let touches = 0;
      state.markAsTouched = () => {
        touches += 1;
        markAsTouched();
      };

      // Touch has its own field operation; it does not synthesize a value change.
      ngMocks.touch('[name="inputName"]');

      expect(touches).toBe(1);
      expect(state.touched()).toBe(true);
      expect(state.dirty()).toBe(false);
      expect(component.inputModel()).toEqual({
        inputValue: 'initial',
        siblingValue: 'sibling',
      });
      expect(ngMocks.input('[name="inputName"]', 'formField')).toBe(
        tree,
      );
      expect(component.inputForm.siblingValue().touched()).toBe(
        false,
      );
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(child.unregisteredChanges).toEqual([]);
      expect(child.unregisteredTouches).toBe(0);
      expect(child.changeRegistrations).toEqual([]);
      expect(child.touchRegistrations).toEqual([]);
      expect(child.writes).toEqual([]);
    });

    it('keeps later parent writes in the field without restoring the mocked child connection', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const tree = component.inputForm.inputValue;
      const child = ngMocks.get(
        ngMocks.find('[name="inputName"]'),
        CvaComponent,
      );
      const payload = { value: 'parent' };

      component.inputModel.set({
        inputValue: payload,
        siblingValue: 'sibling',
      });
      fixture.detectChanges();

      expect(component.inputModel().inputValue).toBe(payload);
      expect(tree().value()).toBe(payload);
      expect(tree().dirty()).toBe(false);
      expect(tree().touched()).toBe(false);
      expect(ngMocks.input('[name="inputName"]', 'formField')).toBe(
        tree,
      );
      expect(child.inputValue).toBe('unwritten');
      expect(child.writes).toEqual([]);
      expect(child.changeRegistrations).toEqual([]);
      expect(child.touchRegistrations).toEqual([]);
      expect(child.unregisteredChanges).toEqual([]);
      expect(child.unregisteredTouches).toBe(0);
    });

    it('rejects an unbound sibling instead of borrowing a bound field', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const input = ngMocks.find('[name="unboundName"]');
      const child = ngMocks.get(input, CvaComponent);
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
      expect(input.providerTokens).not.toContain(FormField);
      expect(input.providerTokens).not.toContain(NgControl);
      expect(input.providerTokens).not.toContain(NG_VALUE_ACCESSOR);
      expect(input.injector.get(UI_CONTROL)).toBe(child);
      expect(child.unregisteredChanges).toEqual([]);
      expect(child.unregisteredTouches).toBe(0);
      expect(component.inputModel()).toEqual({
        inputValue: 'initial',
        siblingValue: 'sibling',
      });
      expect(component.inputForm.inputValue().dirty()).toBe(false);
      expect(component.inputForm.inputValue().touched()).toBe(false);
    });
  });

  describe('native controls', () => {
    beforeEach(() =>
      MockBuilder(NativeComponent)
        .mock(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('changes and touches a text binding without dispatching native events or synchronizing the DOM', () => {
      const fixture = MockRender(NativeComponent);
      const component = fixture.point.componentInstance;
      const input = ngMocks.find('[name="inputName"]');
      const tree = component.inputForm.inputValue;

      expect(input.nativeNode.value).toBe('native text');
      expect(ngMocks.input(input, 'formField')).toBe(tree);

      ngMocks.change('[name="inputName"]', 'updated');

      expect(component.inputModel().inputValue).toBe('updated');
      expect(tree().dirty()).toBe(true);
      expect(tree().touched()).toBe(false);
      expect(input.nativeNode.value).toBe('native text');
      expect(component.events).toEqual([]);

      ngMocks.touch('[name="inputName"]');

      expect(tree().touched()).toBe(true);
      expect(tree().value()).toBe('updated');
      expect(ngMocks.input(input, 'formField')).toBe(tree);
      expect(input.nativeNode.value).toBe('native text');
      expect(component.events).toEqual([]);
      expect(component.inputModel().siblingValue).toBe('sibling');
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().touched()).toBe(
        false,
      );
    });

    it('coerces checkbox arguments to checked-state booleans without changing the native checkbox', () => {
      const fixture = MockRender(NativeComponent);
      const component = fixture.point.componentInstance;
      const input = ngMocks.find('[name="checkboxName"]');
      const tree = component.inputForm.checkboxValue;
      const writes: boolean[] = [];
      const set = tree().controlValue.set;
      tree().controlValue.set = value => {
        writes.push(value);
        set(value);
      };

      // Preserve ngMocks.change's checked-state argument contract for native checkboxes.
      ngMocks.change(input, 'truthy');
      expect(component.inputModel().checkboxValue).toBe(true);
      expect(input.nativeNode.checked).toBe(false);
      ngMocks.change(input, 0);

      expect(writes).toEqual([true, false]);
      expect(component.inputModel().checkboxValue).toBe(false);
      expect(tree().dirty()).toBe(true);
      expect(tree().touched()).toBe(false);
      expect(ngMocks.input(input, 'formField')).toBe(tree);
      expect(input.nativeNode.checked).toBe(false);
      expect(input.nativeNode.value).toBe('accepted');
      expect(component.inputModel().radioValue).toBe('first');
      expect(component.inputForm.radioValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.events).toEqual([]);
    });

    it('writes the native radio option value when true selects that option', () => {
      const fixture = MockRender(NativeComponent);
      const component = fixture.point.componentInstance;
      const input = ngMocks.find(
        '[name="radioName"][value="second"]',
      );
      const tree = component.inputForm.radioValue;

      ngMocks.change('[name="radioName"][value="second"]', true);

      expect(component.inputModel().radioValue).toBe('second');
      expect(tree().value()).toBe('second');
      expect(tree().dirty()).toBe(true);
      expect(tree().touched()).toBe(false);
      expect(ngMocks.input(input, 'formField')).toBe(tree);
      expect(input.nativeNode.checked).toBe(false);
      expect(component.inputModel().checkboxValue).toBe(false);
      expect(component.inputForm.checkboxValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.events).toEqual([]);
    });

    it('consumes a radio false argument without writing or dirtying its field', () => {
      const fixture = MockRender(NativeComponent);
      const component = fixture.point.componentInstance;
      const input = ngMocks.find('[name="radioName"][value="first"]');
      const tree = component.inputForm.radioValue;
      const writes: string[] = [];
      const set = tree().controlValue.set;
      tree().controlValue.set = value => {
        writes.push(value);
        set(value);
      };

      // Unchecking an individual radio does not select a new value for its group.
      ngMocks.change(input, false);

      expect(writes).toEqual([]);
      expect(component.inputModel().radioValue).toBe('first');
      expect(tree().dirty()).toBe(false);
      expect(tree().touched()).toBe(false);
      expect(ngMocks.input(input, 'formField')).toBe(tree);
      expect(input.nativeNode.checked).toBe(true);
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().touched()).toBe(
        false,
      );
      expect(component.events).toEqual([]);
    });

    it('preserves a nonboolean radio payload instead of treating it as checked state', () => {
      const fixture = MockRender(NativeComponent);
      const component = fixture.point.componentInstance;
      const input = ngMocks.find(
        '[name="radioName"][value="second"]',
      );
      const tree = component.inputForm.radioValue;

      ngMocks.change(input, 'legacy value');

      expect(component.inputModel().radioValue).toBe('legacy value');
      expect(tree().controlValue()).toBe('legacy value');
      expect(tree().dirty()).toBe(true);
      expect(tree().touched()).toBe(false);
      expect(ngMocks.input(input, 'formField')).toBe(tree);
      expect(input.nativeNode.value).toBe('second');
      expect(input.nativeNode.checked).toBe(false);
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().touched()).toBe(
        false,
      );
      expect(component.events).toEqual([]);
    });
  });
});
