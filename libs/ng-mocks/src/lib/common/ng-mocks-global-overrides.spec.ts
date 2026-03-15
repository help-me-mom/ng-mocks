import { TestBed } from '@angular/core/testing';

import {
  patchDebugInjectors,
  installInjector,
} from './ng-mocks-global-overrides';

describe('ng-mocks-global-overrides', () => {
  afterEach(() => {
    delete (TestBed as any).get;
    (TestBed as any).ngMocksGetInstalled = undefined;
    TestBed.resetTestingModule();
  });

  it('patches legacy TestBed.get when present', () => {
    // The declaration replay feature wraps both TestBed.inject and the legacy TestBed.get entrypoint.
    const get = jasmine.createSpy().and.returnValue('value');
    (TestBed as any).get = get;
    (TestBed as any).ngMocksGetInstalled = undefined;

    TestBed.configureTestingModule({});

    expect((TestBed as any).ngMocksGetInstalled).toBe(true);
    expect((TestBed as any).get('token')).toBe('value');
    expect(get).toHaveBeenCalledWith('token');
  });

  it('patches instance-based injectors and tolerates empty nodes', () => {
    // Declaration-local instances are discovered through injector.get, so patched debug injectors
    // must tolerate incomplete trees and still wrap detached injector instances.
    const get = jasmine.createSpy().and.returnValue(undefined);
    const injector: any = {
      constructor: {
        name: 'LocalInjector',
        prototype: {},
      },
      get,
    };

    expect(() => patchDebugInjectors(undefined)).not.toThrow();
    expect(installInjector(injector)).toBe(injector);
    expect(injector.__ngMocksInjector).toBe(true);
    expect(() => patchDebugInjectors({ injector })).not.toThrow();

    injector.get('token');

    expect(get).toHaveBeenCalledWith('token');
  });

  it('patches instance-based injectors without a prototype getter', () => {
    // Some injector implementations expose get directly on the instance, so the wrapper must handle
    // both prototype-based and detached forms.
    const get = jasmine.createSpy().and.returnValue(undefined);
    const injector: any = {
      constructor: {
        name: 'DetachedInjector',
      },
      get,
    };

    expect(installInjector(injector)).toBe(injector);
    expect(injector.__ngMocksInjector).toBe(true);

    injector.get('token');

    expect(get).toHaveBeenCalledWith('token');
  });
});
