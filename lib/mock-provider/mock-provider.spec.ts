import { Injectable, InjectionToken, Injector } from '@angular/core';

import { MockProvider, MockProviders } from './mock-provider';

const TARGET_TOKEN = new InjectionToken('TARGET_TOKEN');

@Injectable()
class TargetService {
  public name = 'target';
}

describe('mock-provider', () => {
  it('returns undefined for tokens', () => {
    const actual = MockProvider(TARGET_TOKEN);
    expect(actual).toEqual({
      provide: TARGET_TOKEN,
      useValue: undefined,
    });
  });

  it('returns factories for services', () => {
    const actual: any = MockProvider(TargetService);
    expect(actual).toEqual({
      deps: [Injector],
      provide: TargetService,
      useFactory: jasmine.anything(),
    });

    const instance = actual.useFactory();

    expect(instance).toEqual(jasmine.any(TargetService));
    expect(instance.name).toBeUndefined();
  });

  it('returns an array of mock providers', () => {
    const actual = MockProviders(TARGET_TOKEN, TargetService);
    expect(actual.length).toEqual(2);
    expect(actual[0]).toEqual({
      provide: TARGET_TOKEN,
      useValue: undefined,
    });
    expect(actual[1]).toEqual({
      deps: [Injector],
      provide: TargetService,
      useFactory: jasmine.anything(),
    });
  });
});
