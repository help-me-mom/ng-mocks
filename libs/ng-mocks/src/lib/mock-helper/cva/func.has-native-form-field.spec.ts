import { DebugElement, Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

import coreDefineProperty from '../../common/core.define-property';
import helperDefinePropertyDescriptor from '../../mock-service/helper.define-property-descriptor';

import funcHasNativeFormField from './func.has-native-form-field';

@Directive({
  selector: '[formField]',
  exportAs: 'formField',
  standalone: false,
  providers: [{ provide: NgControl, useValue: {} }],
})
class Field {
  // Compiler-equivalent input metadata keeps discovery independent of authoring transforms.
  @Input({ alias: 'formField', isSignal: true } as never)
  public readonly current = jasmine.createSpy('field input');
}

interface NodeInputs {
  attrs?: unknown[];
  directiveStart: number;
  directiveEnd: number;
  inputs?: Record<string, Array<number | string>>;
  hostDirectiveInputs?: Record<string, Array<number | string>>;
}

interface NodeInjector {
  get: jasmine.Spy;
  _tNode?: NodeInputs;
  _lView?: Record<number, unknown>;
}

describe('func.has-native-form-field', () => {
  let node: DebugElement;
  let injector: NodeInjector;
  let instance: Field;
  let element: {
    tagName: string | undefined;
    value: string;
    dispatchEvent: jasmine.Spy;
  };

  beforeEach(() => {
    instance = new Field();
    element = {
      tagName: 'INPUT',
      value: 'initial',
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
    };
    injector = {
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
    };
    node = new DebugElement(document.createElement('input'));
    coreDefineProperty(node, 'nativeElement', element);
    coreDefineProperty(node, 'injector', injector);
  });

  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
    it(`recognizes a real bound ${tagName} without reading field state or resolving providers`, () => {
      element.tagName = tagName;

      expect(funcHasNativeFormField(node)).toBe(true);

      expect(instance.current).not.toHaveBeenCalled();
      expect(element.value).toBe('initial');
      expect(element.dispatchEvent).not.toHaveBeenCalled();
      expect(injector.get).not.toHaveBeenCalled();
    });
  }

  for (const tagName of ['DIV', 'CUSTOM-CONTROL', undefined]) {
    it(`leaves nonnative hosts on their existing control paths: ${tagName}`, () => {
      element.tagName = tagName;

      expect(funcHasNativeFormField(node)).toBe(false);
      expect(instance.current).not.toHaveBeenCalled();
      expect(injector.get).not.toHaveBeenCalled();
    });
  }

  it('ignores a missing native element', () => {
    node = new DebugElement(document.createElement('input'));
    coreDefineProperty(node, 'nativeElement', undefined);
    coreDefineProperty(node, 'injector', injector);

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('recognizes an unaliased signal input without calling it', () => {
    @Directive({
      selector: '[formField]',
      exportAs: 'formField',
      standalone: false,
      providers: [{ provide: NgControl, useValue: {} }],
    })
    class UnaliasedField {
      @Input({ isSignal: true } as never)
      public readonly formField = jasmine.createSpy(
        'unaliased field input',
      );
    }
    const unaliased = new UnaliasedField();
    injector._lView = { 20: unaliased };

    expect(funcHasNativeFormField(node)).toBe(true);
    expect(unaliased.formField).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('recognizes a forwarded host-directive alias among unrelated bound inputs', () => {
    injector._tNode!.attrs = [
      'name',
      'inputName',
      3,
      'otherInput',
      'inputField',
    ];
    injector._tNode!.inputs = { otherInput: [19] };
    injector._tNode!.hostDirectiveInputs = {
      inputField: [19, 'formField', 20, 'formField'],
    };

    expect(funcHasNativeFormField(node)).toBe(true);
    expect(instance.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('rejects a host-directive binding forwarded to an unrelated input', () => {
    injector._tNode!.attrs = [3, 'inputField'];
    injector._tNode!.inputs = undefined;
    injector._tNode!.hostDirectiveInputs = {
      inputField: [20, 'otherInput'],
    };

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  for (const attrs of [
    undefined,
    [],
    ['formField', 'static'],
    ['title', 'formField'],
    [1, 'formField'],
    [2, 'formField', 'block'],
    [3, 'unrelated'],
    [3, 'unrelated', 1, 'formField'],
  ]) {
    it(`requires an actual bound input: ${JSON.stringify(attrs)}`, () => {
      injector._tNode!.attrs = attrs;

      expect(funcHasNativeFormField(node)).toBe(false);
      expect(instance.current).not.toHaveBeenCalled();
      expect(injector.get).not.toHaveBeenCalled();
    });
  }

  it('requires current-node input tables and an existing rendered instance', () => {
    const originalNode = injector._tNode;
    injector._tNode = undefined;
    expect(funcHasNativeFormField(node)).toBe(false);

    injector._tNode = originalNode;
    injector._lView = undefined;
    expect(funcHasNativeFormField(node)).toBe(false);

    injector._lView = {};
    expect(funcHasNativeFormField(node)).toBe(false);

    injector._lView = { 20: instance };
    injector._tNode!.inputs = undefined;
    expect(funcHasNativeFormField(node)).toBe(false);
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('rejects input flags and instances outside the current directive range', () => {
    injector._tNode!.inputs = { formField: [1, 19, 21, 'field'] };
    injector._lView = { 1: instance, 19: instance, 21: instance };

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('does not instantiate a provider or accept an ancestor field as a local binding', () => {
    const parent = node;
    const parentInjector = injector;
    node = new DebugElement(document.createElement('input'));
    coreDefineProperty(node, 'nativeElement', element);
    coreDefineProperty(node, 'parent', parent);
    injector = {
      get: jasmine
        .createSpy('ancestor field provider')
        .and.returnValue(instance),
      _tNode: {
        attrs: [3, 'formField'],
        directiveStart: 30,
        directiveEnd: 31,
        inputs: { formField: [30] },
      },
      _lView: {},
    };
    coreDefineProperty(node, 'injector', injector);
    coreDefineProperty(node, 'providerTokens', [Field, NgControl]);

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(injector.get).not.toHaveBeenCalled();
    expect(parentInjector.get).not.toHaveBeenCalled();
    expect(instance.current).not.toHaveBeenCalled();
  });

  it('leaves mocked fields on their existing mocked-field path', () => {
    Object.assign(instance, { __ngMocks: true });

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  for (const missing of [
    'selector',
    'export',
    'provider',
    'signal',
    'input',
  ]) {
    it(`rejects an unrelated directive without the FormField ${missing} metadata`, () => {
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
          alias: missing === 'input' ? 'otherInput' : 'formField',
          isSignal: missing !== 'signal',
        } as never)
        public readonly current =
          jasmine.createSpy('unrelated input');
      }
      const unrelated = new OrdinaryInput();
      injector._lView = { 20: unrelated };

      expect(funcHasNativeFormField(node)).toBe(false);
      expect(unrelated.current).not.toHaveBeenCalled();
      expect(injector.get).not.toHaveBeenCalled();
    });
  }

  it('rejects absent or invalid provider metadata', () => {
    @Directive({
      selector: '[formField]',
      exportAs: 'formField',
      standalone: false,
    })
    class ProviderlessField {
      @Input({ alias: 'formField', isSignal: true } as never)
      public readonly current = jasmine.createSpy(
        'providerless input',
      );
    }
    @Directive({
      selector: '[formField]',
      exportAs: 'formField',
      standalone: false,
      providers: [null as never, Field],
    })
    class InvalidField {
      @Input({ alias: 'formField', isSignal: true } as never)
      public readonly current = jasmine.createSpy('invalid input');
    }
    const providerless = new ProviderlessField();
    injector._lView = { 20: providerless };
    expect(funcHasNativeFormField(node)).toBe(false);

    const invalid = new InvalidField();
    injector._lView = { 20: invalid };
    expect(funcHasNativeFormField(node)).toBe(false);
    expect(providerless.current).not.toHaveBeenCalled();
    expect(invalid.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('ignores values without directive metadata', () => {
    injector._lView = { 20: {} };
    expect(funcHasNativeFormField(node)).toBe(false);

    injector._lView = { 20: null };
    expect(funcHasNativeFormField(node)).toBe(false);

    injector._lView = { 20: 'field' };
    expect(funcHasNativeFormField(node)).toBe(false);
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('ignores a rendered object whose declaration metadata cannot be read', () => {
    const read = jasmine
      .createSpy('constructor')
      .and.throwError('Unreadable declaration');
    helperDefinePropertyDescriptor(instance, 'constructor', {
      get: read,
    });

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(read).toHaveBeenCalledTimes(1);
    expect(instance.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });
});
