import { Injectable, InjectionToken } from '@angular/core';

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
      deps: jasmine.any(Array),
      provide: TARGET_TOKEN,
      useFactory: jasmine.anything(),
    });
    expect(actual.useFactory(undefined, undefined)).toBeUndefined();
  });

  it('returns factories for services', () => {
    const actual: any = MockProvider(TargetService);
    expect(actual).toEqual({
      deps: jasmine.any(Array),
      provide: TargetService,
      useFactory: jasmine.anything(),
    });

    const instance = actual.useFactory(undefined, undefined);

    expect(instance).toEqual(jasmine.any(TargetService));
    expect(instance.name).toBeUndefined();
  });

  it('returns an array of mock providers', () => {
    const actual = MockProviders(TARGET_TOKEN, TargetService);
    expect(actual.length).toEqual(2);
    expect(actual[0]).toEqual({
      deps: jasmine.any(Array),
      provide: TARGET_TOKEN,
      useFactory: jasmine.anything(),
    });
    expect(
      actual[0].useFactory(undefined, undefined),
    ).toBeUndefined();

    expect(actual[1]).toEqual({
      deps: jasmine.any(Array),
      provide: TargetService,
      useFactory: jasmine.anything(),
    });
    expect(actual[1].useFactory(undefined, undefined)).toEqual(
      jasmine.any(TargetService),
    );
  });
});
