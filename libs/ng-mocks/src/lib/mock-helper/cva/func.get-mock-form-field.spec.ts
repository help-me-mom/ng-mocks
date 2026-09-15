import { Directive, Input, signal } from '@angular/core';
import {
  FormControl,
  FormControlDirective,
  FormControlName,
  NgControl,
  NgModel,
} from '@angular/forms';
import { FormField } from '@angular/forms/signals';

import { MockControlValueAccessorProxy } from '../../common/mock-control-value-accessor-proxy';
import { MockDirective } from '../../mock-directive/mock-directive';

import funcGetMockFormField from './func.get-mock-form-field';

describe('func.get-mock-form-field', () => {
  let node: any;
  let instance: any;
  let state: any;
  let tree: () => any;

  beforeEach(() => {
    // Only the field operations are stubbed here. The issue's spread specs use a real FieldTree.
    tree = () => state;
    state = {
      fieldTree: tree,
      controlValue: Object.assign(() => 'initial', {
        set: jasmine.createSpy('controlValue.set'),
      }),
      markAsTouched: jasmine.createSpy('markAsTouched'),
    };
    instance = Object.assign(
      Object.create(MockDirective(FormField).prototype),
      { __ngMocks: true, field: signal(tree) },
    );
    const element = {
      tagName: 'CUSTOM-CONTROL',
      type: '',
      value: 'initial',
      checked: false,
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
    };
    node = {
      nativeNode: element,
      nativeElement: element,
      providerTokens: [FormField, NgControl],
      injector: {
        get: jasmine
          .createSpy('get')
          .and.throwError('Unexpected DI lookup'),
        _tNode: {
          attrs: [3, 'formField'],
          directiveStart: 20,
          directiveEnd: 21,
          inputs: { formField: [20] },
        },
        _lView: { 20: instance },
      },
    };
  });

  it('uses the local mock binding without resolving providers or changing the host', () => {
    const control = funcGetMockFormField(node);
    const value = { inputValue: 'updated' };

    // Discovery is read-only; each requested operation is forwarded once.
    expect(state.controlValue.set).not.toHaveBeenCalled();
    expect(state.markAsTouched).not.toHaveBeenCalled();
    control!.change(value);
    control!.touch();

    expect(state.controlValue.set.calls.allArgs()).toEqual([[value]]);
    expect(state.controlValue.set.calls.first().args[0]).toBe(value);
    expect(state.markAsTouched.calls.count()).toBe(1);
    expect(instance.field()).toBe(tree);
    expect(state.fieldTree).toBe(tree);
    expect(node.nativeElement.value).toBe('initial');
    expect(node.nativeElement.checked).toBe(false);
    expect(node.nativeElement.dispatchEvent).not.toHaveBeenCalled();
    expect(node.injector.get).not.toHaveBeenCalled();
  });

  it('preserves array, null and undefined payloads on custom controls', () => {
    const control = funcGetMockFormField(node);
    const value = ['first', 'second'];

    control!.change(value);
    control!.change(null);
    control!.change(undefined);

    expect(state.controlValue.set.calls.allArgs()).toEqual([
      [value],
      [null],
      [undefined],
    ]);
    expect(state.controlValue.set.calls.first().args[0]).toBe(value);
    expect(state.markAsTouched).not.toHaveBeenCalled();
  });

  it('finds a forwarded host-directive alias among other bound inputs', () => {
    node.injector._tNode.attrs = [
      'name',
      'inputName',
      3,
      'otherInput',
      'inputField',
    ];
    node.injector._tNode.inputs = { otherInput: [19] };
    node.injector._tNode.hostDirectiveInputs = {
      inputField: [20, 'formField'],
    };

    funcGetMockFormField(node)!.change('updated');

    expect(state.controlValue.set.calls.allArgs()).toEqual([
      ['updated'],
    ]);
    expect(node.injector.get).not.toHaveBeenCalled();
  });

  it('resolves the private signal input name from its public alias', () => {
    @Directive({
      selector: '[formField]',
      exportAs: 'formField',
      standalone: false,
      providers: [{ provide: NgControl, useValue: {} }],
    })
    class RenamedField {
      // Compiler-equivalent metadata verifies aliases without running an input authoring transform.
      @Input({ alias: 'formField', isSignal: true } as never)
      public current: any;
    }
    const renamed = Object.assign(
      Object.create(MockDirective(RenamedField).prototype),
      { __ngMocks: true, current: signal(tree) },
    );
    node.injector._lView[20] = renamed;

    funcGetMockFormField(node)!.touch();

    expect(state.markAsTouched.calls.count()).toBe(1);
    expect(renamed.current()).toBe(tree);
    expect(state.controlValue.set).not.toHaveBeenCalled();
  });

  it('resolves a signal input already named formField without an alias', () => {
    @Directive({
      selector: '[formField]',
      exportAs: 'formField',
      standalone: false,
      providers: [{ provide: NgControl, useValue: {} }],
    })
    class UnaliasedField {
      // The public name can be the property name instead of an explicit alias.
      @Input({ isSignal: true } as never)
      public formField: any;
    }
    const unaliased = Object.assign(
      Object.create(MockDirective(UnaliasedField).prototype),
      { __ngMocks: true, formField: signal(tree) },
    );
    node.injector._lView[20] = unaliased;

    const control = funcGetMockFormField(node);
    control!.change('updated');
    control!.touch();

    expect(state.controlValue.set.calls.allArgs()).toEqual([
      ['updated'],
    ]);
    expect(state.markAsTouched.calls.count()).toBe(1);
    expect(unaliased.formField()).toBe(tree);
    expect(node.injector.get).not.toHaveBeenCalled();
  });

  for (const attrs of [
    undefined,
    [],
    ['formField', 'static'],
    ['title', 'formField'],
    [1, 'formField'],
    [2, 'formField', 'block'],
    [3, 'unrelated'],
  ]) {
    it(`requires a bound input rather than static or class attributes: ${JSON.stringify(attrs)}`, () => {
      node.injector._tNode.attrs = attrs;

      expect(funcGetMockFormField(node)).toBeUndefined();
      expect(state.controlValue.set).not.toHaveBeenCalled();
      expect(state.markAsTouched).not.toHaveBeenCalled();
      expect(node.injector.get).not.toHaveBeenCalled();
    });
  }

  it('ignores missing node metadata and missing local instances', () => {
    const injector = node.injector;
    node.injector = { get: injector.get };
    expect(funcGetMockFormField(node)).toBeUndefined();

    node.injector = { ...injector, _lView: undefined };
    expect(funcGetMockFormField(node)).toBeUndefined();

    node.injector = { ...injector, _lView: {} };
    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('ignores flags and indices outside the current node directive range', () => {
    node.injector._tNode.inputs.formField = [1, 19, 21, 'field'];
    node.injector._lView[19] = instance;
    node.injector._lView[21] = instance;

    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(node.injector.get).not.toHaveBeenCalled();
  });

  it('does not treat a decorated DI provider as a bound directive', () => {
    // A provider token alone must not trigger its factory or supply a binding.
    node.injector._tNode.inputs = {};
    node.injector._lView = {};

    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(node.injector.get).not.toHaveBeenCalled();
    expect(state.controlValue.set).not.toHaveBeenCalled();
  });

  it('does not discover a binding from an ancestor', () => {
    const parent = node;
    node = {
      ...node,
      parent,
      injector: {
        get: jasmine.createSpy('get').and.returnValue(instance),
        _tNode: {
          attrs: [3, 'formField'],
          directiveStart: 30,
          directiveEnd: 31,
          inputs: { formField: [30] },
        },
        _lView: {},
      },
    };

    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(node.injector.get).not.toHaveBeenCalled();
    expect(parent.injector.get).not.toHaveBeenCalled();
    expect(state.markAsTouched).not.toHaveBeenCalled();
  });

  it('leaves real FormField instances on their normal forms connection', () => {
    node.injector._lView[20] = Object.assign(
      Object.create(FormField.prototype),
      { field: jasmine.createSpy('field').and.returnValue(tree) },
    );

    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(node.injector._lView[20].field).not.toHaveBeenCalled();
  });

  for (const missing of [
    'selector',
    'export',
    'provider',
    'signal',
  ]) {
    it(`rejects an unrelated mocked input without the FormField ${missing} metadata`, () => {
      @Directive({
        selector:
          missing === 'selector' ? '[ordinaryInput]' : '[formField]',
        exportAs:
          missing === 'export' ? 'ordinaryInput' : 'formField',
        standalone: false,
        providers:
          missing === 'provider'
            ? []
            : [{ provide: NgControl, useValue: {} }],
      })
      class OrdinaryInput {
        @Input({
          alias: 'formField',
          isSignal: missing !== 'signal',
        } as never)
        public current: any;
      }
      const read = jasmine
        .createSpy('unrelated input')
        .and.returnValue(tree);
      node.injector._lView[20] = Object.assign(
        Object.create(MockDirective(OrdinaryInput).prototype),
        { __ngMocks: true, current: read },
      );

      expect(funcGetMockFormField(node)).toBeUndefined();
      expect(read).not.toHaveBeenCalled();
      expect(node.injector.get).not.toHaveBeenCalled();
    });
  }

  it('rejects a mocked input when providers metadata is absent', () => {
    @Directive({
      selector: '[formField]',
      exportAs: 'formField',
      standalone: false,
    })
    class ProviderlessInput {
      @Input({ alias: 'formField', isSignal: true } as never)
      public current: any;
    }
    const read = jasmine
      .createSpy('unrelated input')
      .and.returnValue(tree);
    node.injector._lView[20] = Object.assign(
      Object.create(MockDirective(ProviderlessInput).prototype),
      { __ngMocks: true, current: read },
    );

    // Matching input metadata alone does not establish a forms connection.
    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(read).not.toHaveBeenCalled();
    expect(node.injector.get).not.toHaveBeenCalled();
  });

  it('rejects a null provider entry without reading the mocked input', () => {
    @Directive({
      selector: '[formField]',
      exportAs: 'formField',
      standalone: false,
      providers: [null as never],
    })
    class InvalidProviderInput {
      @Input({ alias: 'formField', isSignal: true } as never)
      public current: any;
    }
    const read = jasmine
      .createSpy('unrelated input')
      .and.returnValue(tree);
    node.injector._lView[20] = Object.assign(
      Object.create(MockDirective(InvalidProviderInput).prototype),
      { __ngMocks: true, current: read },
    );

    // Incomplete provider metadata must not be mistaken for NgControl.
    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(read).not.toHaveBeenCalled();
    expect(node.injector.get).not.toHaveBeenCalled();
  });

  it('ignores a mocked object without directive metadata', () => {
    node.injector._lView[20] = {
      __ngMocks: true,
      field: jasmine.createSpy('field').and.returnValue(tree),
    };

    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(node.injector._lView[20].field).not.toHaveBeenCalled();
  });

  it('requires a readable signal input and a callable field tree', () => {
    instance.field = undefined;
    expect(funcGetMockFormField(node)).toBeUndefined();

    instance.field = () => undefined;
    expect(funcGetMockFormField(node)).toBeUndefined();

    instance.field = () => state;
    expect(funcGetMockFormField(node)).toBeUndefined();

    instance.field = jasmine
      .createSpy('required input')
      .and.throwError('Unset input');
    expect(funcGetMockFormField(node)).toBeUndefined();

    instance.field = () =>
      jasmine
        .createSpy('invalid tree')
        .and.throwError('Invalid tree');
    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(state.controlValue.set).not.toHaveBeenCalled();
  });

  it('requires reciprocal tree identity and the field operations', () => {
    const validState = state;
    state = undefined;
    expect(funcGetMockFormField(node)).toBeUndefined();

    state = { ...validState, fieldTree: () => validState };
    expect(funcGetMockFormField(node)).toBeUndefined();

    state = { ...validState, controlValue: {} };
    expect(funcGetMockFormField(node)).toBeUndefined();

    state = { ...validState, controlValue: () => 'initial' };
    expect(funcGetMockFormField(node)).toBeUndefined();

    state = { ...validState, markAsTouched: undefined };
    expect(funcGetMockFormField(node)).toBeUndefined();
    expect(validState.controlValue.set).not.toHaveBeenCalled();
    expect(validState.markAsTouched).not.toHaveBeenCalled();
  });

  it('preserves accessors and classic fallbacks already selected by the caller', () => {
    const read = jasmine.createSpy('field').and.returnValue(tree);
    instance.field = read;
    const proxy = new MockControlValueAccessorProxy();
    proxy.instance = {};
    proxy.registerOnChange(jasmine.createSpy('registered change'));
    proxy.registerOnTouched(jasmine.createSpy('registered touch'));

    // Registration-aware lookup has already selected these before the bridge runs.
    expect(funcGetMockFormField(node, proxy)).toBeUndefined();
    expect(
      funcGetMockFormField(node, new FormControl('initial')),
    ).toBeUndefined();
    expect(
      funcGetMockFormField(node, Object.create(NgModel.prototype)),
    ).toBeUndefined();
    expect(read).not.toHaveBeenCalled();
  });

  for (const token of [
    NgModel,
    FormControlDirective,
    FormControlName,
  ]) {
    it(`preserves a local classic ${token.name} binding without resolving it`, () => {
      node.providerTokens.push(token);

      expect(funcGetMockFormField(node)).toBeUndefined();
      expect(funcGetMockFormField(node, {})).toBeUndefined();
      expect(node.injector.get).not.toHaveBeenCalled();
    });
  }

  it('preserves an explicit real-accessor method but bridges a disconnected real control by default', () => {
    const accessor = {
      writeValue: jasmine.createSpy('writeValue'),
      onChange: jasmine.createSpy('onChange'),
    };

    expect(
      funcGetMockFormField(node, accessor, 'onChange'),
    ).toBeUndefined();

    // A real child cannot acquire its form callback from an intentionally mocked binding.
    funcGetMockFormField(node, accessor)!.change('updated');

    expect(state.controlValue.set.calls.allArgs()).toEqual([
      ['updated'],
    ]);
    expect(accessor.writeValue).not.toHaveBeenCalled();
    expect(accessor.onChange).not.toHaveBeenCalled();
  });

  it('converts native checkbox arguments without changing its DOM state', () => {
    node.nativeElement.tagName = 'INPUT';
    node.nativeElement.type = 'checkbox';
    const control = funcGetMockFormField(node);

    control!.change(true);
    control!.change(false);
    control!.change('yes');
    control!.change('');

    expect(state.controlValue.set.calls.allArgs()).toEqual([
      [true],
      [false],
      [true],
      [false],
    ]);
    expect(node.nativeElement.checked).toBe(false);
    expect(node.nativeElement.value).toBe('initial');
    expect(node.nativeElement.dispatchEvent).not.toHaveBeenCalled();
  });

  it('uses a checked radio option value and ignores unchecking without dispatching events', () => {
    node.nativeElement.tagName = 'INPUT';
    node.nativeElement.type = 'radio';
    node.nativeElement.value = 'second';
    const control = funcGetMockFormField(node);

    // Unchecking an option does not select a different value or dirty the field.
    control!.change(false);
    expect(state.controlValue.set).not.toHaveBeenCalled();

    control!.change(true);
    control!.change('legacy value');

    expect(state.controlValue.set.calls.allArgs()).toEqual([
      ['second'],
      ['legacy value'],
    ]);
    expect(node.nativeElement.value).toBe('second');
    expect(node.nativeElement.checked).toBe(false);
    expect(node.nativeElement.dispatchEvent).not.toHaveBeenCalled();
  });

  it('does not hide errors thrown by an operation after successful discovery', () => {
    const control = funcGetMockFormField(node);
    state.controlValue.set.and.throwError('Change failed');
    state.markAsTouched.and.throwError('Touch failed');

    expect(() => control!.change('updated')).toThrowError(
      'Change failed',
    );
    expect(() => control!.touch()).toThrowError('Touch failed');
    expect(state.controlValue.set.calls.count()).toBe(1);
    expect(state.markAsTouched.calls.count()).toBe(1);
  });
});
