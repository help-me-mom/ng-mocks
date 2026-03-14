import { mapEntries, mapValues } from '../../common/core.helpers';
import { funcExtractDeps } from '../../common/func.extract-deps';
import { getNgType } from '../../common/func.get-ng-type';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import initExcludeDef from './init-exclude-def';
import initKeepDef from './init-keep-def';
import initMockDeclarations from './init-mock-declarations';
import initModules from './init-modules';
import initReplaceDef from './init-replace-def';
import { BuilderData } from './types';

const shouldKeepReplacementDependency = (dependency: any): boolean => {
  const ngType = getNgType(dependency);

  return ngType === undefined || ngType === 'Injectable';
};

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

  const dependencies = initKeepDef(keepDef, configDef);
  const resolutions: Map<any, string> = ngMocksUniverse.config.get('ngMocksDepsResolution');
  const collectDependencies = (defs: Iterable<any>, callback?: (dependency: any) => void): void => {
    for (const def of defs) {
      if (!def) {
        continue;
      }

      const extractedDependencies = funcExtractDeps(def, new Set(), true);
      for (const dependency of mapValues(extractedDependencies)) {
        dependencies.add(dependency);
        callback?.(dependency);
      }
    }
  };
  const collectReplacementDependencies = (...defs: Array<any>): void => {
    collectDependencies(defs, dependency => {
      if (shouldKeepReplacementDependency(dependency) && !resolutions.has(dependency)) {
        resolutions.set(dependency, 'keep');
      }
    });
  };
  for (const dependency of mapValues(dependencies)) {
    ngMocksUniverse.touches.add(dependency);
  }
  for (const defs of [keepDef, mockDef]) {
    for (const dependency of mapValues(defs)) {
      dependencies.add(dependency);
    }
    collectDependencies(defs);
  }
  for (const dependency of mapValues(replaceDef)) {
    dependencies.add(dependency);
    collectReplacementDependencies(dependency, defValue.get(dependency));
  }
  for (const dependency of mapValues(dependencies)) {
    if (ngMocksUniverse.getResolution(dependency) === 'replace') {
      collectReplacementDependencies(dependency, ngMocksUniverse.getBuildDeclaration(dependency));
    }
  }
  for (const dependency of mapValues(dependencies)) {
    if (configDef.has(dependency)) {
      continue;
    }

    // Checking global configuration for the dependency.
    const resolution = ngMocksUniverse.getResolution(dependency);
    if (resolution === 'replace') {
      replaceDef.add(dependency);
      defValue.set(dependency, ngMocksUniverse.getBuildDeclaration(dependency));
      collectReplacementDependencies(dependency, defValue.get(dependency));
    } else if (resolution === 'keep') {
      keepDef.add(dependency);
    } else if (resolution === 'exclude') {
      excludeDef.add(dependency);
    } else if (resolution === 'mock') {
      mockDef.add(dependency);
    } else if (ngMocksUniverse.touches.has(dependency)) {
      mockDef.add(dependency);
    }

    configDef.set(
      dependency,
      ngMocksUniverse.touches.has(dependency)
        ? {
            dependency: true,
            __internal: true,
          }
        : {},
    );
  }

  for (const [k, v] of mapEntries(configDef)) {
    ngMocksUniverse.config.set(k, {
      ...ngMocksUniverse.getConfigMock().get(k),
      ...v,
      defValue: defValue.get(k),
    });
  }

  initReplaceDef(replaceDef, defValue);
  initExcludeDef(excludeDef);
  initMockDeclarations(mockDef, defValue);

  return initModules(keepDef, mockDef, replaceDef, defProviders);
};
