import {
  DebugNode,
  Directive,
  EventEmitter,
  Injector,
  Input,
  Output,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import helperDefinePropertyDescriptor from '../../mock-service/helper.define-property-descriptor';

import funcGetModelControl from './func.get-model-control';

@Directive({ selector: '[touchControl]', standalone: false })
class TouchControl {
  @Input() public value = 'initial';
  @Output() public readonly valueChange = new EventEmitter<string>();
  @Output('touch') public touched: EventEmitter<void> | undefined =
    new EventEmitter<void>();
  @Output('touchedChange') public readonly legacy =
    new EventEmitter<boolean>();
}

describe('func.get-model-control:touch', () => {
  it('does not read the legacy touch output when the preferred output is usable', () => {
    const instance = new TouchControl();
    const touches: unknown[] = [];
    instance.touched!.subscribe(value => touches.push(value));
    const read = jasmine
      .createSpy('legacy touch')
      .and.throwError('Unused touch fallback');
    helperDefinePropertyDescriptor(instance, 'legacy', { get: read });
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: TouchControl, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, TouchControl],
    } as unknown as DebugNode;

    funcGetModelControl(node)!.touch!();

    expect(touches).toEqual([undefined]);
    expect(read).not.toHaveBeenCalled();
    expect(instance.value).toBe('initial');
  });

  it('uses the legacy output when a declared preferred output is unavailable', () => {
    const instance = new TouchControl();
    instance.touched = undefined;
    const touches: boolean[] = [];
    const values: string[] = [];
    instance.legacy.subscribe(value => touches.push(value));
    instance.valueChange.subscribe(value => values.push(value));
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: TouchControl, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, TouchControl],
    } as unknown as DebugNode;

    funcGetModelControl(node)!.touch!();

    expect(touches).toEqual([true]);
    expect(values).toEqual([]);
    expect(instance.value).toBe('initial');
  });

  it('preserves errors from reading the preferred output', () => {
    const instance = new TouchControl();
    const touches: boolean[] = [];
    instance.legacy.subscribe(value => touches.push(value));
    const read = jasmine
      .createSpy('preferred touch')
      .and.throwError('Touch output failed');
    helperDefinePropertyDescriptor(instance, 'touched', {
      get: read,
    });
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: TouchControl, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, TouchControl],
    } as unknown as DebugNode;

    expect(() => funcGetModelControl(node)).toThrowError(
      'Touch output failed',
    );
    expect(read).toHaveBeenCalledTimes(1);
    expect(touches).toEqual([]);
    expect(instance.value).toBe('initial');
  });
});
