import { forwardRef, InjectionToken } from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';

import getRootProviderKeepProvider from './get-root-provider-keep-provider';

describe('get-root-provider-keep-provider', () => {
  it('keeps factory provider dependencies', () => {
    const dependency = new InjectionToken('dependency');
    const useFactory = () => 'value';
    const target = () => undefined;

    coreDefineProperty(target, 'decorators', [
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
    ]);

    expect(getRootProviderKeepProvider(target)).toEqual({
      deps: [dependency],
      provide: target,
      useFactory,
    });
  });

  it('keeps service factory providers', () => {
    const factory = () => 'value';
    const target = () => undefined;

    coreDefineProperty(target, 'decorators', [
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
    ]);

    expect(getRootProviderKeepProvider(target)).toEqual({
      provide: target,
      useFactory: factory,
    });
  });

  it('keeps aliases without resolving forward references', () => {
    const dependency = new InjectionToken('dependency');
    let resolutions = 0;
    const reference = forwardRef(() => {
      resolutions += 1;

      return dependency;
    });

    for (const useExisting of [dependency, reference]) {
      const target = () => undefined;
      const metadata = Object.freeze({
        providedIn: 'root',
        useExisting,
      });
      coreDefineProperty(target, 'decorators', [
        {
          args: [metadata],
          type: { prototype: { ngMetadataName: 'Injectable' } },
        },
      ]);

      const provider = getRootProviderKeepProvider(target);

      expect(provider).toEqual({ provide: target, useExisting });
      expect(provider?.useExisting).toBe(useExisting);
      expect(metadata).toEqual({ providedIn: 'root', useExisting });
      expect(resolutions).toEqual(0);
    }
  });

  it('keeps class providers and their original dependencies', () => {
    class Implementation {}
    const dependency = new InjectionToken('dependency');
    const deps = Object.freeze([dependency]);
    const metadata = Object.freeze({
      deps,
      providedIn: 'root',
      useClass: Implementation,
    });
    const target = () => undefined;
    coreDefineProperty(target, 'decorators', [
      {
        args: [metadata],
        type: { prototype: { ngMetadataName: 'Injectable' } },
      },
    ]);

    const provider = getRootProviderKeepProvider(target);

    expect(provider).toEqual({
      deps,
      provide: target,
      useClass: Implementation,
    });
    expect(
      provider && 'deps' in provider ? provider.deps : undefined,
    ).toBe(deps);
    expect(
      provider && 'useClass' in provider
        ? provider.useClass
        : undefined,
    ).toBe(Implementation);
    expect(metadata).toEqual({
      deps: [dependency],
      providedIn: 'root',
      useClass: Implementation,
    });
    expect(deps[0]).toBe(dependency);
  });

  it('leaves class provider dependencies implicit when none are configured', () => {
    class Implementation {}
    const metadata = Object.freeze({
      providedIn: 'root',
      useClass: Implementation,
    });
    const target = () => undefined;
    coreDefineProperty(target, 'decorators', [
      {
        args: [metadata],
        type: { prototype: { ngMetadataName: 'Injectable' } },
      },
    ]);

    const provider = getRootProviderKeepProvider(target);

    expect(provider).toEqual({
      provide: target,
      useClass: Implementation,
    });
    expect(
      provider && 'useClass' in provider
        ? provider.useClass
        : undefined,
    ).toBe(Implementation);
    expect(
      Object.getOwnPropertyDescriptor(provider ?? {}, 'deps'),
    ).toBeUndefined();
    expect(metadata).toEqual({
      providedIn: 'root',
      useClass: Implementation,
    });
  });

  it('keeps the original value provider instance', () => {
    const useValue = Object.freeze({ value: 'original' });
    const metadata = Object.freeze({ providedIn: 'root', useValue });
    const target = () => undefined;
    coreDefineProperty(target, 'decorators', [
      {
        args: [metadata],
        type: { prototype: { ngMetadataName: 'Injectable' } },
      },
    ]);

    const provider = getRootProviderKeepProvider(target);

    expect(provider).toEqual({ provide: target, useValue });
    expect(provider?.useValue).toBe(useValue);
    expect(metadata).toEqual({ providedIn: 'root', useValue });
    expect(useValue).toEqual({ value: 'original' });
  });

  it('keeps explicitly configured empty values', () => {
    for (const useValue of [undefined, null, false, 0, '']) {
      const target = () => undefined;
      const metadata = Object.freeze({
        providedIn: 'root',
        useValue,
      });
      coreDefineProperty(target, 'decorators', [
        {
          args: [metadata],
          type: { prototype: { ngMetadataName: 'Injectable' } },
        },
      ]);

      const provider = getRootProviderKeepProvider(target);
      const descriptor = Object.getOwnPropertyDescriptor(
        provider ?? {},
        'useValue',
      );

      expect(provider).toEqual({ provide: target, useValue });
      expect(descriptor).toBeDefined();
      expect(descriptor?.value).toBe(useValue);
      expect(metadata).toEqual({ providedIn: 'root', useValue });
    }
  });
});
