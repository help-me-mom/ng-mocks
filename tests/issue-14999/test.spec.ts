import { TestBed } from '@angular/core/testing';

import { MockProvider, MockService, ngMocks } from 'ng-mocks';

const request = Symbol('request');
const inherited = Symbol('inherited');
const state = Symbol('state');

class ParentService {
  public [inherited](): string {
    throw new Error('real inherited method');
  }

  public get [state](): string {
    throw new Error('real getter');
  }

  public set [state](value: string) {
    throw new Error('real setter');
  }
}

class TargetService extends ParentService {
  public constructor() {
    super();
    throw new Error('real constructor');
  }

  public [request](): string {
    throw new Error('real method');
  }

  public echo(): string {
    throw new Error('real string method');
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14999
describe('issue-14999', () => {
  it('recognizes and mocks a class containing only a symbol method', () => {
    // Keep this undecorated and without string members to exercise ES5 class detection.
    class SymbolService {
      public constructor() {
        throw new Error('real symbol-only constructor');
      }

      public [request](): string {
        throw new Error('real symbol-only method');
      }
    }

    const mock = MockService(SymbolService);
    expect(typeof mock).toBe('object');
    expect(Object.getPrototypeOf(mock)).toBe(SymbolService.prototype);
    expect(mock[request]()).toBeUndefined();
  });

  it('replaces inherited and own prototype symbols while preserving string dummies', () => {
    const mock = MockService(TargetService);

    expect(mock[request]()).toBeUndefined();
    expect(mock[inherited]()).toBeUndefined();
    expect(mock.echo()).toBeUndefined();
    expect(Object.getPrototypeOf(mock)).toBe(TargetService.prototype);
  });

  it('gives inherited symbol accessors independent state without changing the original descriptor', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      ParentService.prototype,
      state,
    );
    const first = MockService(TargetService);
    const second = MockService(TargetService);

    expect(first[state]).toBeUndefined();
    first[state] = 'first';
    expect(first[state]).toBe('first');
    expect(second[state]).toBeUndefined();
    second[state] = 'second';
    expect(second[state]).toBe('second');
    expect(first[state]).toBe('first');
    expect(
      Object.getOwnPropertyDescriptor(ParentService.prototype, state),
    ).toEqual(descriptor);
  });

  it('mocks own symbol methods on an existing instance without reconstructing it', () => {
    let constructors = 0;
    let calls = 0;
    class OwnService {
      public count = 7;

      public constructor() {
        constructors += 1;
      }

      public echo(): string {
        throw new Error('real existing-instance method');
      }
    }
    const source = Object.assign(new OwnService(), {
      [request]: (): string => {
        calls += 1;
        return 'real';
      },
    });
    const original = source[request];
    const mock = MockService<typeof source>(source);

    expect(constructors).toBe(1);
    expect(calls).toBe(0);
    expect(mock[request]()).toBeUndefined();
    expect(mock.echo()).toBeUndefined();
    expect(mock.count).toBeUndefined();
    expect(calls).toBe(0);
    expect(source[request]).toBe(original);
    expect(source.count).toBe(7);
    expect(Object.getPrototypeOf(mock)).toBe(OwnService.prototype);
  });

  it('mocks own symbol accessors without reading or writing the supplied object', () => {
    const calls: string[] = [];
    const source = {
      get [state](): string {
        calls.push('get');
        return 'real';
      },
      set [state](value: string) {
        calls.push(value);
      },
    };
    const descriptor = Object.getOwnPropertyDescriptor(source, state);
    const mock = MockService<typeof source>(source);

    expect(calls).toEqual([]);
    expect(mock[state]).toBeUndefined();
    mock[state] = 'mock';
    expect(mock[state]).toBe('mock');
    expect(calls).toEqual([]);
    expect(Object.getOwnPropertyDescriptor(source, state)).toEqual(
      descriptor,
    );
    const mockDescriptor = Object.getOwnPropertyDescriptor(
      mock,
      state,
    );
    expect(mockDescriptor && mockDescriptor.get).toBeDefined();
    expect(mockDescriptor && mockDescriptor.set).toBeDefined();
  });

  it('retains symbol override callbacks and accessor descriptors without eager calls', () => {
    const calls: string[] = [];
    const callback = () => {
      calls.push('method');
      return 'override';
    };
    const overrides = {
      [request]: callback,
      get [state](): string {
        calls.push('get');
        return 'override state';
      },
      set [state](value: string) {
        calls.push(value);
      },
    };
    const mock = MockService(TargetService, overrides);

    expect(calls).toEqual([]);
    expect(mock[request]).toBe(callback);
    expect(mock[request]()).toBe('override');
    expect(mock[state]).toBe('override state');
    mock[state] = 'set';
    expect(calls).toEqual(['method', 'get', 'set']);
    expect(Object.getOwnPropertyDescriptor(mock, state)).toEqual(
      Object.getOwnPropertyDescriptor(overrides, state),
    );
    expect(mock.echo()).toBeUndefined();
  });

  it('uses the same symbol dummies through MockProvider injection', () => {
    TestBed.configureTestingModule({
      providers: [MockProvider(TargetService)],
    });

    const mock = ngMocks.findInstance(TargetService);
    expect(mock[request]()).toBeUndefined();
    expect(mock[inherited]()).toBeUndefined();
    expect(mock[state]).toBeUndefined();
    mock[state] = 'provided';
    expect(mock[state]).toBe('provided');
    expect(mock.echo()).toBeUndefined();
    expect(Object.getPrototypeOf(mock)).toBe(TargetService.prototype);
  });
});
