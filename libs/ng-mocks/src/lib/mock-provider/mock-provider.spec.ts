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
      deps: [Injector],
      provide: TARGET_TOKEN,
      useFactory: jasmine.anything(),
    });
    expect(actual.useFactory()).toBeUndefined();
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
      deps: [Injector],
      provide: TARGET_TOKEN,
      useFactory: jasmine.anything(),
    });
    expect(actual[0].useFactory()).toBeUndefined();

    expect(actual[1]).toEqual({
      deps: [Injector],
      provide: TargetService,
      useFactory: jasmine.anything(),
    });
    expect(actual[1].useFactory()).toEqual(
      jasmine.any(TargetService),
    );
  });
});
