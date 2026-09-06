import {
  ChangeDetectorRef,
  DestroyRef,
  Injector,
  NgModuleRef,
} from '@angular/core';

import { MockService } from '../mock-service/mock-service';

import {
  rememberMockInstance,
  resetMockInstances,
  resolveInstanceLifetime,
  updateMockInstances,
} from './mock-instance-tracker';

class TargetService {
  public value = 'real';
}

describe('mock-instance-tracker', () => {
  beforeEach(resetMockInstances);
  afterEach(resetMockInstances);

  it('updates mocks once and passes their original injector', () => {
    const instance = MockService(TargetService);
    const cleanup: Array<() => void> = [];
    const get = jasmine.createSpy('get').and.returnValue({
      onDestroy: (callback: () => void) => cleanup.push(callback),
    });
    const injector = { get } as unknown as Injector;
    rememberMockInstance(TargetService, instance, injector);
    rememberMockInstance(TargetService, instance, injector);
    const callback = jasmine
      .createSpy('customize')
      .and.returnValue({ value: 'mock' });

    updateMockInstances(TargetService, undefined, callback);

    expect(get).toHaveBeenCalledWith(DestroyRef, undefined);
    expect(cleanup.length).toEqual(1);
    expect(callback).toHaveBeenCalledOnceWith(instance, injector);
    expect(instance.value).toEqual('mock');

    cleanup[0]();
    updateMockInstances(TargetService, 'value', 'destroyed');
    expect(instance.value).toEqual('mock');
  });

  it('ignores tokens and objects which are not managed mocks', () => {
    const instance = MockService(TargetService);
    const real = new TargetService();
    rememberMockInstance('token', instance);
    rememberMockInstance(TargetService, real);

    updateMockInstances('token', 'value', 'changed');
    updateMockInstances(TargetService, 'value', 'changed');

    expect(instance.value).toBeUndefined();
    expect(real.value).toEqual('real');
  });

  it('keeps injector-free callbacks and empty customizations compatible', () => {
    const instance = MockService(TargetService);
    rememberMockInstance(TargetService, instance);
    updateMockInstances(TargetService, undefined, undefined);
    const callback = jasmine
      .createSpy('customize')
      .and.callFake((value: TargetService) => {
        value.value = 'changed';
      });

    updateMockInstances(TargetService, undefined, callback);

    expect(callback).toHaveBeenCalledOnceWith(instance, undefined);
    expect(instance.value).toEqual('changed');
  });

  it('allows custom injectors without lifecycle support', () => {
    const missing = MockService(TargetService);
    const throwing = MockService(TargetService);
    rememberMockInstance(TargetService, missing, {
      get: () => undefined,
    } as unknown as Injector);
    rememberMockInstance(TargetService, throwing, {
      get: () => {
        throw new Error('unsupported');
      },
    } as unknown as Injector);

    updateMockInstances(TargetService, 'value', 'current');
    expect(missing.value).toEqual('current');
    expect(throwing.value).toEqual('current');

    resetMockInstances();
    updateMockInstances(TargetService, 'value', 'old');
    expect(missing.value).toEqual('current');
    expect(throwing.value).toEqual('current');
  });

  it('does not update an instance destroyed by an earlier callback', () => {
    const first = MockService(TargetService);
    const second = MockService(TargetService);
    const cleanup: Array<() => void> = [];
    const injector = {
      get: () => ({
        onDestroy: (callback: () => void) => cleanup.push(callback),
      }),
    } as unknown as Injector;
    rememberMockInstance(TargetService, first, injector);
    rememberMockInstance(TargetService, second, injector);
    const callback = jasmine
      .createSpy('customize')
      .and.callFake(() => cleanup[1]());

    updateMockInstances(TargetService, undefined, callback);

    expect(callback).toHaveBeenCalledOnceWith(first, injector);
  });

  it('stops an in-progress update when the test environment resets', () => {
    const first = MockService(TargetService);
    const second = MockService(TargetService);
    rememberMockInstance(TargetService, first);
    rememberMockInstance(TargetService, second);
    const callback = jasmine
      .createSpy('customize')
      .and.callFake(resetMockInstances);

    updateMockInstances(TargetService, undefined, callback);

    expect(callback).toHaveBeenCalledOnceWith(first, undefined);
  });

  it('keeps new records when a previous environment later destroys its instances', () => {
    const old = MockService(TargetService);
    const current = MockService(TargetService);
    const cleanup: Array<() => void> = [];
    rememberMockInstance(TargetService, old, {
      get: () => ({
        onDestroy: (callback: () => void) => cleanup.push(callback),
      }),
    } as unknown as Injector);
    resetMockInstances();
    rememberMockInstance(TargetService, current);

    cleanup[0]();
    updateMockInstances(TargetService, 'value', 'current');

    expect(old.value).toBeUndefined();
    expect(current.value).toEqual('current');
  });

  it('uses the legacy module lifetime for non-view providers', () => {
    const module = { onDestroy: jasmine.createSpy('onDestroy') };
    const get = jasmine
      .createSpy('get')
      .and.returnValues(null, module);

    expect(
      resolveInstanceLifetime({ get } as unknown as Injector, null),
    ).toBe(module);
    expect(get.calls.allArgs()).toEqual([
      [ChangeDetectorRef, null],
      [NgModuleRef, undefined],
    ]);
  });

  it('uses an injector lifetime directly without resolving more providers', () => {
    const injector = {
      get: jasmine.createSpy('get'),
      onDestroy: jasmine.createSpy('onDestroy'),
    };
    const cleanup = jasmine.createSpy('cleanup');

    resolveInstanceLifetime(
      injector as unknown as Injector,
    )!.onDestroy(cleanup);

    expect(injector.onDestroy).toHaveBeenCalledOnceWith(cleanup);
    expect(injector.get).not.toHaveBeenCalled();
  });

  it('preserves custom legacy view references', () => {
    const view = { onDestroy: jasmine.createSpy('onDestroy') };
    const injector = { get: () => view } as unknown as Injector;

    expect(resolveInstanceLifetime(injector, null)).toBe(view);
  });

  it('keeps legacy Ivy cleanup separate from compiler-owned template slots', () => {
    const original = jasmine.createSpy('original');
    const hooks: any[] = [0, original];
    const cleanup = Object.freeze([]);
    const tView = { destroyHooks: hooks, cleanup };
    const first: any = [null, tView];
    const second: any = [null, tView];
    const get = jasmine.createSpy('get');
    const firstCleanup = jasmine.createSpy('first');
    const extraCleanup = jasmine.createSpy('extra');
    const secondCleanup = jasmine.createSpy('second');
    const firstLifetime = resolveInstanceLifetime(
      { _lView: first, get } as unknown as Injector,
      null,
    )!;
    firstLifetime.onDestroy(firstCleanup);
    firstLifetime.onDestroy(extraCleanup);
    resolveInstanceLifetime(
      { _lView: second, get } as unknown as Injector,
      null,
    )!.onDestroy(secondCleanup);

    expect(get).not.toHaveBeenCalled();
    expect(tView.cleanup).toBe(cleanup);
    expect(hooks.length).toEqual(4);
    expect(hooks[0]).toEqual(0);
    expect(hooks[1]).toBe(original);
    expect(first[0]).toBeNull();
    expect(second[0]).toBeNull();

    // Angular looks up each hook's context on the particular LView being destroyed.
    hooks[3].call(first[hooks[2]]);
    hooks[3].call(first[hooks[2]]);
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(extraCleanup).toHaveBeenCalledTimes(1);
    expect(secondCleanup).not.toHaveBeenCalled();

    hooks[3].call(second[hooks[2]]);
    expect(secondCleanup).toHaveBeenCalledTimes(1);
    expect(original).not.toHaveBeenCalled();
  });

  it('supports legacy Ivy providers first resolved after template creation', () => {
    const tView: any = { firstCreatePass: false, destroyHooks: null };
    const view: any = [null, tView];
    const cleanup = jasmine.createSpy('cleanup');

    resolveInstanceLifetime(
      { _lView: view } as unknown as Injector,
      null,
    )!.onDestroy(cleanup);

    const hooks = tView.destroyHooks;
    // Other instances of this template need not have resolved any tracked providers.
    hooks[1].call(undefined);
    expect(cleanup).not.toHaveBeenCalled();

    hooks[1].call(view[hooks[0]]);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('registers cleanup on the owning View Engine view without changing the shared detector', () => {
    const containing: Array<() => void> = [];
    const owning: Array<() => void> = [];
    const view = {
      _view: containing,
      onDestroy(callback: () => void) {
        this._view.push(callback);
      },
    };
    const injector = {
      view: owning,
      get: () => view,
    } as unknown as Injector;
    const cleanup = jasmine.createSpy('cleanup');

    resolveInstanceLifetime(injector, null)!.onDestroy(cleanup);

    expect(view._view).toBe(containing);
    expect(containing).toEqual([]);
    expect(owning).toEqual([cleanup]);
  });
});
