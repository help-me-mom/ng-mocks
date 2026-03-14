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

// Collect nested dependencies for the passed declarations / modules.
// The optional callback lets replacement logic mark discovered tokens for a
// specific resolution while the graph is traversed only once.
const addDependencies = (
  dependencies: Set<any>,
  defs: DependencyDefs,
  onDependency?: (dependency: any) => void,
): void => {
  for (const def of defs) {
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

// Replacement modules are special: their provider-like tokens should stay real.
// Otherwise ng-mocks can replace the module itself but still mock providers from
// the replacement, which breaks cases like HttpClientTestingModule.
const keepReplacementDependency = (resolutions: Map<any, string>, replacementDependency: any): void => {
  if (shouldKeepReplacementDependency(replacementDependency) && !resolutions.has(replacementDependency)) {
    resolutions.set(replacementDependency, 'keep');
  }
};

const addDefinitionsAndDependencies = (dependencies: Set<any>, defs: DependencyDefs): void => {
  for (const dependency of mapValues(defs)) {
    dependencies.add(dependency);
  }

  addDependencies(dependencies, defs);
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
    // Store the replacement and scan both sides of the pair immediately so the
    // final resolution pass sees the replacement-provided dependencies too.
    const replacement = ngMocksUniverse.getBuildDeclaration(dependency);
    replaceDef.add(dependency);
    defValue.set(dependency, replacement);
    addDependencies(dependencies, [dependency, replacement], replacementDependency =>
      keepReplacementDependency(resolutions, replacementDependency),
    );
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

  // Seed the graph from explicit keep/mock inputs and everything they pull in.
  for (const defs of [keepDef, mockDef]) {
    addDefinitionsAndDependencies(dependencies, defs);
  }

  // Replacement dependencies need a dedicated pass because the replacement side
  // contributes the real providers / tokens we actually want to keep.
  for (const dependency of mapValues(replaceDef)) {
    dependencies.add(dependency);
    addDependencies(dependencies, [dependency, defValue.get(dependency)], replacementDependency =>
      keepReplacementDependency(resolutions, replacementDependency),
    );
  }

  // Global replace rules are discovered while traversing dependencies, so we need
  // one more pass to pull replacement dependencies for entries that were not part
  // of the initial explicit replace set.
  for (const dependency of mapValues(dependencies)) {
    if (ngMocksUniverse.getResolution(dependency) === 'replace') {
      addDependencies(
        dependencies,
        [dependency, ngMocksUniverse.getBuildDeclaration(dependency)],
        replacementDependency => keepReplacementDependency(resolutions, replacementDependency),
      );
    }
  }

  // Once the dependency graph is complete, assign the final keep/mock/exclude/replace
  // behavior for each discovered dependency and persist it into ngMocksUniverse config.
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
