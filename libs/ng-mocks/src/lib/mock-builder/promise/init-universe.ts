import { mapEntries, mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import initExcludeDef from './init-exclude-def';
import initKeepDef from './init-keep-def';
import initMockDeclarations from './init-mock-declarations';
import initModules from './init-modules';
import initReplaceDef from './init-replace-def';
import { BuilderData } from './types';

export default ({
  configDef,
  defProviders,
  defValue,
  excludeDef,
  keepDef,
  mockDef,
  replaceDef,
}: BuilderData): Map<any, any> => {
  ngMocksUniverse.flags.add('cachePipe');

  // collecting multi flags of providers.
  ngMocksUniverse.config.set('ngMocksMulti', new Set());
  // collecting all deps of providers.
  ngMocksUniverse.config.set('ngMocksDeps', new Set());
  // collecting all declarations of kept modules.
  ngMocksUniverse.config.set('ngMocksDepsSkip', new Set());
  // flags to understand how to mock nested declarations.
  ngMocksUniverse.config.set('ngMocksDepsResolution', new Map());

  const standaloneMocks = initKeepDef(keepDef, configDef);
  for (const def of mapValues(standaloneMocks)) {
    if (configDef.has(def)) {
      continue;
    }
    mockDef.add(def);
    configDef.set(def, {
      dependency: true,
    });
  }

  for (const [k, v] of mapEntries(configDef)) {
    ngMocksUniverse.config.set(k, {
      ...ngMocksUniverse.getConfigMock().get(k),
      ...v,
    });
  }

  initReplaceDef(replaceDef, defValue);
  initExcludeDef(excludeDef);
  initMockDeclarations(mockDef, defValue);

  return initModules(keepDef, mockDef, replaceDef, defProviders);
};
