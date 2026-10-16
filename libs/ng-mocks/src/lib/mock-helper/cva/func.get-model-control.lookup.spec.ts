import {
  DebugNode,
  Directive,
  EventEmitter,
  Injector,
  Input,
  Output,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import coreDefineProperty from '../../common/core.define-property';
import helperDefinePropertyDescriptor from '../../mock-service/helper.define-property-descriptor';

import funcGetModelControl from './func.get-model-control';

@Directive({ selector: '[valueControl]', standalone: false })
class ValueControl {
  @Input() public value = 'initial';
  @Output() public readonly valueChange = new EventEmitter<string>();
}

describe('func.get-model-control:lookup', () => {
  it('reads metadata from the local instance without resolving its provider twice', () => {
    const instance = new ValueControl();
    const values: string[] = [];
    instance.valueChange.subscribe(value => values.push(value));
    const injector = Injector.create({
      providers: [
        { provide: NgControl, useValue: { valueAccessor: null } },
        { provide: ValueControl, useValue: instance },
      ],
    });
    const get = spyOn(injector, 'get').and.callThrough();
    const node = {
      nativeNode: {},
      injector,
      providerTokens: [NgControl, ValueControl],
    } as unknown as DebugNode;

    const control = funcGetModelControl(node);
    control!.change('updated');

    expect(
      get.calls.allArgs().filter(args => args[0] === ValueControl)
        .length,
    ).toBe(1);
    expect(values).toEqual(['updated']);
    expect(instance.value).toBe('initial');
    expect(control?.touch).toBeUndefined();
  });

  it('skips unreadable declaration metadata and preserves a later local control', () => {
    @Directive({ selector: '[unreadableControl]', standalone: false })
    class UnreadableControl {}
    class UnreadableMetadata {}
    const unreadable = new UnreadableControl();
    const read = jasmine
      .createSpy('annotations')
      .and.throwError('Unreadable metadata');
    helperDefinePropertyDescriptor(
      UnreadableMetadata,
      '__annotations__',
      { get: read },
    );
    coreDefineProperty(unreadable, 'constructor', UnreadableMetadata);
    const instance = new ValueControl();
    const values: string[] = [];
    instance.valueChange.subscribe(value => values.push(value));
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: UnreadableControl, useValue: unreadable },
          { provide: ValueControl, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, UnreadableControl, ValueControl],
    } as unknown as DebugNode;

    funcGetModelControl(node)!.change('updated');

    expect(read).toHaveBeenCalled();
    expect(values).toEqual(['updated']);
    expect(instance.value).toBe('initial');
  });

  it('skips a declaration without a local instance', () => {
    @Directive({ selector: '[missingControl]', standalone: false })
    class MissingControl {}
    const instance = new ValueControl();
    const values: string[] = [];
    instance.valueChange.subscribe(value => values.push(value));
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: MissingControl, useValue: null },
          { provide: ValueControl, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, MissingControl, ValueControl],
    } as unknown as DebugNode;

    funcGetModelControl(node)!.change('updated');

    expect(values).toEqual(['updated']);
    expect(instance.value).toBe('initial');
  });

  it('preserves errors from resolving a declaration provider', () => {
    const create = jasmine
      .createSpy('create control')
      .and.throwError('Declaration creation failed');
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: ValueControl, useFactory: create },
        ],
      }),
      providerTokens: [NgControl, ValueControl],
    } as unknown as DebugNode;

    expect(() => funcGetModelControl(node)).toThrowError(
      'Declaration creation failed',
    );
    expect(create).toHaveBeenCalledTimes(1);
  });
});
