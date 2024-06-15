import { flatten, mapValues } from '../../common/core.helpers';
import coreReflectProvidedIn from '../../common/core.reflect.provided-in';
import { AnyDeclaration, Type } from '../../common/core.types';
import errorJestMock from '../../common/error.jest-mock';
import funcGetName from '../../common/func.get-name';
import funcGetType from '../../common/func.get-type';
import { isNgDef } from '../../common/func.is-ng-def';
import { isNgInjectionToken } from '../../common/func.is-ng-injection-token';
import { isStandalone } from '../../common/func.is-standalone';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import markExported from '../../mock/mark-exported';
import markProviders from '../../mock-module/mark-providers';

import initModule from './init-module';
import { BuilderData, NgMeta } from './types';

const skipDef = (def: any): boolean =>
  ngMocksUniverse.touches.has(def) || isNgDef(def) || isNgInjectionToken(def) || typeof def === 'string';

const handleDef = ({ imports, declarations, providers }: NgMeta, def: any, defProviders: Map<any, any>): void => {
  if (!skipDef(def)) {
    errorJestMock(def);
  }

  let touched = false;

  if (isNgDef(def, 'm')) {
    const extendedDef = initModule(def, defProviders);
    imports.push(extendedDef);
    touched = true;

    // adding providers to touches
    if (typeof extendedDef === 'object' && extendedDef.providers) {
      for (const provider of flatten(extendedDef.providers)) {
        ngMocksUniverse.touches.add(funcGetType(provider));
      }
    }
  }

  if (isNgDef(def, 'c') || isNgDef(def, 'd') || isNgDef(def, 'p')) {
    (isStandalone(def) ? imports : declarations).push(ngMocksUniverse.getBuildDeclaration(def));
    touched = true;
  }

  if (isNgDef(def, 'i') || !isNgDef(def)) {
    const mock = ngMocksUniverse.builtProviders.get(def);
    if (mock && typeof mock !== 'string' && isNgDef(mock, 't') === false) {
      providers.push(mock);
      touched = true;
    }
  }

  if (touched) {
    markExported(def);
    ngMocksUniverse.touches.add(def);
  }
};

const isExportedOnRoot = (
  def: any,
  configInstance: Map<any, { exported?: Set<any> }>,
  configDef: Map<any, any>,
): undefined | Type<any> => {
  const cnfInstance = configInstance.get(def);
  const cnfDef = configDef.get(def) || /* istanbul ignore next */ {};

  if (isNgDef(def, 'm') && cnfDef.onRoot) {
    return def;
  }

  if (!cnfInstance?.exported) {
    return def;
  }

  for (const parent of mapValues(cnfInstance.exported)) {
    const returnModule = isExportedOnRoot(parent, configInstance, configDef);
    // istanbul ignore else
    if (returnModule) {
      return returnModule;
    }
  }

  return undefined;
};

const moveModulesUp = <T>(a: T, b: T) => {
  const isA = isNgDef(a, 'm');
  const isB = isNgDef(b, 'm');
  if (isA && isB) {
    return 0;
  }
  if (isA) {
    return -1;
  }
  if (isB) {
    return 1;
  }
  return 0;
};

export default ({ configDefault, keepDef, mockDef, replaceDef }: BuilderData, defProviders: Map<any, any>): NgMeta => {
  const meta: NgMeta = { imports: [], declarations: [], providers: [] };

  const processed: AnyDeclaration<any>[] = [];
  const forgotten: AnyDeclaration<any>[] = [];

  const defs = [...mapValues(mockDef), ...mapValues(keepDef), ...mapValues(replaceDef)];
  defs.sort(moveModulesUp);

  // Adding suitable leftovers.
  for (const originalDef of defs) {
    const def =
      isNgDef(originalDef, 'm') && defProviders.has(originalDef)
        ? originalDef
        : isExportedOnRoot(originalDef, ngMocksUniverse.configInstance, ngMocksUniverse.config);
    if (!def || processed.indexOf(def) !== -1) {
      continue;
    }
    const cnfDef = ngMocksUniverse.config.get(def) || /* istanbul ignore next */ { __set: true };
    processed.push(def);
    cnfDef.onRoot = cnfDef.onRoot || !cnfDef.dependency;
    // istanbul ignore if
    if (cnfDef.__set) {
      cnfDef.__set = undefined;
      ngMocksUniverse.config.set(def, cnfDef);
    }

    if (isNgDef(def, 'm') && cnfDef.onRoot) {
      handleDef(meta, def, defProviders);
    } else if (!cnfDef.dependency && cnfDef.export && (isNgDef(def, 'i') || !isNgDef(def))) {
      handleDef(meta, def, defProviders);
      markProviders([def]);
    } else if (!cnfDef.dependency && cnfDef.export) {
      handleDef(meta, def, defProviders);
    } else if (!ngMocksUniverse.touches.has(def) && !cnfDef.dependency) {
      handleDef(meta, def, defProviders);
    } else if (
      cnfDef.dependency &&
      configDefault.dependency &&
      coreReflectProvidedIn(def) !== 'root' &&
      (typeof def !== 'object' || !(def as any).__ngMocksSkip)
    ) {
      forgotten.push(def);
    }
  }

  // Checking missing dependencies
  const globalFlags = ngMocksUniverse.global.get('flags');
  for (const def of forgotten) {
    if (ngMocksUniverse.touches.has(def)) {
      continue;
    }

    const errorMessage = [
      `MockBuilder has found a missing dependency: ${funcGetName(def)}.`,
      'It means no module provides it.',
      'Please, use the "export" flag if you want to add it explicitly.',
      'https://ng-mocks.sudo.eu/api/MockBuilder#export-flag',
    ].join(' ');

    if (globalFlags.onMockBuilderMissingDependency === 'warn') {
      console.warn(errorMessage);
    } else if (globalFlags.onMockBuilderMissingDependency === 'throw') {
      throw new Error(errorMessage);
    }
  }

  return meta;
};
