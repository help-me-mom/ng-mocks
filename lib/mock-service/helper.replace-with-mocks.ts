import { NG_GUARDS } from '../common/core.tokens';
import { ngMocksUniverse } from '../common/ng-mocks-universe';

const replaceWithMocks = (value: any): any => {
  if (ngMocksUniverse.cacheMocks.has(value)) {
    return ngMocksUniverse.cacheMocks.get(value);
  }
  if (typeof value !== 'object') {
    return value;
  }

  let mocked: any;
  let updated = false;

  if (Array.isArray(value)) {
    mocked = [];
    for (const valueItem of value) {
      if (ngMocksUniverse.builder.has(valueItem) && ngMocksUniverse.builder.get(valueItem) === null) {
        updated = updated || true;
        continue;
      }
      mocked.push(replaceWithMocks(valueItem));
      updated = updated || mocked[mocked.length - 1] !== valueItem;
    }
  } else if (value) {
    mocked = {};
    for (const key of Object.keys(value)) {
      if (ngMocksUniverse.builder.has(value[key]) && ngMocksUniverse.builder.get(value[key]) === null) {
        updated = updated || true;
        continue;
      }
      mocked[key] = replaceWithMocks(value[key]);
      updated = updated || mocked[key] !== value[key];
    }

    // Removal of guards.
    for (const section of ['canActivate', 'canActivateChild', 'canDeactivate', 'canLoad']) {
      if (!Array.isArray(mocked[section])) {
        continue;
      }

      const guards: any[] = [];
      for (const guard of mocked[section]) {
        if (ngMocksUniverse.builder.has(guard) && ngMocksUniverse.builder.get(guard) !== null) {
          guards.push(guard);
          continue;
        }
        if (ngMocksUniverse.builder.has(NG_GUARDS) && ngMocksUniverse.builder.get(NG_GUARDS) === null) {
          continue;
        }
        guards.push(guard);
      }
      if (mocked[section].length !== guards.length) {
        updated = updated || true;
        mocked = {
          ...mocked,
          [section]: guards,
        };
      }
    }
  }

  if (updated) {
    Object.setPrototypeOf(mocked, Object.getPrototypeOf(value));
    return mocked;
  }
  return value;
};

export default replaceWithMocks;
