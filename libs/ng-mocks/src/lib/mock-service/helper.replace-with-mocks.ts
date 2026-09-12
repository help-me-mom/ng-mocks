import { NG_MOCKS_GUARDS, NG_MOCKS_RESOLVERS } from '../common/core.tokens';
import { isNgDef } from '../common/func.is-ng-def';
import ngMocksUniverse from '../common/ng-mocks-universe';

interface CacheEntry {
  containers: object[];
  mock: object;
  parents: Set<CacheEntry>;
  updated: boolean;
}

const handleSection = (section: any[]) => {
  const guards: any[] = [];

  for (const guard of section) {
    if (!ngMocksUniverse.isProvidedDef(guard) && ngMocksUniverse.isExcludedDef(NG_MOCKS_GUARDS)) {
      continue;
    }

    guards.push(guard);
    if (!isNgDef(guard)) {
      ngMocksUniverse.touches.add(guard);
    }
  }

  return guards;
};

const handleArray = (cache: Map<unknown, CacheEntry>, value: any[], callback: any): any[] => {
  const mock: Array<any> = [];
  const entry: CacheEntry = { containers: [mock], mock, parents: new Set(), updated: false };
  let updated = false;
  cache.set(value, entry);

  for (const valueItem of value) {
    if (ngMocksUniverse.isExcludedDef(valueItem)) {
      updated = updated || true;
      continue;
    }
    mock.push(callback(valueItem, cache));
    const child = cache.get(valueItem);
    if (child) {
      child.parents.add(entry);
    } else {
      updated = updated || mock[mock.length - 1] !== valueItem;
    }
  }

  entry.updated = updated;
  return mock;
};

const handleItemKeys = ['canActivate', 'canActivateChild', 'canDeactivate', 'canMatch', 'canLoad'];
const handleItemGetGuards = (mock: any, section: string) =>
  Array.isArray(mock[section]) ? handleSection(mock[section]) : mock[section];

const handleItem = (
  cache: Map<unknown, CacheEntry>,
  value: Record<keyof any, any>,
  callback: any,
): Record<keyof any, any> => {
  const mock: Record<keyof any, any> = {};
  const entry: CacheEntry = { containers: [mock], mock, parents: new Set(), updated: false };
  let updated = false;
  cache.set(value, entry);

  for (const key of Object.keys(value)) {
    if (ngMocksUniverse.isExcludedDef(value[key])) {
      updated = updated || true;
      continue;
    }
    mock[key] = callback(value[key], cache);
    const child = cache.get(value[key]);
    if (child) {
      child.parents.add(entry);
    } else {
      updated = updated || mock[key] !== value[key];
    }
  }

  // Removal of guards.
  for (const section of handleItemKeys) {
    const guards: any[] = handleItemGetGuards(mock, section);
    if (guards && mock[section].length !== guards.length) {
      updated = updated || true;
      mock[section] = guards;
      entry.containers.push(guards);
    }
  }

  // Removal of resolvers.
  if (typeof mock.resolve === 'object' && mock.resolve) {
    const resolve: any = {};
    let resolveUpdated = false;
    for (const key of Object.keys(mock.resolve)) {
      const resolver = mock.resolve[key];
      if (!ngMocksUniverse.isProvidedDef(resolver) && ngMocksUniverse.isExcludedDef(NG_MOCKS_RESOLVERS)) {
        resolveUpdated = resolveUpdated || true;
        continue;
      }
      resolve[key] = resolver;
      if (!isNgDef(resolver)) {
        ngMocksUniverse.touches.add(resolver);
      }
    }
    if (resolveUpdated) {
      updated = updated || true;
      mock.resolve = resolve;
      entry.containers.push(resolve);
    }
  }

  entry.updated = updated;
  return mock;
};

const replaceWithMocks = (value: any, cache: Map<unknown, CacheEntry>): any => {
  if (ngMocksUniverse.getResolution(value) === 'replace') {
    return ngMocksUniverse.getBuildDeclaration(value);
  }
  if (ngMocksUniverse.cacheDeclarations.has(value)) {
    return ngMocksUniverse.cacheDeclarations.get(value);
  }
  if (typeof value !== 'object' || !value || isNgDef(value, 't')) {
    return value;
  }
  const cached = cache.get(value);
  if (cached) {
    return cached.mock;
  }

  if (Array.isArray(value)) {
    return handleArray(cache, value, replaceWithMocks);
  }

  return handleItem(cache, value, replaceWithMocks);
};

const replaceWithMocksWrapper = (value: any) => {
  const cache = new Map<unknown, CacheEntry>();
  const result = replaceWithMocks(value, cache);
  const updated: CacheEntry[] = [];
  for (const entry of cache.values()) {
    if (entry.updated) {
      updated.push(entry);
    }
  }

  // A provisional clone is not a change: unchanged cycles must retain their original identities.
  for (let index = 0; index < updated.length; index += 1) {
    for (const parent of updated[index].parents) {
      if (!parent.updated) {
        parent.updated = true;
        updated.push(parent);
      }
    }
  }

  const replacements = new Map<unknown, unknown>();
  for (const [original, entry] of cache) {
    replacements.set(entry.mock, entry.updated ? entry.mock : original);
    if (entry.updated) {
      Object.setPrototypeOf(entry.mock, Object.getPrototypeOf(original));
    }
  }
  for (const entry of updated) {
    for (const container of entry.containers) {
      const properties = container as Record<string, unknown>;
      for (const key of Object.keys(properties)) {
        if (replacements.has(properties[key])) {
          properties[key] = replacements.get(properties[key]);
        }
      }
    }
  }
  cache.clear();

  return replacements.has(result) ? replacements.get(result) : result;
};

export default (() => replaceWithMocksWrapper)();
