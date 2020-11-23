import { NG_MOCKS_GUARDS } from '../common/core.tokens';
import ngMocksUniverse from '../common/ng-mocks-universe';

const handleSection = (section: any[]) => {
  const guards: any[] = [];

  for (const guard of section) {
    if (ngMocksUniverse.builtDeclarations.has(guard) && ngMocksUniverse.builtDeclarations.get(guard) !== null) {
      guards.push(guard);
      continue;
    }
    if (
      ngMocksUniverse.builtDeclarations.has(NG_MOCKS_GUARDS) &&
      ngMocksUniverse.builtDeclarations.get(NG_MOCKS_GUARDS) === null
    ) {
      continue;
    }
    guards.push(guard);
  }

  return guards;
};

const handleArray = (value: any[], callback: any): [boolean, any[]] => {
  const mock = [];
  let updated = false;

  for (const valueItem of value) {
    if (ngMocksUniverse.builtDeclarations.has(valueItem) && ngMocksUniverse.builtDeclarations.get(valueItem) === null) {
      updated = updated || true;
      continue;
    }
    mock.push(callback(valueItem));
    updated = updated || mock[mock.length - 1] !== valueItem;
  }

  return [updated, mock];
};

const handleItem = (value: Record<keyof any, any>, callback: any): [boolean, Record<keyof any, any>] => {
  let mock: Record<keyof any, any> = {};
  let updated = false;

  for (const key of Object.keys(value)) {
    if (
      ngMocksUniverse.builtDeclarations.has(value[key]) &&
      ngMocksUniverse.builtDeclarations.get(value[key]) === null
    ) {
      updated = updated || true;
      continue;
    }
    mock[key] = callback(value[key]);
    updated = updated || mock[key] !== value[key];
  }

  // Removal of guards.
  for (const section of ['canActivate', 'canActivateChild', 'canDeactivate', 'canLoad']) {
    const guards: any[] = Array.isArray(mock[section]) ? handleSection(mock[section]) : mock[section];
    if (guards && mock[section].length !== guards.length) {
      updated = updated || true;
      mock = { ...mock, [section]: guards };
    }
  }

  return [updated, mock];
};

const replaceWithMocks = (value: any): any => {
  if (ngMocksUniverse.cacheDeclarations.has(value)) {
    return ngMocksUniverse.cacheDeclarations.get(value);
  }
  if (typeof value !== 'object') {
    return value;
  }

  let mock: any;
  let updated = false;

  if (Array.isArray(value)) {
    [updated, mock] = handleArray(value, replaceWithMocks);
  } else if (value) {
    [updated, mock] = handleItem(value, replaceWithMocks);
  }

  if (updated) {
    Object.setPrototypeOf(mock, Object.getPrototypeOf(value));

    return mock;
  }

  return value;
};

export default (() => replaceWithMocks)();
