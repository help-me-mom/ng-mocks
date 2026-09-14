import { InjectionToken } from '@angular/core';

import funcGetName from './func.get-name';

describe('func.get-name', () => {
  it('detects unknown', () => {
    expect(funcGetName(false)).toEqual('unknown');
  });

  it('does not invoke own or inherited constructor getters', () => {
    const calls: string[] = [];
    const prototype = {
      get constructor(): typeof Object {
        calls.push('constructor');

        return Object;
      },
    };
    const inherited: object = Object.create(prototype);
    const descriptor = Object.getOwnPropertyDescriptor(
      prototype,
      'constructor',
    );

    const ownName = funcGetName(prototype);
    const inheritedName = funcGetName(inherited);

    expect(calls).toEqual([]);
    expect(ownName).toEqual('unknown');
    expect(inheritedName).toEqual('unknown');
    expect(
      Object.getOwnPropertyDescriptor(prototype, 'constructor'),
    ).toEqual(descriptor);
  });

  it('preserves function and data constructor names', () => {
    class TargetService {}
    const targetFunction = () => undefined;
    const customPrototype = { constructor: TargetService };
    const inherited: object = Object.create(customPrototype);

    expect(funcGetName(TargetService)).toEqual('TargetService');
    expect(funcGetName(TargetService.prototype)).toEqual(
      'TargetService',
    );
    expect(funcGetName(targetFunction)).toEqual('targetFunction');
    expect(funcGetName(() => undefined)).toEqual('arrowFunction');
    expect(funcGetName(inherited)).toEqual('TargetService');
    expect(funcGetName({})).toEqual('Object');
    expect(funcGetName(Object.prototype)).toEqual('Object');
  });

  it('uses unknown for objects without a usable constructor', () => {
    const terminal: object = Object.create(null);

    expect(funcGetName(terminal)).toEqual('unknown');
    expect(funcGetName({ constructor: undefined })).toEqual(
      'unknown',
    );
    expect(funcGetName({ constructor: 'application data' })).toEqual(
      'unknown',
    );
  });

  it('preserves and sanitizes InjectionToken descriptions', () => {
    const token = new InjectionToken<object>('target / input-value');
    const unnamed = new InjectionToken<object>('');

    expect(funcGetName(token)).toEqual('target_input_value');
    expect(funcGetName(unnamed)).toEqual('unknown');
  });
});
