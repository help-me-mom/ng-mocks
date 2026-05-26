import { InjectionToken } from '@angular/core';

import getRootProviderKeepProvider from './get-root-provider-keep-provider';

describe('get-root-provider-keep-provider', () => {
  it('keeps factory provider dependencies', () => {
    const dependency = new InjectionToken('dependency');
    const useFactory = () => 'value';
    const target = () => undefined;

    (target as any).decorators = [
      {
        args: [
          {
            deps: [dependency],
            useFactory,
          },
        ],
        type: {
          prototype: {
            ngMetadataName: 'Injectable',
          },
        },
      },
    ];

    expect(getRootProviderKeepProvider(target)).toEqual({
      deps: [dependency],
      provide: target,
      useFactory,
    });
  });

  it('keeps service factory providers', () => {
    const factory = () => 'value';
    const target = () => undefined;

    (target as any).decorators = [
      {
        args: [
          {
            factory,
          },
        ],
        type: {
          prototype: {
            ngMetadataName: 'Service',
          },
        },
      },
    ];

    expect(getRootProviderKeepProvider(target)).toEqual({
      provide: target,
      useFactory: factory,
    });
  });
});
