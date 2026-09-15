import {
  CheckboxControlValueAccessor,
  ControlValueAccessor,
  DefaultValueAccessor,
  NumberValueAccessor,
  RadioControlValueAccessor,
  RangeValueAccessor,
  SelectControlValueAccessor,
  SelectMultipleControlValueAccessor,
} from '@angular/forms';

import coreForm from './core.form';
import { MockControlValueAccessorProxy } from './mock-control-value-accessor-proxy';

class MockTarget {}

class CustomAccessor implements ControlValueAccessor {
  public constructor() {
    throw new Error('The real accessor must not be constructed');
  }

  public writeValue(): void {}
  public registerOnChange(): void {}
  public registerOnTouched(): void {}
}

class CustomDefaultAccessor extends DefaultValueAccessor {}
class CustomNumberAccessor extends NumberValueAccessor {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15031
describe('MockControlValueAccessorProxy', () => {
  for (const sourceType of [
    DefaultValueAccessor,
    CheckboxControlValueAccessor,
    NumberValueAccessor,
    RadioControlValueAccessor,
    RangeValueAccessor,
    SelectControlValueAccessor,
    SelectMultipleControlValueAccessor,
    CustomAccessor,
    CustomDefaultAccessor,
    CustomNumberAccessor,
  ]) {
    it(`preserves the ${sourceType.name} constructor without replacing the proxy prototype`, () => {
      const proxy = new MockControlValueAccessorProxy(
        MockTarget,
        sourceType,
      );

      // Angular reads constructor identity, while ng-mocks still needs its own proxy methods.
      expect(proxy.constructor).toBe(sourceType);
      expect(proxy.target).toBe(MockTarget);
      expect(proxy instanceof MockControlValueAccessorProxy).toBe(
        true,
      );
      expect(proxy instanceof sourceType).toBe(false);
      expect(Object.getPrototypeOf(proxy)).toBe(
        MockControlValueAccessorProxy.prototype,
      );
      expect(proxy.writeValue).toBe(
        MockControlValueAccessorProxy.prototype.writeValue,
      );
      expect(Object.keys(proxy)).not.toContain('constructor');
      const descriptor = Object.getOwnPropertyDescriptor(
        proxy,
        'constructor',
      );
      expect(descriptor?.value).toBe(sourceType);
      expect(descriptor?.enumerable).toBe(false);
      expect(proxy.instance).toBeUndefined();
    });
  }

  for (const sourceType of [
    CheckboxControlValueAccessor,
    NumberValueAccessor,
    RadioControlValueAccessor,
    RangeValueAccessor,
    SelectControlValueAccessor,
    SelectMultipleControlValueAccessor,
  ]) {
    it(`keeps Angular's precedence for ${sourceType.name} in both provider orders`, () => {
      const defaultAccessor = new MockControlValueAccessorProxy(
        MockTarget,
        DefaultValueAccessor,
      );
      const builtInAccessor = new MockControlValueAccessorProxy(
        MockTarget,
        sourceType,
      );
      const customAccessor = new MockControlValueAccessorProxy(
        MockTarget,
        CustomAccessor,
      );
      const control = { path: ['inputName'] };

      // Use Angular's actual selector so the test does not copy its category algorithm.
      expect(
        coreForm.selectValueAccessor(control, [
          defaultAccessor,
          builtInAccessor,
          customAccessor,
        ]),
      ).toBe(customAccessor);
      expect(
        coreForm.selectValueAccessor(control, [
          customAccessor,
          builtInAccessor,
          defaultAccessor,
        ]),
      ).toBe(customAccessor);
      expect(
        coreForm.selectValueAccessor(control, [
          defaultAccessor,
          builtInAccessor,
        ]),
      ).toBe(builtInAccessor);
      expect(
        coreForm.selectValueAccessor(control, [
          builtInAccessor,
          defaultAccessor,
        ]),
      ).toBe(builtInAccessor);
      expect(
        coreForm.selectValueAccessor(control, [defaultAccessor]),
      ).toBe(defaultAccessor);
    });
  }

  for (const sourceType of [
    CustomDefaultAccessor,
    CustomNumberAccessor,
  ]) {
    it(`still classifies ${sourceType.name} as a custom accessor`, () => {
      const defaultAccessor = new MockControlValueAccessorProxy(
        MockTarget,
        DefaultValueAccessor,
      );
      const builtInAccessor = new MockControlValueAccessorProxy(
        MockTarget,
        NumberValueAccessor,
      );
      const customAccessor = new MockControlValueAccessorProxy(
        MockTarget,
        sourceType,
      );
      const otherCustomAccessor = new MockControlValueAccessorProxy(
        MockTarget,
        CustomAccessor,
      );
      const control = { path: ['inputName'] };

      // Extending an Angular accessor does not give a user declaration the built-in category.
      expect(
        coreForm.selectValueAccessor(control, [
          defaultAccessor,
          builtInAccessor,
          customAccessor,
        ]),
      ).toBe(customAccessor);
      expect(
        coreForm.selectValueAccessor(control, [
          customAccessor,
          builtInAccessor,
          defaultAccessor,
        ]),
      ).toBe(customAccessor);
      expect(() =>
        coreForm.selectValueAccessor(control, [
          customAccessor,
          otherCustomAccessor,
        ]),
      ).toThrowError(/More than one custom value accessor/);
      expect(() =>
        coreForm.selectValueAccessor(control, [
          otherCustomAccessor,
          customAccessor,
        ]),
      ).toThrowError(/More than one custom value accessor/);
    });
  }

  it('preserves duplicate custom and built-in errors', () => {
    const firstCustom = new MockControlValueAccessorProxy(
      MockTarget,
      CustomAccessor,
    );
    const secondCustom = new MockControlValueAccessorProxy(
      MockTarget,
      CustomAccessor,
    );
    const firstBuiltIn = new MockControlValueAccessorProxy(
      MockTarget,
      NumberValueAccessor,
    );
    const secondBuiltIn = new MockControlValueAccessorProxy(
      MockTarget,
      CheckboxControlValueAccessor,
    );
    const control = { path: ['inputName'] };

    expect(() =>
      coreForm.selectValueAccessor(control, [
        firstCustom,
        secondCustom,
      ]),
    ).toThrowError(/More than one custom value accessor/);
    expect(() =>
      coreForm.selectValueAccessor(control, [
        secondCustom,
        firstCustom,
      ]),
    ).toThrowError(/More than one custom value accessor/);
    expect(() =>
      coreForm.selectValueAccessor(control, [
        firstBuiltIn,
        secondBuiltIn,
      ]),
    ).toThrowError(/More than one built-in value accessor/);
    expect(() =>
      coreForm.selectValueAccessor(control, [
        secondBuiltIn,
        firstBuiltIn,
      ]),
    ).toThrowError(/More than one built-in value accessor/);
  });

  it('preserves Angular selecting the last default candidate', () => {
    const first = new MockControlValueAccessorProxy(
      MockTarget,
      DefaultValueAccessor,
    );
    const second = new MockControlValueAccessorProxy(
      MockTarget,
      DefaultValueAccessor,
    );
    const control = { path: ['inputName'] };

    // Angular permits multiple default candidates; only custom and built-in duplicates fail.
    expect(
      coreForm.selectValueAccessor(control, [first, second]),
    ).toBe(second);
    expect(
      coreForm.selectValueAccessor(control, [second, first]),
    ).toBe(first);
  });

  it('keeps the original proxy behavior when no source constructor is supplied', () => {
    const proxy = new MockControlValueAccessorProxy(MockTarget);
    const defaultAccessor = new MockControlValueAccessorProxy(
      MockTarget,
      DefaultValueAccessor,
    );

    expect(proxy.constructor).toBe(MockControlValueAccessorProxy);
    expect(proxy.target).toBe(MockTarget);
    expect(proxy instanceof MockControlValueAccessorProxy).toBe(true);
    expect(
      Object.getOwnPropertyDescriptor(proxy, 'constructor'),
    ).toBeUndefined();
    expect(
      coreForm.selectValueAccessor({ path: ['inputName'] }, [
        defaultAccessor,
        proxy,
      ]),
    ).toBe(proxy);
    expect(
      coreForm.selectValueAccessor({ path: ['inputName'] }, [
        proxy,
        defaultAccessor,
      ]),
    ).toBe(proxy);
  });

  it('forwards callbacks and values to the attached instance after preserving its category', () => {
    const proxy = new MockControlValueAccessorProxy(
      MockTarget,
      NumberValueAccessor,
    );
    const events: string[] = [];
    const values: number[] = [];
    const change = (value: number): void => {
      values.push(value);
    };
    const touch = (): void => {
      events.push('touch');
    };
    const instance = {
      inputValue: 0,
      disabled: false,
      onChange: (() => undefined) as (value: number) => void,
      onTouched: (): void => undefined,
      __simulateChange: (() => undefined) as (value: number) => void,
      __simulateTouch: (): void => undefined,
      writeValue(value: number): void {
        expect(this).toBe(instance);
        this.inputValue = value;
        events.push('write');
      },
      registerOnChange(callback: (value: number) => void): void {
        expect(this).toBe(instance);
        this.onChange = callback;
        events.push('register change');
      },
      registerOnTouched(callback: () => void): void {
        expect(this).toBe(instance);
        this.onTouched = callback;
        events.push('register touch');
      },
      setDisabledState(disabled: boolean): void {
        expect(this).toBe(instance);
        this.disabled = disabled;
        events.push('disable');
      },
    };
    proxy.instance = instance;

    proxy.registerOnChange(change);
    proxy.registerOnTouched(touch);
    proxy.writeValue(42);
    proxy.setDisabledState(true);

    expect(proxy.instance).toBe(instance);
    expect(instance.onChange).toBe(change);
    expect(instance.__simulateChange).toBe(change);
    expect(instance.onTouched).toBe(touch);
    expect(instance.__simulateTouch).toBe(touch);
    expect(instance.inputValue).toBe(42);
    expect(instance.disabled).toBe(true);
    expect(values).toEqual([]);
    expect(events).toEqual([
      'register change',
      'register touch',
      'write',
      'disable',
    ]);

    // The registered simulation functions remain distinct from parent-to-child writes.
    instance.__simulateChange(84);
    instance.__simulateTouch();
    expect(values).toEqual([84]);
    expect(instance.inputValue).toBe(42);
    expect(events).toEqual([
      'register change',
      'register touch',
      'write',
      'disable',
      'touch',
    ]);
  });
});
