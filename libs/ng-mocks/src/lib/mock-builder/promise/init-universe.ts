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

type DependencyDefs = Array<any> | Set<any>;

const addDependencies = (
  dependencies: Set<any>,
  defs: DependencyDefs,
  onDependency?: (dependency: any) => void,
): void => {
  for (const def of defs) {
    if (!def) {
      continue;
    }

    const extractedDependencies = funcExtractDeps(def, new Set(), true);
    for (const dependency of mapValues(extractedDependencies)) {
      dependencies.add(dependency);
      onDependency?.(dependency);
    }
  }
};

const shouldKeepReplacementDependency = (dependency: any): boolean => {
  const ngType = getNgType(dependency);

  return ngType === undefined || ngType === 'Injectable';
};

const addDefinitionsAndDependencies = (dependencies: Set<any>, defs: DependencyDefs): void => {
  for (const dependency of mapValues(defs)) {
    dependencies.add(dependency);
  }

  addDependencies(dependencies, defs);
};

const addReplacementDependencies = (
  dependencies: Set<any>,
  resolutions: Map<any, string>,
  defs: DependencyDefs,
): void => {
  addDependencies(dependencies, defs, dependency => {
    if (shouldKeepReplacementDependency(dependency) && !resolutions.has(dependency)) {
      resolutions.set(dependency, 'keep');
    }
  });
};

const applyResolution = (
  dependency: any,
  configDef: Map<any, any>,
  defValue: Map<any, any>,
  excludeDef: Set<any>,
  keepDef: Set<any>,
  mockDef: Set<any>,
  replaceDef: Set<any>,
  dependencies: Set<any>,
  resolutions: Map<any, string>,
): void => {
  const resolution = ngMocksUniverse.getResolution(dependency);
  if (resolution === 'replace') {
    const replacement = ngMocksUniverse.getBuildDeclaration(dependency);
    replaceDef.add(dependency);
    defValue.set(dependency, replacement);
    addReplacementDependencies(dependencies, resolutions, [dependency, replacement]);
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

  for (const dependency of mapValues(dependencies)) {
    ngMocksUniverse.touches.add(dependency);
  }

  // Keep/mock definitions should contribute themselves and their nested declarations.
  for (const defs of [keepDef, mockDef]) {
    addDefinitionsAndDependencies(dependencies, defs);
  }

  // Replacements are special: their provider-like dependencies must stay real.
  for (const dependency of mapValues(replaceDef)) {
    dependencies.add(dependency);
    addReplacementDependencies(dependencies, resolutions, [dependency, defValue.get(dependency)]);
  }

  // Global replace rules are discovered lazily, therefore we need a second pass over the graph.
  for (const dependency of mapValues(dependencies)) {
    if (ngMocksUniverse.getResolution(dependency) === 'replace') {
      addReplacementDependencies(dependencies, resolutions, [
        dependency,
        ngMocksUniverse.getBuildDeclaration(dependency),
      ]);
    }
  }

  for (const dependency of mapValues(dependencies)) {
    if (configDef.has(dependency)) {
      continue;
    }

    applyResolution(
      dependency,
      configDef,
      defValue,
      excludeDef,
      keepDef,
      mockDef,
      replaceDef,
      dependencies,
      resolutions,
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
