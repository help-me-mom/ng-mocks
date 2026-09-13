import { TestBed } from '@angular/core/testing';

import { MockProvider, MockService, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/15002
describe('issue-15002', () => {
  it('keeps a child method callable over an inherited runtime accessor', () => {
    const calls: string[] = [];
    class ParentService {
      public constructor() {
        calls.push('parent constructor');
      }

      public request(): string {
        calls.push('parent method');
        return 'parent';
      }

      public inherited(): string {
        calls.push('inherited method');
        return 'inherited';
      }
    }
    class IntermediateService extends ParentService {}
    class TargetService extends IntermediateService {
      public constructor() {
        super();
        calls.push('child constructor');
      }

      public request(): string {
        calls.push('child method');
        return 'child';
      }
    }

    // A memoizing decorator can replace the parent's method with an accessor.
    ngMocks.stubMember(
      ParentService.prototype,
      'request',
      () => {
        calls.push('parent getter');
        return () => {
          calls.push('parent accessor result');
          return 'parent accessor';
        };
      },
      'get',
    );
    ngMocks.stubMember(
      ParentService.prototype,
      'request',
      () => {
        calls.push('parent setter');
      },
      'set',
    );
    const parentDescriptor = Object.getOwnPropertyDescriptor(
      ParentService.prototype,
      'request',
    );
    const childDescriptor = Object.getOwnPropertyDescriptor(
      TargetService.prototype,
      'request',
    );

    const mock = MockService(TargetService);
    const descriptor = Object.getOwnPropertyDescriptor(
      mock,
      'request',
    );
    expect(calls).toEqual([]);
    expect(Object.getPrototypeOf(mock)).toBe(TargetService.prototype);
    expect(descriptor).toBeDefined();
    expect(descriptor!.get).toBeUndefined();
    expect(descriptor!.set).toBeUndefined();
    expect(descriptor!.value).toBe(mock.request);
    expect(typeof mock.request).toBe('function');
    expect(mock.request()).toBeUndefined();
    expect(mock.inherited()).toBeUndefined();
    expect(calls).toEqual([]);
    expect(
      Object.getOwnPropertyDescriptor(
        ParentService.prototype,
        'request',
      ),
    ).toEqual(parentDescriptor);
    expect(
      Object.getOwnPropertyDescriptor(
        TargetService.prototype,
        'request',
      ),
    ).toEqual(childDescriptor);
  });

  it('preserves child accessor state and explicit stubs over a parent method', () => {
    const calls: string[] = [];
    class ParentService {
      public constructor() {
        calls.push('parent constructor');
      }

      public request(): string {
        calls.push('parent method');
        return 'parent';
      }
    }
    class TargetService extends ParentService {
      public constructor() {
        super();
        calls.push('child constructor');
      }

      public request(): string {
        calls.push('child method');
        return 'child';
      }
    }
    ngMocks.stubMember(
      TargetService.prototype,
      'request',
      () => {
        calls.push('child getter');
        return () => {
          calls.push('child accessor result');
          return 'child accessor';
        };
      },
      'get',
    );
    ngMocks.stubMember(
      TargetService.prototype,
      'request',
      () => {
        calls.push('child setter');
      },
      'set',
    );
    const parentDescriptor = Object.getOwnPropertyDescriptor(
      ParentService.prototype,
      'request',
    );
    const childDescriptor = Object.getOwnPropertyDescriptor(
      TargetService.prototype,
      'request',
    );

    const mock = MockService(TargetService);
    const descriptor = Object.getOwnPropertyDescriptor(
      mock,
      'request',
    );
    expect(
      Object.getPrototypeOf(mock) === TargetService.prototype,
    ).toBe(true);
    expect(descriptor).toBeDefined();
    expect(typeof descriptor!.get).toBe('function');
    expect(typeof descriptor!.set).toBe('function');
    expect(descriptor!.value).toBeUndefined();
    expect(mock.request).toBeUndefined();
    const assigned = () => 'assigned';
    mock.request = assigned;
    expect(mock.request).toBe(assigned);
    expect(mock.request()).toBe('assigned');
    expect(calls).toEqual([]);

    const custom = () => 'custom';
    const getter = () => custom;
    const writes: Array<() => string> = [];
    const setter = (value: () => string) => {
      writes.push(value);
    };
    ngMocks.stubMember(mock, 'request', getter, 'get');
    ngMocks.stubMember(mock, 'request', setter, 'set');
    expect(mock.request).toBe(custom);
    expect(mock.request()).toBe('custom');
    mock.request = assigned;
    expect(writes.length).toBe(1);
    expect(writes[0]).toBe(assigned);
    expect(
      Object.getOwnPropertyDescriptor(mock, 'request')!.get,
    ).toBe(getter);
    expect(
      Object.getOwnPropertyDescriptor(mock, 'request')!.set,
    ).toBe(setter);
    expect(calls).toEqual([]);
    expect(
      Object.getOwnPropertyDescriptor(
        ParentService.prototype,
        'request',
      ),
    ).toEqual(parentDescriptor);
    expect(
      Object.getOwnPropertyDescriptor(
        TargetService.prototype,
        'request',
      ),
    ).toEqual(childDescriptor);
  });

  it('injects one MockProvider instance with the child method preserved', () => {
    const calls: string[] = [];
    class ParentService {
      public constructor() {
        calls.push('parent constructor');
      }

      public request(): string {
        calls.push('parent method');
        return 'parent';
      }
    }
    class TargetService extends ParentService {
      public constructor() {
        super();
        calls.push('child constructor');
      }

      public request(): string {
        calls.push('child method');
        return 'child';
      }
    }
    ngMocks.stubMember(
      ParentService.prototype,
      'request',
      () => {
        calls.push('parent getter');
        return () => {
          calls.push('parent accessor result');
          return 'parent accessor';
        };
      },
      'get',
    );
    ngMocks.stubMember(
      ParentService.prototype,
      'request',
      () => {
        calls.push('parent setter');
      },
      'set',
    );
    const parentDescriptor = Object.getOwnPropertyDescriptor(
      ParentService.prototype,
      'request',
    );
    const childDescriptor = Object.getOwnPropertyDescriptor(
      TargetService.prototype,
      'request',
    );

    TestBed.configureTestingModule({
      providers: [MockProvider(TargetService)],
    });
    const mock = ngMocks.get(TargetService);
    const descriptor = Object.getOwnPropertyDescriptor(
      mock,
      'request',
    );
    expect(mock).toBe(ngMocks.get(TargetService));
    expect(Object.getPrototypeOf(mock)).toBe(TargetService.prototype);
    expect(calls).toEqual([]);
    expect(descriptor).toBeDefined();
    expect(descriptor!.get).toBeUndefined();
    expect(descriptor!.set).toBeUndefined();
    expect(descriptor!.value).toBe(mock.request);
    expect(typeof mock.request).toBe('function');
    expect(mock.request()).toBeUndefined();
    expect(mock).toBe(ngMocks.get(TargetService));
    expect(calls).toEqual([]);
    expect(
      Object.getOwnPropertyDescriptor(
        ParentService.prototype,
        'request',
      ),
    ).toEqual(parentDescriptor);
    expect(
      Object.getOwnPropertyDescriptor(
        TargetService.prototype,
        'request',
      ),
    ).toEqual(childDescriptor);
  });
});
