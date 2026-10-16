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
  // The spread specs exercise real FormField declarations and native events.
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

describe('func.has-native-form-field:bindings', () => {
  let node: DebugElement;
  let nodeInputs: NodeInputs;
  let injector: {
    get: jasmine.Spy;
    _tNode?: NodeInputs;
    _lView?: Record<number, unknown>;
  };
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
    nodeInputs = {
      // Angular stores bound-input names after attribute marker 3.
      attrs: [3, 'formField'],
      directiveStart: 20,
      directiveEnd: 21,
      inputs: { formField: [20] },
    };
    injector = {
      get: jasmine
        .createSpy('get')
        .and.throwError('Unexpected DI lookup'),
      _tNode: nodeInputs,
      _lView: { 20: instance },
    };
    node = new DebugElement(document.createElement('input'));
    coreDefineProperty(node, 'nativeElement', element);
    coreDefineProperty(node, 'injector', injector);
  });

  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
    it(`recognizes a bound ${tagName} without side effects`, () => {
      element.tagName = tagName;

      expect(funcHasNativeFormField(node)).toBe(true);
      expect(instance.current).not.toHaveBeenCalled();
      expect(element.value).toBe('initial');
      expect(element.dispatchEvent).not.toHaveBeenCalled();
      expect(injector.get).not.toHaveBeenCalled();
    });
  }

  for (const tagName of ['DIV', 'CUSTOM-CONTROL', undefined]) {
    it(`ignores a nonnative host: ${tagName}`, () => {
      element.tagName = tagName;

      expect(funcHasNativeFormField(node)).toBe(false);
      expect(instance.current).not.toHaveBeenCalled();
      expect(injector.get).not.toHaveBeenCalled();
    });
  }

  it('ignores a missing native element', () => {
    coreDefineProperty(node, 'nativeElement', undefined);

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('finds a forwarded host-directive alias among unrelated inputs', () => {
    nodeInputs.attrs = [
      'name',
      'inputName',
      3,
      'otherInput',
      'inputField',
    ];
    nodeInputs.inputs = { otherInput: [19] };
    nodeInputs.hostDirectiveInputs = {
      inputField: [19, 'formField', 20, 'formField'],
    };

    expect(funcHasNativeFormField(node)).toBe(true);
    expect(instance.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('rejects forwarding to an unrelated input', () => {
    nodeInputs.attrs = [3, 'inputField'];
    nodeInputs.inputs = undefined;
    nodeInputs.hostDirectiveInputs = {
      inputField: [20, 'otherInput'],
    };

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('skips unrelated instances and stops at the first real field', () => {
    const read = jasmine.createSpy('later declaration');
    const later = {};
    helperDefinePropertyDescriptor(later, 'constructor', {
      get: read,
    });
    nodeInputs.directiveEnd = 23;
    nodeInputs.inputs = { formField: [20, 21, 22] };
    injector._lView = { 20: {}, 21: instance, 22: later };

    expect(funcHasNativeFormField(node)).toBe(true);
    expect(read).not.toHaveBeenCalled();
    expect(instance.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  for (const { name, attrs } of [
    { name: 'missing attributes', attrs: undefined },
    { name: 'empty attributes', attrs: [] },
    { name: 'a static attribute', attrs: ['formField', 'static'] },
    { name: 'a static value', attrs: ['title', 'formField'] },
    { name: 'a class name', attrs: [1, 'formField'] },
    { name: 'a style name', attrs: [2, 'formField', 'block'] },
    { name: 'an unrelated binding', attrs: [3, 'unrelated'] },
    {
      name: 'a class after a binding',
      attrs: [3, 'unrelated', 1, 'formField'],
    },
  ]) {
    it(`rejects ${name} as a field binding`, () => {
      nodeInputs.attrs = attrs;

      expect(funcHasNativeFormField(node)).toBe(false);
      expect(instance.current).not.toHaveBeenCalled();
      expect(injector.get).not.toHaveBeenCalled();
    });
  }

  it('ignores an injector without node metadata', () => {
    injector._tNode = undefined;

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('ignores a missing rendered view', () => {
    injector._lView = undefined;

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('requires a rendered directive instance', () => {
    injector._lView = {};

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('requires a current-node input table', () => {
    nodeInputs.inputs = undefined;

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('rejects flags and directive indices outside the current node', () => {
    nodeInputs.inputs = { formField: [1, 19, 21, 'field'] };
    injector._lView = { 1: instance, 19: instance, 21: instance };

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('does not use an ancestor or a DI provider as a local binding', () => {
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
});
