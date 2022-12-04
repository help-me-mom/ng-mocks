import { TestModuleMetadata } from '@angular/core/testing';

import CoreDefStack from '../common/core.def-stack';
import { flatten, mapKeys, mapValues } from '../common/core.helpers';
import coreReflectModuleResolve from '../common/core.reflect.module-resolve';
import funcGetType from '../common/func.get-type';
import { isNgDef } from '../common/func.is-ng-def';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import { isNgModuleDefWithProviders } from '../common/func.is-ng-module-def-with-providers';
import ngMocksUniverse from '../common/ng-mocks-universe';
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
  optional: Map<any, any>;
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

const createMetaHandler = (
  optional: Map<any, any>,
  proto: any,
  imports: any[],
  declarations: any[],
  providers: any[],
): void => {
  const def = optional.get(proto) || proto;

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
};

const createMeta = ({ keep, skip, optional, exclude, imports, declarations, providers }: Data): TestModuleMetadata => {
  for (const proto of keep) {
    if (skip.has(proto) || exclude.has(proto) || optional.has(proto)) {
      continue;
    }
    createMetaHandler(optional, proto, imports, declarations, providers);
  }

  return { declarations, imports, providers };
};

const typeMap: Array<[any, string]> = [
  ['m', 'module'],
  ['c', 'component'],
  ['d', 'directive'],
  ['p', 'pipe'],
];

const getType = (def: any, keep: Set<any>): string => {
  if (isNgModuleDefWithProviders(def)) {
    return 'module-with-providers';
  }
  for (const [flag, value] of typeMap) {
    if (isNgDef(def, flag)) {
      return flag === 'm' && keep.has(def) ? `${value}-keep` : value;
    }
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

const handleDeclaration = (data: Data, def: any, callback: any, bucket: any[]): void => {
  if (skipDef(def, data.skip, data.exclude)) {
    return;
  }

  bucket.push(data.keep.has(def) ? def : callback(def));
};

const handleDestructuring = (data: Data, def: any, callback: any): void => {
  if (skipDef(def, data.skip, data.exclude)) {
    return;
  }

  const meta = coreReflectModuleResolve(def);
  for (const toMock of flatten([meta.declarations, meta.imports])) {
    callback(data, toMock);
  }
  for (const toMock of meta.providers ? flatten(meta.providers) : []) {
    resolveProvider(data, toMock);
  }
};

const resolveProvider = ({ skip, keep, providers, exclude }: Data, def: any): void => {
  const provider = funcGetType(def);
  skip.add(provider);
  if (exclude.has(provider)) {
    return;
  }

  const providerDef = keep.has(provider) ? def : mockProvider(def);
  if (providerDef) {
    providers.push(providerDef);
  }
};

const resolveMap: Record<string, any> = {
  component: MockComponent,
  directive: MockDirective,
  pipe: MockPipe,
};

const resolveHandler = (data: Data, type: string, def: any, skipDestruction: boolean): void => {
  if (type === 'module-with-providers') {
    handleModuleWithProviders(data, def);
  } else if (type === 'module-keep') {
    handleDeclaration(data, def, MockModule, data.imports); // MockModule will not be called because the def is kept.
  } else if (type === 'module' && skipDestruction) {
    handleDeclaration(data, def, MockModule, data.imports);
  } else if (type === 'module') {
    handleDestructuring(data, def, resolve);
  } else if (resolveMap[type]) {
    handleDeclaration(data, def, resolveMap[type], data.declarations);
  } else {
    resolveProvider(data, def);
  }
};

const resolve = (data: Data, proto: any, skipDestruction = true): void => {
  if (!proto) {
    return;
  }

  const type = getType(proto, data.keep);
  let def: any;

  // an attempt to replace declarations.
  if (type !== 'module-with-providers') {
    const value = data.optional.get(proto);
    if (value && value !== proto) {
      def = value;
      data.keep.add(def);
    }
  }
  if (!def) {
    def = proto;
  }

  resolveHandler(data, type, def, skipDestruction);
};

const generateDataWithUniverse = (keep: Set<any>, mock: Set<any>, exclude: Set<any>, optional: Map<any, any>): void => {
  for (const k of mapKeys(ngMocksUniverse.getDefaults())) {
    const v = ngMocksUniverse.getBuildDeclaration(k);
    if (keep.has(k) || mock.has(k) || exclude.has(k)) {
      continue;
    }
    optional.set(k, v);

    if (v === null) {
      exclude.add(k);
    } else if (v === undefined) {
      mock.add(k);
    } else if (k === v) {
      keep.add(k);
    }
  }
};

const generateData = (protoKeep: any, protoMock: any, protoExclude: any): Data => {
  const keep = new Set(flatten(protoKeep || []));
  const mock = new Set(flatten(protoMock || []));
  const exclude = new Set(flatten(protoExclude || []));
  const optional = new Map();
  generateDataWithUniverse(keep, mock, exclude, optional);

  return {
    declarations: [],
    exclude,
    imports: [],
    keep,
    mock,
    optional,
    providers: [],
    skip: new Set(),
  };
};

export default (keep: any, mock: any = null, exclude: any = null): TestModuleMetadata => {
  const data: Data = generateData(keep, mock, exclude);

  const resolutions = new Map();
  ngMocksUniverse.config.set('ngMocksDepsResolution', resolutions);
  for (const mockDef of mapValues(data.keep)) {
    resolutions.set(mockDef, 'keep');
  }
  for (const mockDef of mapValues(data.exclude)) {
    resolutions.set(mockDef, 'exclude');
  }

  ngMocksUniverse.config.set('mockNgDefResolver', new CoreDefStack());
  for (const def of mapValues(data.mock)) {
    resolutions.set(def, 'mock');
    if (data.optional.has(def)) {
      continue;
    }
    resolve(data, def, false);
  }
  const meta = createMeta(data);
  ngMocksUniverse.config.delete('mockNgDefResolver');
  ngMocksUniverse.config.delete('ngMocksDepsResolution');

  return meta;
};
