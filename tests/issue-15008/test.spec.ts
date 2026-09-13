import {
  Component,
  Injectable,
  InjectionToken,
  Injector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockComponent,
  MockInstance,
  MockProvider,
  ngMocks,
} from 'ng-mocks';

const originalCalls: string[] = [];
const TOKEN = new InjectionToken<string>('issue-15008');

@Injectable()
class TargetService {
  public name = 'original';

  public constructor() {
    originalCalls.push('service constructor');
  }

  public request(): string {
    originalCalls.push('service request');
    return 'original';
  }
}

@Component({
  selector: 'target-15008',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TargetComponent {
  public name = 'original';

  public constructor() {
    originalCalls.push('component constructor');
  }

  public request(): string {
    originalCalls.push('component request');
    return 'original';
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15008
describe('issue-15008', () => {
  MockInstance.scope();
  beforeEach(() => {
    originalCalls.length = 0;
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TargetService),
        MockProvider(TOKEN, 'base'),
      ],
    });
  });

  for (const config of [undefined, {}, { init: undefined }]) {
    it(`accepts ${JSON.stringify(config)} for a service provider`, () => {
      MockInstance(TargetService, config);

      const instance = ngMocks.get(TargetService);
      expect(ngMocks.get(TargetService)).toBe(instance);
      expect(instance.request()).toBeUndefined();
      expect(originalCalls).toEqual([]);
    });

    it(`accepts ${JSON.stringify(config)} for a generated component`, () => {
      const mock = MockComponent(TargetComponent);
      TestBed.configureTestingModule({ declarations: [mock] });
      MockInstance(TargetComponent, config);

      const fixture = TestBed.createComponent(mock);
      fixture.detectChanges();
      expect(ngMocks.get(fixture.debugElement, TargetComponent)).toBe(
        fixture.componentInstance,
      );
      expect(fixture.componentInstance.request()).toBeUndefined();
      expect(originalCalls).toEqual([]);
    });

    it(`accepts ${JSON.stringify(config)} for a token provider`, () => {
      MockInstance(TOKEN, config);

      expect(ngMocks.get(TOKEN)).toBe('base');
      expect(ngMocks.get(TOKEN)).toBe('base');
      expect(originalCalls).toEqual([]);
    });
  }

  it('keeps service callbacks ordered and applies returned shapes around empty forms', () => {
    const calls: string[] = [];
    const instances: TargetService[] = [];
    const injectors: Array<Injector | undefined> = [];
    const request = () => 'custom';
    MockInstance(TargetService, (instance, injector) => {
      calls.push('first');
      instances.push(instance);
      injectors.push(injector);
      instance.name = 'first';
    });
    MockInstance(TargetService, undefined);
    MockInstance(TargetService, {});
    MockInstance(TargetService, { init: undefined });
    MockInstance(TargetService, {
      init: (instance, injector) => {
        calls.push(instance.name);
        instances.push(instance);
        injectors.push(injector);
        return { name: 'second', request };
      },
    });
    expect(calls).toEqual([]);

    const instance = ngMocks.get(TargetService);
    expect(ngMocks.get(TargetService)).toBe(instance);
    expect(instances).toEqual([instance, instance]);
    expect(injectors[0]).toBe(injectors[1]);
    expect(injectors[0]!.get(TOKEN)).toBe('base');
    expect(calls).toEqual(['first', 'first']);
    expect(instance.name).toBe('second');
    expect(instance.request).toBe(request);
    expect(instance.request()).toBe('custom');
    expect(originalCalls).toEqual([]);
  });

  it('keeps component callbacks and returned member identity around empty forms', () => {
    const mock = MockComponent(TargetComponent);
    TestBed.configureTestingModule({ declarations: [mock] });
    const calls: string[] = [];
    const request = () => 'custom';
    MockInstance(TargetComponent, instance => {
      calls.push('first');
      instance.name = 'first';
    });
    MockInstance(TargetComponent, undefined);
    MockInstance(TargetComponent, {});
    MockInstance(TargetComponent, { init: undefined });
    MockInstance(TargetComponent, instance => {
      calls.push(instance.name);
      return { name: 'second', request };
    });
    expect(calls).toEqual([]);

    const fixture = TestBed.createComponent(mock);
    fixture.detectChanges();
    expect(calls).toEqual(['first', 'first']);
    expect(fixture.componentInstance.name).toBe('second');
    expect(fixture.componentInstance.request).toBe(request);
    expect(fixture.componentInstance.request()).toBe('custom');
    expect(originalCalls).toEqual([]);
  });

  it('retains the token callback return value around empty forms', () => {
    const values: Array<string | undefined> = [];
    MockInstance(TOKEN, value => {
      values.push(value);
      return 'first';
    });
    MockInstance(TOKEN, undefined);
    MockInstance(TOKEN, {});
    MockInstance(TOKEN, { init: undefined });
    MockInstance(TOKEN, value => {
      values.push(value);
      return '';
    });

    expect(ngMocks.get(TOKEN)).toBe('');
    expect(ngMocks.get(TOKEN)).toBe('');
    expect(values).toEqual(['base', 'first']);
  });

  it('preserves outer customization when an empty inner scope is restored', () => {
    MockInstance(TargetService, 'name', 'outer');
    MockInstance.remember();
    try {
      MockInstance(TargetService, undefined);
      MockInstance(TargetService, {});
      MockInstance(TargetService, { init: undefined });
    } finally {
      MockInstance.restore();
    }
    MockInstance.remember();
    try {
      MockInstance(TargetService, 'name', 'inner');
      expect(ngMocks.get(TargetService).name).toBe('inner');
    } finally {
      MockInstance.restore();
    }

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [MockProvider(TargetService)],
    });
    const instance = ngMocks.get(TargetService);
    expect(instance.name).toBe('outer');
    expect(originalCalls).toEqual([]);
  });

  it('keeps the explicit no-argument reset for services and tokens', () => {
    MockInstance(TargetService, 'name', 'custom');
    MockInstance(TOKEN, () => 'custom');
    MockInstance(TargetService);
    MockInstance(TOKEN);

    expect(ngMocks.get(TargetService).name).toBeUndefined();
    expect(ngMocks.get(TOKEN)).toBe('base');
    expect(originalCalls).toEqual([]);
  });

  it('propagates an actual initializer error unchanged', () => {
    const error = new Error('initializer failed');
    MockInstance(TargetService, () => {
      throw error;
    });
    let received: Error | undefined;
    try {
      ngMocks.get(TargetService);
    } catch (error_) {
      received = error_ as Error;
    }

    expect(received).toBe(error);
    expect(originalCalls).toEqual([]);
  });
});
