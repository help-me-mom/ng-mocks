import { NG_MOCKS_GUARDS } from '../common/core.tokens';
import ngMocksUniverse from '../common/ng-mocks-universe';

const handleSection = (section: any[]) => {
  const guards: any[] = [];

  for (const guard of section) {
    if (ngMocksUniverse.isProvidedDef(guard)) {
      guards.push(guard);
      continue;
    }
    if (ngMocksUniverse.isExcludedDef(NG_MOCKS_GUARDS)) {
      continue;
    }
    guards.push(guard);
  }

  return guards;
};

const handleArray = (cache: Map<any, any>, value: any[], callback: any): [boolean, any[]] => {
  const mock: Array<any> = [];
  let updated = false;
  cache.set(value, mock);

  for (const valueItem of value) {
    if (ngMocksUniverse.isExcludedDef(valueItem)) {
      updated = updated || true;
      continue;
    }
    mock.push(callback(valueItem, cache));
    updated = updated || mock[mock.length - 1] !== valueItem;
  }

  return [updated, mock];
};

const handleItemKeys = ['canActivate', 'canActivateChild', 'canDeactivate', 'canLoad'];
const handleItemGetGuards = (mock: any, section: string) =>
  Array.isArray(mock[section]) ? handleSection(mock[section]) : mock[section];

const handleItem = (
  cache: Map<any, any>,
  value: Record<keyof any, any>,
  callback: any,
): [boolean, Record<keyof any, any>] => {
  let mock: Record<keyof any, any> = {};
  let updated = false;
  cache.set(value, mock);

  for (const key of Object.keys(value)) {
    if (ngMocksUniverse.isExcludedDef(value[key])) {
      updated = updated || true;
      continue;
    }
    mock[key] = callback(value[key], cache);
    updated = updated || mock[key] !== value[key];
  }

  // Removal of guards.
  for (const section of handleItemKeys) {
    const guards: any[] = handleItemGetGuards(mock, section);
    if (guards && mock[section].length !== guards.length) {
      updated = updated || true;
      mock = { ...mock, [section]: guards };
    }
  }

  return [updated, mock];
};

const replaceWithMocks = (value: any, cache: Map<any, any>): any => {
  if (ngMocksUniverse.cacheDeclarations.has(value)) {
    return ngMocksUniverse.cacheDeclarations.get(value);
  }
  if (typeof value !== 'object') {
    return value;
  }
  if (cache.has(value)) {
    return value;
  }

  let mock: any;
  let updated = false;

  if (Array.isArray(value)) {
    [updated, mock] = handleArray(cache, value, replaceWithMocks);
  } else if (value) {
    [updated, mock] = handleItem(cache, value, replaceWithMocks);
  }

  if (updated) {
    Object.setPrototypeOf(mock, Object.getPrototypeOf(value));

    return mock;
  }

  return value;
};

const replaceWithMocksWrapper = (value: any) => {
  const cache = new Map();
  const result = replaceWithMocks(value, cache);
  cache.clear();

  return result;
};

export default (() => replaceWithMocksWrapper)();
