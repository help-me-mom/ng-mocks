import { Directive, Injectable, InjectionToken } from '@angular/core';

import ngMocksUniverse from '../../common/ng-mocks-universe';
import { MockDirective } from '../../mock-directive/mock-directive';

import createNgMocksToken from './create-ng-mocks-token';

@Injectable()
@Directive({
  selector: '[createNgMocksTokenDirective]',
  standalone: false,
})
class TargetDirective {}

@Injectable()
class TargetService {}

const TOKEN = new InjectionToken<number>('createNgMocksToken');
const STRING_TOKEN = 'createNgMocksTokenString';

// NG_MOCKS is internal, so public DI assertions cannot inspect recipe identity in its merged map.
// Public regressions under tests/issue-15340 also exercise these mappings with real Angular fixtures.
describe('create-ng-mocks-token', () => {
  afterEach(() => {
    for (const key of [
      TargetDirective,
      TargetService,
      TOKEN,
      STRING_TOKEN,
    ]) {
      ngMocksUniverse.builtProviders.delete(key);
      ngMocksUniverse.builtDeclarations.delete(key);
      ngMocksUniverse.cacheDeclarations.delete(key);
      ngMocksUniverse.cacheProviders.delete(key);
    }
  });

  it('prefers the current declaration over its provider and stale caches', () => {
    const staleMock = MockDirective(TargetDirective);
    ngMocksUniverse.cacheDeclarations.delete(TargetDirective);
    const currentMock = MockDirective(TargetDirective);
    const provider = { provide: TargetDirective, useValue: {} };
    ngMocksUniverse.builtProviders.set(TargetDirective, provider);
    ngMocksUniverse.builtDeclarations.set(
      TargetDirective,
      currentMock,
    );
    ngMocksUniverse.cacheDeclarations.set(TargetDirective, staleMock);
    ngMocksUniverse.cacheProviders.set(TargetDirective, provider);

    const actual: Map<unknown, unknown> =
      createNgMocksToken().useValue;

    expect(currentMock).not.toBe(staleMock);
    expect(actual.get(TargetDirective)).toBe(currentMock);
    expect(ngMocksUniverse.builtProviders.get(TargetDirective)).toBe(
      provider,
    );
    expect(
      ngMocksUniverse.cacheDeclarations.get(TargetDirective),
    ).toBe(staleMock);
  });

  it('retains exact provider-only recipes over declaration placeholders and caches', () => {
    const serviceProvider = {
      provide: TargetService,
      useFactory: (dependency: number) => ({ dependency }),
      deps: [TOKEN],
    };
    const tokenProvider = { provide: TOKEN, useValue: 0 };
    const stringProvider = { provide: STRING_TOKEN, useValue: '' };
    ngMocksUniverse.builtProviders.set(
      TargetService,
      serviceProvider,
    );
    ngMocksUniverse.builtProviders.set(TOKEN, tokenProvider);
    ngMocksUniverse.builtProviders.set(STRING_TOKEN, stringProvider);
    ngMocksUniverse.builtDeclarations.set(TargetService, undefined);
    ngMocksUniverse.builtDeclarations.set(TOKEN, undefined);
    ngMocksUniverse.builtDeclarations.set(STRING_TOKEN, undefined);
    ngMocksUniverse.cacheProviders.set(TargetService, {
      provide: TargetService,
      useValue: false,
    });
    ngMocksUniverse.cacheProviders.set(TOKEN, {
      provide: TOKEN,
      useValue: 1,
    });
    ngMocksUniverse.cacheProviders.set(STRING_TOKEN, {
      provide: STRING_TOKEN,
      useValue: 'cached',
    });

    const actual: Map<unknown, unknown> =
      createNgMocksToken().useValue;

    expect(actual.get(TargetService)).toBe(serviceProvider);
    expect(actual.get(TOKEN)).toBe(tokenProvider);
    expect(actual.get(STRING_TOKEN)).toBe(stringProvider);
  });

  it('retains current null exclusions ahead of stale declaration and provider caches', () => {
    const staleMock = MockDirective(TargetDirective);
    ngMocksUniverse.builtProviders.set(TargetDirective, null);
    ngMocksUniverse.builtDeclarations.set(TargetDirective, null);
    ngMocksUniverse.cacheDeclarations.set(TargetDirective, staleMock);
    ngMocksUniverse.builtProviders.set(TargetService, null);
    ngMocksUniverse.builtDeclarations.set(TargetService, null);
    ngMocksUniverse.cacheProviders.set(TargetService, {
      provide: TargetService,
      useValue: {},
    });

    const actual: Map<unknown, unknown> =
      createNgMocksToken().useValue;

    expect(actual.has(TargetDirective)).toBe(true);
    expect(actual.get(TargetDirective)).toBeNull();
    expect(actual.has(TargetService)).toBe(true);
    expect(actual.get(TargetService)).toBeNull();
  });
});
