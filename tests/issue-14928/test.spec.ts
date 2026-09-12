import { Injectable, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockProvider,
  MockService,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly info = {
    request: (value: string) => value,
    alias: (value: string) => value,
  };

  public constructor() {
    throw new Error('issue-14928 real constructor');
  }
}

let providerCalls = 0;
const providerOriginal = (value: string): string => {
  providerCalls += 1;

  return value;
};
const TOKEN = new InjectionToken<{
  first: typeof providerOriginal;
  second: typeof providerOriginal;
}>('issue-14928-provider');

@NgModule({
  providers: [
    {
      provide: TOKEN,
      useValue: { first: providerOriginal, second: providerOriginal },
    },
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14928
describe('issue-14928', () => {
  beforeEach(() =>
    ngMocks.autoSpy(
      typeof jest === 'undefined'
        ? 'jasmine'
        : typeof (window as Window & { vi?: object }).vi ===
            'undefined'
          ? 'jest'
          : 'vitest',
    ),
  );

  afterEach(() => ngMocks.autoSpy('reset'));

  it('creates a direct function mock without invoking it', () => {
    let originalCalls = 0;
    const original = (value: string, count: number): string => {
      originalCalls += 1;

      return value + count;
    };

    const mock = MockService<typeof original>(original);

    // Caching the result of calling the mock records an unwanted initial call.
    expect(mock).not.toHaveBeenCalled();
    expect(originalCalls).toBe(0);
    expect(mock('explicit', 1)).toBeUndefined();
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('explicit', 1);
    expect(originalCalls).toBe(0);
  });

  it('shares own function aliases while isolating distinct functions and separate mocks', () => {
    let originalCalls = 0;
    const shared = (value: string): string => {
      originalCalls += 1;

      return value;
    };
    const distinct = (value: string): string => {
      originalCalls += 1;

      return value;
    };
    const shape = { first: shared, second: shared, other: distinct };

    const mock = MockService<typeof shape>(shape);
    const independent = MockService<typeof shape>(shape);

    expect(mock.first).toBe(mock.second);
    expect(mock.first).not.toBe(mock.other);
    expect(independent.first).toBe(independent.second);
    expect(independent.first).not.toBe(mock.first);
    expect(independent.other).not.toBe(mock.other);
    expect(mock.first).not.toHaveBeenCalled();
    expect(mock.other).not.toHaveBeenCalled();
    expect(independent.first).not.toHaveBeenCalled();
    expect(independent.other).not.toHaveBeenCalled();
    expect(originalCalls).toBe(0);

    expect(mock.first('shared')).toBeUndefined();
    expect(mock.second).toHaveBeenCalledTimes(1);
    expect(mock.second).toHaveBeenCalledWith('shared');
    expect(mock.other).not.toHaveBeenCalled();
    expect(independent.first).not.toHaveBeenCalled();

    expect(mock.other('distinct')).toBeUndefined();
    expect(mock.other).toHaveBeenCalledTimes(1);
    expect(mock.other).toHaveBeenCalledWith('distinct');
    expect(independent.first('independent')).toBeUndefined();
    expect(independent.second).toHaveBeenCalledTimes(1);
    expect(independent.second).toHaveBeenCalledWith('independent');
    expect(independent.other).not.toHaveBeenCalled();
    expect(mock.first).toHaveBeenCalledTimes(1);
    expect(originalCalls).toBe(0);
    expect(shape.first).toBe(shared);
    expect(shape.second).toBe(shared);
    expect(shape.other).toBe(distinct);
  });

  it('preserves pristine shared spies in an explicit provider override', () => {
    let originalCalls = 0;
    const original = (value: string): string => {
      originalCalls += 1;

      return value;
    };
    const shape = { request: original, alias: original };
    const info = MockService<typeof shape>(shape);
    expect(info.request).not.toHaveBeenCalled();

    TestBed.configureTestingModule({
      providers: [MockProvider(TargetService, { info })],
    });
    const service = ngMocks.get(TargetService);

    expect(service.info).toBe(info);
    expect(service.info.request).toBe(service.info.alias);
    expect(service.info.request).not.toHaveBeenCalled();
    expect(originalCalls).toBe(0);
    expect(service.info.request('provided')).toBeUndefined();
    expect(service.info.alias).toHaveBeenCalledTimes(1);
    expect(service.info.alias).toHaveBeenCalledWith('provided');
    expect(originalCalls).toBe(0);
  });

  it('creates pristine shared spies when mocking a module useValue provider', async () => {
    providerCalls = 0;
    await MockBuilder(null, TargetModule);

    const value = ngMocks.get(TOKEN);

    expect(value.first).toBe(value.second);
    expect(value.first).not.toHaveBeenCalled();
    expect(providerCalls).toBe(0);
    expect(value.second('module')).toBeUndefined();
    expect(value.first).toHaveBeenCalledTimes(1);
    expect(value.first).toHaveBeenCalledWith('module');
    expect(providerCalls).toBe(0);
  });
});
