import { InjectionToken } from '@angular/core';

import getRootProviderKeepProvider from './get-root-provider-keep-provider';

const createInjectable = (metadata?: any) => {
  const target = () => undefined;

  if (metadata !== undefined) {
    (target as any).decorators = [
      {
        args: [metadata],
        type: {
          prototype: {
            ngMetadataName: 'Injectable',
          },
        },
      },
    ];
  }

  return target;
};

describe('get-root-provider-keep-provider', () => {
  it('returns undefined for non functions', () => {
    expect(getRootProviderKeepProvider({})).toBeUndefined();
  });

  it('returns undefined for injectables without factory metadata', () => {
    expect(
      getRootProviderKeepProvider(createInjectable({})),
    ).toBeUndefined();
  });

  it('keeps factory providers without deps', () => {
    const useFactory = () => 'value';
    const target = createInjectable({
      useFactory,
    });

    expect(getRootProviderKeepProvider(target)).toEqual({
      provide: target,
      useFactory,
    });
  });

  it('keeps factory providers with deps', () => {
    const dependency = new InjectionToken('dependency');
    const useFactory = () => 'value';
    const target = createInjectable({
      deps: [dependency],
      useFactory,
    });

    expect(getRootProviderKeepProvider(target)).toEqual({
      deps: [dependency],
      provide: target,
      useFactory,
    });
  });
});
