import { EventEmitter, isSignal, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { extendClass } from '../common/core.helpers';
import funcDirectiveIoParse from '../common/func.directive-io-parse';
import { Mock } from '../common/mock';
import collectDeclarations from '../resolve/collect-declarations';

import decorateDeclaration from './decorate-declaration';

describe('decorate-declaration:outputs', () => {
  it('creates a usable mock when a declaration has no binding or query metadata', () => {
    class TargetComponent {}

    const mock = extendClass(Mock);
    decorateDeclaration(TargetComponent, mock, {}, {});
    const instance: any = new mock();
    const reflected = collectDeclarations(mock);

    expect(instance instanceof TargetComponent).toBe(true);
    expect(instance.__ngMocksConfig.inputs).toBeUndefined();
    expect(instance.__ngMocksConfig.outputs).toEqual([]);
    expect(instance.__ngMocksConfig.queryScanKeys).toEqual([]);
    expect(reflected.inputs).toEqual([]);
    expect(reflected.outputs).toEqual([]);
  });

  it('separates model emitters from their signal inputs only on the mock', () => {
    class TargetComponent {}

    const mock = extendClass(Mock);
    const outputs = ['value:valueChange', 'label:publicLabelChange'];
    decorateDeclaration(
      TargetComponent,
      mock,
      {
        inputs: [
          { name: 'value', isSignal: true },
          { name: 'label', alias: 'publicLabel', isSignal: true },
        ] as never,
        outputs,
        queries: {},
      },
      {},
    );
    const instance: any = TestBed.runInInjectionContext(
      () => new mock(),
    );
    const reflected = collectDeclarations(mock);
    const values: string[] = [];
    const labels: string[] = [];

    expect(isSignal(instance.value)).toBe(true);
    expect(isSignal(instance.label)).toBe(true);
    expect(instance.valueChange).toEqual(jasmine.any(EventEmitter));
    expect(instance.publicLabelChange).toEqual(
      jasmine.any(EventEmitter),
    );
    expect(reflected.outputs).toEqual([
      'publicLabelChange',
      'valueChange',
    ]);
    expect(outputs).toEqual([
      'value:valueChange',
      'label:publicLabelChange',
    ]);

    instance.valueChange.subscribe((value: string) =>
      values.push(value),
    );
    instance.publicLabelChange.subscribe((value: string) =>
      labels.push(value),
    );
    instance.valueChange.emit('value');
    instance.publicLabelChange.emit('label');

    expect(values).toEqual(['value']);
    expect(labels).toEqual(['label']);
    expect(isSignal(instance.value)).toBe(true);
    expect(isSignal(instance.label)).toBe(true);
  });

  it('preserves ordinary property names when an input or output alias ends in Change', () => {
    class TargetComponent {}

    const mock = extendClass(Mock);
    decorateDeclaration(
      TargetComponent,
      mock,
      {
        inputs: ['value:valueChange'],
        outputs: ['selected:selectedChange'],
        queries: {},
      },
      {},
    );
    const instance: any = new mock();
    const reflected = collectDeclarations(mock);
    const values: string[] = [];

    expect(reflected.inputs).toEqual(['value:valueChange']);
    expect(reflected.outputs).toEqual(['selected:selectedChange']);
    expect(instance.selected).toEqual(jasmine.any(EventEmitter));
    expect(instance.selectedChange).toBeUndefined();

    instance.selected.subscribe((value: string) =>
      values.push(value),
    );
    instance.selected.emit('selected');

    expect(values).toEqual(['selected']);
  });

  it('reserves a distinct model emitter property when its public output collides with inputs', () => {
    class TargetComponent {}

    const mock = extendClass(Mock);
    decorateDeclaration(
      TargetComponent,
      mock,
      {
        inputs: [
          { name: 'valueChange', alias: 'value', isSignal: true },
          '__ngMocksOutput_valueChange',
        ] as never,
        outputs: ['valueChange'],
        queries: {},
      },
      {},
    );
    const instance: any = TestBed.runInInjectionContext(
      () => new mock(),
    );
    const output = funcDirectiveIoParse(
      instance.__ngMocksConfig.outputs[0],
    );
    const values: string[] = [];

    expect(output.alias).toBe('valueChange');
    expect(output.name).not.toBe('valueChange');
    expect(output.name).not.toBe('__ngMocksOutput_valueChange');
    expect(isSignal(instance.valueChange)).toBe(true);
    expect(instance.__ngMocksOutput_valueChange).toBeUndefined();
    expect(instance[output.name]).toEqual(jasmine.any(EventEmitter));

    instance[output.name].subscribe((value: string) =>
      values.push(value),
    );
    instance[output.name].emit('child');

    expect(values).toEqual(['child']);
    expect(isSignal(instance.valueChange)).toBe(true);
  });

  it('preserves query properties when a model output uses the same public name', () => {
    class TargetComponent {}

    const mock = extendClass(Mock);
    decorateDeclaration(
      TargetComponent,
      mock,
      {
        inputs: [
          { name: 'count', alias: 'quantity', isSignal: true },
        ] as never,
        outputs: ['count:quantityChange'],
        queries: { quantityChange: new ViewChild('child') },
      },
      {},
    );
    const instance: any = TestBed.runInInjectionContext(
      () => new mock(),
    );
    const output = funcDirectiveIoParse(
      instance.__ngMocksConfig.outputs[0],
    );
    const query = {};
    const values: number[] = [];
    instance.quantityChange = query;

    expect(output.alias).toBe('quantityChange');
    expect(output.name).not.toBe('quantityChange');
    expect(instance[output.name]).toEqual(jasmine.any(EventEmitter));
    expect(
      collectDeclarations(mock).queries.quantityChange.selector,
    ).toBe('child');

    instance[output.name].subscribe((value: number) =>
      values.push(value),
    );
    instance[output.name].emit(2);

    expect(values).toEqual([2]);
    expect(instance.quantityChange).toBe(query);
    expect(isSignal(instance.count)).toBe(true);
  });

  it('preserves inherited methods and accessors beside model outputs with matching public names', () => {
    class ParentComponent {
      public quantityChange(): string {
        return 'real';
      }

      public get totalChange(): string {
        return 'real';
      }
    }

    class TargetComponent extends ParentComponent {}

    const mock = extendClass(Mock);
    decorateDeclaration(
      TargetComponent,
      mock,
      {
        inputs: [
          { name: 'count', alias: 'quantity', isSignal: true },
          { name: 'other', alias: 'total', isSignal: true },
        ] as never,
        outputs: ['count:quantityChange', 'other:totalChange'],
        queries: {},
      },
      {},
    );
    const instance: any = TestBed.runInInjectionContext(
      () => new mock(),
    );
    const quantityOutput = funcDirectiveIoParse(
      instance.__ngMocksConfig.outputs[0],
    );
    const totalOutput = funcDirectiveIoParse(
      instance.__ngMocksConfig.outputs[1],
    );
    const method = instance.quantityChange;
    const accessor = Object.getOwnPropertyDescriptor(
      instance,
      'totalChange',
    );
    const values: number[] = [];

    expect(quantityOutput.name).not.toBe('quantityChange');
    expect(totalOutput.name).not.toBe('totalChange');
    expect(typeof method).toBe('function');
    expect(accessor?.get).toBeDefined();
    expect(instance.totalChange).toBeUndefined();

    instance[quantityOutput.name].subscribe((value: number) =>
      values.push(value),
    );
    instance[totalOutput.name].subscribe((value: number) =>
      values.push(value),
    );
    instance[quantityOutput.name].emit(2);
    instance[totalOutput.name].emit(3);

    expect(values).toEqual([2, 3]);
    expect(instance.quantityChange).toBe(method);
    expect(
      Object.getOwnPropertyDescriptor(instance, 'totalChange')?.get,
    ).toBe(accessor?.get);
    expect(isSignal(instance.count)).toBe(true);
    expect(isSignal(instance.other)).toBe(true);
  });

  it('preserves host binding and listener properties beside model outputs with matching public names', () => {
    class TargetComponent {}

    const mock = extendClass(Mock);
    decorateDeclaration(
      TargetComponent,
      mock,
      {
        inputs: [
          { name: 'count', alias: 'quantity', isSignal: true },
          { name: 'other', alias: 'total', isSignal: true },
        ] as never,
        outputs: ['count:quantityChange', 'other:totalChange'],
        queries: {},
        hostBindings: [['quantityChange', 'attr.data-quantity']],
        hostListeners: [['totalChange', 'click', []]],
      },
      {},
    );
    const instance: any = TestBed.runInInjectionContext(
      () => new mock(),
    );
    const quantityOutput = funcDirectiveIoParse(
      instance.__ngMocksConfig.outputs[0],
    );
    const totalOutput = funcDirectiveIoParse(
      instance.__ngMocksConfig.outputs[1],
    );
    const binding = Object.getOwnPropertyDescriptor(
      instance,
      'quantityChange',
    );
    const listener = instance.totalChange;
    const values: number[] = [];

    expect(quantityOutput.name).not.toBe('quantityChange');
    expect(totalOutput.name).not.toBe('totalChange');
    expect(binding?.get).toBeDefined();
    expect(binding?.set).toBeDefined();
    expect(typeof listener).toBe('function');

    instance[quantityOutput.name].subscribe((value: number) =>
      values.push(value),
    );
    instance[totalOutput.name].subscribe((value: number) =>
      values.push(value),
    );
    instance[quantityOutput.name].emit(2);
    instance[totalOutput.name].emit(3);

    expect(values).toEqual([2, 3]);
    expect(
      Object.getOwnPropertyDescriptor(instance, 'quantityChange')
        ?.get,
    ).toBe(binding?.get);
    expect(instance.totalChange).toBe(listener);
  });
});
