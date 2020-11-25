import { mapEntries } from '../../common/core.helpers';
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

  ngMocksUniverse.config.set('multi', new Set()); // collecting multi flags of providers.
  ngMocksUniverse.config.set('deps', new Set()); // collecting all deps of providers.
  ngMocksUniverse.config.set('depsSkip', new Set()); // collecting all declarations of kept modules.
  ngMocksUniverse.config.set('resolution', new Map()); // flags to understand how to mock nested declarations.
  for (const [k, v] of mapEntries(configDef)) {
    ngMocksUniverse.config.set(k, v);
  }
  initKeepDef(keepDef);
  initReplaceDef(replaceDef, defValue);
  initExcludeDef(excludeDef);
  initMockDeclarations(mockDef, defValue);

  return initModules(keepDef, mockDef, replaceDef, defProviders);
};
