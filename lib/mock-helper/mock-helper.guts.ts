import { core } from '@angular/compiler';
import { TestModuleMetadata } from '@angular/core/testing';

import { flatten, mapValues } from '../common/core.helpers';
import { ngModuleResolver } from '../common/core.reflect';
import { isNgDef } from '../common/func.is-ng-def';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import { isNgModuleDefWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockModule } from '../mock-module/mock-module';
import { MockPipe } from '../mock-pipe/mock-pipe';
import mockProvider from '../mock-service/mock-provider';

type Data = {
  declarations: any[];
  exclude: Set<any>;
  imports: any[];
  keep: Set<any>;
  mock: Set<any>;
  providers: any[];
  skip: Set<any>;
};

const skipDef = (def: any, skip: Set<any>, exclude: Set<any>): boolean => {
  if (skip.has(def)) {
    return true;
  }
  skip.add(def);

  return exclude.has(def);
};

const createMeta = ({ keep, skip, exclude, imports, declarations, providers }: Data): TestModuleMetadata => {
  for (const def of keep) {
    if (skip.has(def) || exclude.has(def)) {
      continue;
    }
    if (isNgDef(def, 'm')) {
      imports.push(def);
    } else if (isNgDef(def, 'c') || isNgDef(def, 'd')) {
      declarations.push(def);
    } else if (isNgDef(def, 'p')) {
      declarations.push(def);
      providers.push(def);
    } else if (!isNgInjectionToken(def)) {
      providers.push(def);
    }
  }

  return { declarations, imports, providers };
};

const getType = (def: any): string => {
  if (isNgModuleDefWithProviders(def)) {
    return 'module-with-providers';
  }
  if (isNgDef(def, 'm')) {
    return 'module';
  }
  if (isNgDef(def, 'c')) {
    return 'component';
  }
  if (isNgDef(def, 'd')) {
    return 'directive';
  }
  if (isNgDef(def, 'p')) {
    return 'pipe';
  }

  return '';
};

const handleModuleWithProviders = (data: Data, def: any): void => {
  if (data.skip.has(def.ngModule)) {
    return;
  }
  data.skip.add(def.ngModule);
  if (data.exclude.has(def.ngModule)) {
    return;
  }

  data.imports.push(data.keep.has(def.ngModule) ? def : MockModule(def));
};

const handleModule = (data: Data, def: any, callback: any): void => {
  if (skipDef(def, data.skip, data.exclude)) {
    return;
  }

  data.imports.push(data.keep.has(def) ? def : callback(def));
};

const handleDeclaration = (data: Data, def: any, callback: any): void => {
  if (skipDef(def, data.skip, data.exclude)) {
    return;
  }

  data.declarations.push(data.keep.has(def) ? def : callback(def));
};

const handleDestructuring = (data: Data, def: any, callback: any): void => {
  if (skipDef(def, data.skip, data.exclude)) {
    return;
  }

  let meta: core.NgModule;
  try {
    meta = ngModuleResolver.resolve(def);
  } catch (e) {
    // istanbul ignore next
    throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
  }

  for (const toMock of flatten([meta.declarations, meta.imports])) {
    callback(data, toMock);
  }
  for (const toMock of meta.providers ? flatten(meta.providers) : []) {
    resolveProvider(data, toMock);
  }
};

const resolveProvider = ({ skip, keep, providers, exclude }: Data, def: any): void => {
  const provider = typeof def === 'object' && def.provide ? def.provide : def;
  skip.add(provider);
  if (exclude.has(provider)) {
    return;
  }

  const providerDef = keep.has(provider) ? def : mockProvider(def);
  if (providerDef) {
    providers.push(providerDef);
  }
};

const resolve = (data: Data, def: any, skipDestruction = true): void => {
  if (!def) {
    return;
  }

  const type = getType(def);

  if (type === 'module-with-providers') {
    handleModuleWithProviders(data, def);
  } else if (type === 'module' && data.keep.has(def)) {
    handleModule(data, def, MockModule); // MockModule won't be called because the def is kept.
  } else if (type === 'module' && skipDestruction && !data.keep.has(def)) {
    handleModule(data, def, MockModule);
  } else if (type === 'module' && !data.keep.has(def)) {
    handleDestructuring(data, def, resolve);
  } else if (type === 'component') {
    handleDeclaration(data, def, MockComponent);
  } else if (type === 'directive') {
    handleDeclaration(data, def, MockDirective);
  } else if (type === 'pipe') {
    handleDeclaration(data, def, MockPipe);
  } else {
    resolveProvider(data, def);
  }
};

export default (keep: any, mock: any = null, exclude: any = null): TestModuleMetadata => {
  const data: Data = {
    declarations: [],
    exclude: new Set(flatten(exclude || [])),
    imports: [],
    keep: new Set(flatten(keep || [])),
    mock: new Set(flatten(mock || [])),
    providers: [],
    skip: new Set(),
  };

  for (const def of mapValues(data.mock)) {
    resolve(data, def, false);
  }

  return createMeta(data);
};
