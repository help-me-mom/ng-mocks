import { InjectionToken } from '@angular/core';

import {
  NG_MOCKS_GUARDS,
  NG_MOCKS_RESOLVERS,
} from '../common/core.tokens';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockBuilderStash } from '../mock-builder/mock-builder-stash';

import helperReplaceWithMocks from './helper.replace-with-mocks';

describe('helper.replace-with-mocks', () => {
  const stash = new MockBuilderStash();

  beforeEach(() => stash.backup());
  afterEach(() => stash.restore());

  it('uses one processed object for every shared reference', () => {
    class Original {}
    class Replacement {}
    class Excluded {}

    ngMocksUniverse.cacheDeclarations.set(Original, Replacement);
    ngMocksUniverse.builtDeclarations.set(Excluded, null);
    const shared = Object.freeze({
      declaration: Original,
      excluded: Excluded,
    });
    const value = Object.freeze({ first: shared, second: shared });

    const actual: typeof value = helperReplaceWithMocks(value);

    expect(actual).not.toBe(value);
    expect(actual.first).not.toBe(shared);
    expect(actual.first).toBe(actual.second);
    expect(actual.first.declaration).toBe(Replacement);
    expect(actual.second.declaration).toBe(Replacement);
    expect('excluded' in actual.first).toBe(false);
    expect('excluded' in actual.second).toBe(false);
    expect(value.first).toBe(shared);
    expect(value.second).toBe(shared);
    expect(shared.declaration).toBe(Original);
    expect(shared.excluded).toBe(Excluded);
  });

  it('uses one processed array for every shared reference', () => {
    class Original {}
    class Replacement {}
    class Excluded {}

    ngMocksUniverse.cacheDeclarations.set(Original, Replacement);
    ngMocksUniverse.builtDeclarations.set(Excluded, null);
    const shared = Object.freeze([Original, Excluded]);
    const value = Object.freeze([shared, shared]);

    const actual: typeof value = helperReplaceWithMocks(value);

    expect(actual).not.toBe(value);
    expect(actual[0]).not.toBe(shared);
    expect(actual[0]).toBe(actual[1]);
    expect(actual[0]).toEqual([Replacement]);
    expect(actual[1]).toEqual([Replacement]);
    expect(value[0]).toBe(shared);
    expect(value[1]).toBe(shared);
    expect(shared).toEqual([Original, Excluded]);
  });

  it('honors an explicit replacement before a cached declaration mock', () => {
    class Original {}
    class Replacement {}
    class CachedMock {}

    const resolutions = new Map([[Original, 'replace']]);
    ngMocksUniverse.config.set('ngMocksDepsResolution', resolutions);
    ngMocksUniverse.builtDeclarations.set(Original, Replacement);
    ngMocksUniverse.cacheDeclarations.set(Original, CachedMock);
    const shared = Object.freeze({ declaration: Original });
    const value = Object.freeze({ first: shared, second: shared });

    const actual: typeof value = helperReplaceWithMocks(value);

    expect(actual.first.declaration).toBe(Replacement);
    expect(actual.second.declaration).toBe(Replacement);
    expect(actual.first).toBe(actual.second);
    expect(shared.declaration).toBe(Original);
    expect(value.first).toBe(shared);
    expect(value.second).toBe(shared);
    expect(resolutions.get(Original)).toBe('replace');
    expect(ngMocksUniverse.builtDeclarations.get(Original)).toBe(
      Replacement,
    );
    expect(ngMocksUniverse.cacheDeclarations.get(Original)).toBe(
      CachedMock,
    );
  });

  it('keeps changed self and mutual references inside the processed graph', () => {
    class Original {}
    class Replacement {}
    class Excluded {}

    interface Item {
      children: Item[];
      declaration: typeof Original;
      excluded?: typeof Excluded;
      self?: Item;
    }

    ngMocksUniverse.cacheDeclarations.set(Original, Replacement);
    ngMocksUniverse.builtDeclarations.set(Excluded, null);
    const value: Item = {
      children: [],
      declaration: Original,
      excluded: Excluded,
    };
    const child: Item = {
      children: [value],
      declaration: Original,
      excluded: Excluded,
    };
    value.self = value;
    value.children.push(child, value);

    const actual: Item = helperReplaceWithMocks(value);

    expect(actual).not.toBe(value);
    expect(actual.self).toBe(actual);
    expect(actual.children).not.toBe(value.children);
    expect(actual.children[0]).not.toBe(child);
    expect(actual.children[0].children[0]).toBe(actual);
    expect(actual.children[1]).toBe(actual);
    expect(actual.declaration).toBe(Replacement);
    expect(actual.children[0].declaration).toBe(Replacement);
    expect('excluded' in actual).toBe(false);
    expect('excluded' in actual.children[0]).toBe(false);
    expect(value.self).toBe(value);
    expect(value.children[0]).toBe(child);
    expect(value.children[1]).toBe(value);
    expect(child.children[0]).toBe(value);
    expect(value.declaration).toBe(Original);
    expect(child.declaration).toBe(Original);
    expect(value.excluded).toBe(Excluded);
    expect(child.excluded).toBe(Excluded);
  });

  it('preserves wholly unchanged shared and cyclic graph identities', () => {
    class Original {}

    interface Graph {
      first: { declaration: typeof Original; values: string[] };
      second: { declaration: typeof Original; values: string[] };
      self?: Graph;
    }

    const values = ['unchanged'];
    const shared = { declaration: Original, values };
    const value: Graph = { first: shared, second: shared };

    expect(helperReplaceWithMocks(value)).toBe(value);
    value.self = value;
    const actual: Graph = helperReplaceWithMocks(value);

    expect(actual).toBe(value);
    expect(actual.self).toBe(value);
    expect(actual.first).toBe(shared);
    expect(actual.second).toBe(shared);
    expect(actual.first.values).toBe(values);
    expect(actual.first.declaration).toBe(Original);
  });

  it('keeps shared route references on the final guard and resolver filtering result', () => {
    class KeptGuard {}
    class RemovedGuard {}
    class KeptResolver {}
    class RemovedResolver {}

    interface Route {
      canActivate: Array<typeof KeptGuard>;
      children?: Route[];
      resolve: {
        kept: typeof KeptResolver;
        removed?: typeof RemovedResolver;
      };
    }

    ngMocksUniverse.builtDeclarations.set(NG_MOCKS_GUARDS, null);
    ngMocksUniverse.builtDeclarations.set(NG_MOCKS_RESOLVERS, null);
    ngMocksUniverse.builtDeclarations.set(KeptGuard, KeptGuard);
    ngMocksUniverse.builtDeclarations.set(KeptResolver, KeptResolver);
    const route: Route = {
      canActivate: [KeptGuard, RemovedGuard],
      resolve: { kept: KeptResolver, removed: RemovedResolver },
    };
    route.children = [route];
    const value = [route, route];

    const actual: Route[] = helperReplaceWithMocks(value);

    expect(actual).not.toBe(value);
    expect(actual[0]).not.toBe(route);
    expect(actual[0]).toBe(actual[1]);
    expect(actual[0].children?.[0]).toBe(actual[0]);
    expect(actual[0].canActivate).toEqual([KeptGuard]);
    expect(actual[1].canActivate).toEqual([KeptGuard]);
    expect(actual[0].resolve).toEqual({ kept: KeptResolver });
    expect(actual[1].resolve).toEqual({ kept: KeptResolver });
    expect(route.children[0]).toBe(route);
    expect(route.canActivate).toEqual([KeptGuard, RemovedGuard]);
    expect(route.resolve).toEqual({
      kept: KeptResolver,
      removed: RemovedResolver,
    });
    expect(value[0]).toBe(route);
    expect(value[1]).toBe(route);
  });

  it('preserves kept guard and resolver token identities in a shared route', () => {
    const keptGuard = new InjectionToken<boolean>('kept-guard-14927');
    const removedGuard = new InjectionToken<boolean>(
      'removed-guard-14927',
    );
    const keptResolver = new InjectionToken<string>(
      'kept-resolver-14927',
    );
    const removedResolver = new InjectionToken<string>(
      'removed-resolver-14927',
    );

    ngMocksUniverse.builtDeclarations.set(NG_MOCKS_GUARDS, null);
    ngMocksUniverse.builtDeclarations.set(NG_MOCKS_RESOLVERS, null);
    ngMocksUniverse.builtDeclarations.set(keptGuard, keptGuard);
    ngMocksUniverse.builtDeclarations.set(keptResolver, keptResolver);
    const guards = Object.freeze([keptGuard, removedGuard]);
    const resolvers = Object.freeze({
      kept: keptResolver,
      removed: removedResolver,
    });
    const route = Object.freeze({
      canActivate: guards,
      resolve: resolvers,
    });
    const value = Object.freeze([route, route]);

    const actual: typeof value = helperReplaceWithMocks(value);

    expect(actual).not.toBe(value);
    expect(actual[0]).not.toBe(route);
    expect(actual[0]).toBe(actual[1]);
    expect(actual[0].canActivate.length).toBe(1);
    expect(actual[0].canActivate[0]).toBe(keptGuard);
    expect(actual[1].canActivate[0]).toBe(keptGuard);
    expect(actual[0].resolve.kept).toBe(keptResolver);
    expect(actual[1].resolve.kept).toBe(keptResolver);
    expect('removed' in actual[0].resolve).toBe(false);
    expect(ngMocksUniverse.touches.has(keptGuard)).toBe(true);
    expect(ngMocksUniverse.touches.has(keptResolver)).toBe(true);
    expect(value[0]).toBe(route);
    expect(value[1]).toBe(route);
    expect(route.canActivate).toBe(guards);
    expect(route.resolve).toBe(resolvers);
    expect(guards[0]).toBe(keptGuard);
    expect(guards[1]).toBe(removedGuard);
    expect(resolvers.kept).toBe(keptResolver);
    expect(resolvers.removed).toBe(removedResolver);
  });

  it('preserves a cached declaration replacement as a terminal object', () => {
    class Original {}
    class NestedOriginal {}
    class NestedReplacement {}
    class Excluded {}

    const replacement = {
      declaration: NestedOriginal,
      excluded: Excluded,
    };
    ngMocksUniverse.cacheDeclarations.set(Original, replacement);
    ngMocksUniverse.cacheDeclarations.set(
      NestedOriginal,
      NestedReplacement,
    );
    ngMocksUniverse.builtDeclarations.set(Excluded, null);
    const value = { first: Original, second: Original };

    const actual: {
      first: typeof replacement;
      second: typeof replacement;
    } = helperReplaceWithMocks(value);

    expect(actual.first).toBe(replacement);
    expect(actual.second).toBe(replacement);
    expect(actual.first.declaration).toBe(NestedOriginal);
    expect(actual.first.excluded).toBe(Excluded);
    expect(replacement).toEqual({
      declaration: NestedOriginal,
      excluded: Excluded,
    });
    expect(value.first).toBe(Original);
    expect(value.second).toBe(Original);
  });

  it('filters route sections without filtering their aliases in ordinary configuration data', () => {
    class KeptGuard {}
    class OtherGuard {}
    class KeptResolver {}
    class OtherResolver {}

    ngMocksUniverse.builtDeclarations.set(NG_MOCKS_GUARDS, null);
    ngMocksUniverse.builtDeclarations.set(NG_MOCKS_RESOLVERS, null);
    ngMocksUniverse.builtDeclarations.set(KeptGuard, KeptGuard);
    ngMocksUniverse.builtDeclarations.set(KeptResolver, KeptResolver);
    const guards = [KeptGuard, OtherGuard];
    const resolvers: {
      kept: typeof KeptResolver;
      other?: typeof OtherResolver;
    } = {
      kept: KeptResolver,
      other: OtherResolver,
    };
    const route = { canActivate: guards, resolve: resolvers };

    for (const value of [
      { route, guardData: guards, resolverData: resolvers },
      { guardData: guards, resolverData: resolvers, route },
    ]) {
      const actual: typeof value = helperReplaceWithMocks(value);

      expect(actual.route).not.toBe(route);
      expect(actual.route.canActivate).not.toBe(guards);
      expect(actual.route.canActivate).toEqual([KeptGuard]);
      expect(actual.route.resolve).not.toBe(resolvers);
      expect(actual.route.resolve).toEqual({ kept: KeptResolver });
      expect(actual.guardData).toBe(guards);
      expect(actual.resolverData).toBe(resolvers);
      expect(actual.guardData).toEqual([KeptGuard, OtherGuard]);
      expect(actual.resolverData).toEqual({
        kept: KeptResolver,
        other: OtherResolver,
      });
      expect(route.canActivate).toBe(guards);
      expect(route.resolve).toBe(resolvers);
    }
  });
});
