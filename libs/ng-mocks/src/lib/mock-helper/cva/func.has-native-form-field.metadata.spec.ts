import { DebugElement, Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

import coreDefineProperty from '../../common/core.define-property';
import coreReflectDirectiveResolve from '../../common/core.reflect.directive-resolve';
import { DirectiveIo } from '../../common/core.types';
import helperDefinePropertyDescriptor from '../../mock-service/helper.define-property-descriptor';

import funcHasNativeFormField from './func.has-native-form-field';

describe('func.has-native-form-field:metadata', () => {
  let node: DebugElement;
  let instance: { current: jasmine.Spy };
  let view: Record<number, unknown>;
  let get: jasmine.Spy;
  let metadata: {
    selector?: string;
    exportAs?: string;
    providers?: unknown[];
    inputs?: DirectiveIo[];
  };

  beforeEach(() => {
    @Directive({
      selector: '[formField]',
      exportAs: 'formField',
      standalone: false,
      providers: [{ provide: NgControl, useValue: {} }],
    })
    class Field {
      @Input({ alias: 'formField', isSignal: true } as never)
      public readonly current = jasmine.createSpy('field input');
    }
    // Each test changes one part of a fresh declaration's normalized metadata.
    metadata = coreReflectDirectiveResolve(Field);
    instance = new Field();
    view = { 20: instance };
    get = jasmine
      .createSpy('get')
      .and.throwError('Unexpected DI lookup');
    node = new DebugElement(document.createElement('input'));
    coreDefineProperty(node, 'injector', {
      get,
      _tNode: {
        attrs: [3, 'formField'],
        directiveStart: 20,
        directiveEnd: 21,
        inputs: { formField: [20] },
      },
      _lView: view,
    });
  });

  it('recognizes an unaliased signal input without reading it', () => {
    metadata.inputs = [{ name: 'formField', isSignal: true }];
    coreDefineProperty(instance, 'formField', instance.current);

    expect(funcHasNativeFormField(node)).toBe(true);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('rejects an unrelated selector', () => {
    metadata.selector = '[ordinaryInput]';

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('rejects an unrelated export name', () => {
    metadata.exportAs = 'ordinaryInput';

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('requires an NgControl provider', () => {
    metadata.providers = [];

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('requires a signal input', () => {
    metadata.inputs = [{ name: 'current', alias: 'formField' }];

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('requires the public formField input name', () => {
    metadata.inputs = [
      { name: 'current', alias: 'otherInput', isSignal: true },
    ];

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('ignores absent provider metadata', () => {
    metadata.providers = undefined;

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('ignores invalid provider entries', () => {
    metadata.providers = [null, instance.constructor];

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('leaves mocked fields on their existing mocked-field path', () => {
    Object.assign(instance, { __ngMocks: true });

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('ignores values without directive metadata', () => {
    for (const value of [{}, null, 'field']) {
      view[20] = value;

      expect(funcHasNativeFormField(node)).toBe(false);
    }
    expect(get).not.toHaveBeenCalled();
  });

  it('ignores unreadable declaration metadata', () => {
    const read = jasmine
      .createSpy('constructor')
      .and.throwError('Unreadable declaration');
    helperDefinePropertyDescriptor(instance, 'constructor', {
      get: read,
    });

    expect(funcHasNativeFormField(node)).toBe(false);
    expect(read).toHaveBeenCalledTimes(1);
    expect(instance.current).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });
});
