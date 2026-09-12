import {
  InjectionToken,
  Injector,
  Pipe,
  PipeTransform,
} from '@angular/core';

import coreInjector from '../common/core.injector';

import funcGetFromNodeInjector from './func.get-from-node-injector';

@Pipe({ name: 'target14926' })
class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return value;
  }
}

describe('func.get-from-node-injector', () => {
  it('forwards a local lazy provider failure without changing the results', () => {
    const token = new InjectionToken<string>('local');
    const originalError = new Error('local provider failure');
    const factory = jasmine.createSpy('factory').and.callFake(() => {
      throw originalError;
    });
    const node = {
      injector: Injector.create({
        providers: [{ provide: token, useFactory: factory }],
      }),
      parent: null,
    };
    const result: string[] = ['existing'];
    let caught = false;

    try {
      funcGetFromNodeInjector(result, node as never, token);
    } catch (error) {
      caught = true;
      expect(error).toBe(originalError);
    }

    expect(caught).toBe(true);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(result).toEqual(['existing']);
  });

  it('forwards an inherited factory failure before a parent probe can retry it', () => {
    const token = new InjectionToken<string>('inherited');
    const originalError = new Error('inherited provider failure');
    const factory = jasmine.createSpy('factory').and.callFake(() => {
      throw originalError;
    });
    const parent = Injector.create({
      providers: [{ provide: token, useFactory: factory }],
    });
    const node = {
      injector: Injector.create({ parent, providers: [] }),
      parent: { injector: parent, parent: null },
    };
    const result: string[] = [];
    let caught = false;

    try {
      funcGetFromNodeInjector(result, node as never, token);
    } catch (error) {
      caught = true;
      expect(error).toBe(originalError);
    }

    expect(caught).toBe(true);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('keeps a successful local override when the optional parent provider fails', () => {
    const token = new InjectionToken<object>('override');
    const instance = {};
    const factory = jasmine
      .createSpy('parent factory')
      .and.callFake(() => {
        throw new Error('unused parent provider');
      });
    const parent = Injector.create({
      providers: [{ provide: token, useFactory: factory }],
    });
    const node = {
      injector: Injector.create({
        parent,
        providers: [{ provide: token, useValue: instance }],
      }),
      parent: { injector: parent, parent: null },
    };
    const result: object[] = [];

    funcGetFromNodeInjector(result, node as never, token);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(instance);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('preserves missing and undefined node results while retaining null and false', () => {
    const missing = new InjectionToken<string>('missing');
    const provided = new InjectionToken<undefined | null | boolean>(
      'provided',
    );
    const missingResult: string[] = [];
    const result: Array<undefined | null | boolean> = [];
    const missingNode = {
      injector: Injector.create({ providers: [] }),
      parent: null,
    };

    funcGetFromNodeInjector(
      missingResult,
      missingNode as never,
      missing,
    );
    expect(missingResult).toEqual([]);
    for (const value of [undefined, null, false]) {
      const node = {
        injector: Injector.create({
          providers: [{ provide: provided, useValue: value }],
        }),
        parent: null,
      };
      funcGetFromNodeInjector(result, node as never, provided);
    }

    expect(result).toEqual([null, false]);
  });

  it('keeps inherited instances at the parent and deduplicates shared class instances', () => {
    class Service {}

    const instance = new Service();
    const parentInjector = Injector.create({
      providers: [{ provide: Service, useValue: instance }],
    });
    const parent = { injector: parentInjector, parent: null };
    const child = {
      injector: Injector.create({
        parent: parentInjector,
        providers: [],
      }),
      parent,
    };
    const sibling = {
      injector: Injector.create({
        providers: [{ provide: Service, useValue: instance }],
      }),
      parent: null,
    };
    const result: Service[] = [];

    funcGetFromNodeInjector(result, child as never, Service);
    expect(result).toEqual([]);
    funcGetFromNodeInjector(result, parent as never, Service);
    funcGetFromNodeInjector(result, sibling as never, Service);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(instance);
  });

  it('keeps the shared optional injector probe tolerant of failures', () => {
    const token = new InjectionToken<string>('optional');
    const factory = jasmine.createSpy('factory').and.callFake(() => {
      throw new Error('optional probe failure');
    });
    const injector = Injector.create({
      providers: [{ provide: token, useFactory: factory }],
    });

    expect(coreInjector(token, injector)).toBeUndefined();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('keeps a failing nonlocal pipe provider optional during declaration discovery', () => {
    const factory = jasmine
      .createSpy('pipe factory')
      .and.callFake(() => {
        throw new Error(
          'nonlocal pipe cannot resolve its dependency',
        );
      });
    const node = {
      injector: Injector.create({
        providers: [{ provide: TargetPipe, useFactory: factory }],
      }),
      parent: null,
      providerTokens: [],
    };
    const result: TargetPipe[] = [];

    funcGetFromNodeInjector(result, node as never, TargetPipe);

    expect(result).toEqual([]);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('forwards the original error from a local pipe provider', () => {
    const originalError = new Error('local pipe provider failure');
    const factory = jasmine
      .createSpy('pipe factory')
      .and.callFake(() => {
        throw originalError;
      });
    const node = {
      injector: Injector.create({
        providers: [{ provide: TargetPipe, useFactory: factory }],
      }),
      parent: null,
      providerTokens: [TargetPipe],
    };
    const result: TargetPipe[] = [];
    let caught = false;

    try {
      funcGetFromNodeInjector(result, node as never, TargetPipe);
    } catch (error) {
      caught = true;
      expect(error).toBe(originalError);
    }

    expect(caught).toBe(true);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('preserves a successful nonlocal pipe provider identity', () => {
    const instance = new TargetPipe();
    const node = {
      injector: Injector.create({
        providers: [{ provide: TargetPipe, useValue: instance }],
      }),
      parent: null,
      providerTokens: [],
    };
    const result: TargetPipe[] = [];

    funcGetFromNodeInjector(result, node as never, TargetPipe);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(instance);
    expect(result[0].transform('value')).toBe('value');
  });
});
