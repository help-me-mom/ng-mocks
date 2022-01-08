import { Provider } from '@angular/core';
import * as imports from '@angular/platform-browser/animations';

import { isNgDef } from '../common/func.is-ng-def';
import { isNgModuleDefWithProviders } from '../common/func.is-ng-module-def-with-providers';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockPipe } from '../mock-pipe/mock-pipe';
import helperMockService from '../mock-service/helper.mock-service';

import { MockModule } from './mock-module';

// tslint:disable-next-line variable-name
let BrowserAnimationsModule: any;
// tslint:disable-next-line variable-name
let NoopAnimationsModule: any;
// istanbul ignore next
let replaceWithNoop: (def: any) => boolean = () => false;

BrowserAnimationsModule = imports.BrowserAnimationsModule;
NoopAnimationsModule = imports.NoopAnimationsModule;
replaceWithNoop = (def: any) =>
  def === BrowserAnimationsModule &&
  !!BrowserAnimationsModule &&
  !!NoopAnimationsModule &&
  !ngMocksUniverse.getResolution(def);

const processDefMap: Array<[any, any]> = [
  ['c', MockComponent],
  ['d', MockDirective],
  ['p', MockPipe],
];

const processDef = (def: any) => {
  // BrowserAnimationsModule is a very special case.
  // If it is not resolved manually, we simply replace it with NoopAnimationsModule.
  if (replaceWithNoop(def)) {
    return NoopAnimationsModule;
  }

  if (isNgDef(def, 'm') || isNgModuleDefWithProviders(def)) {
    return MockModule(def as any);
  }
  if (ngMocksUniverse.hasBuildDeclaration(def)) {
    return ngMocksUniverse.getBuildDeclaration(def);
  }
  if (ngMocksUniverse.flags.has('skipMock') && ngMocksUniverse.getResolution(def) !== 'mock') {
    return def;
  }
  for (const [flag, func] of processDefMap) {
    if (isNgDef(def, flag)) {
      return func(def);
    }
  }
};

// resolveProvider is a special case because of the def structure.
const createResolveProvider =
  (resolutions: Map<any, any>, change: () => void): ((def: Provider) => any) =>
  (def: Provider) =>
    helperMockService.resolveProvider(def, resolutions, change);

const createResolveWithProviders = (def: any, mockDef: any): boolean =>
  mockDef && mockDef.ngModule && isNgModuleDefWithProviders(def);

const createResolveExisting = (def: any, resolutions: Map<any, any>, change: (flag?: boolean) => void): any => {
  const mockDef = resolutions.get(def);
  if (def !== mockDef) {
    change();
  }

  return mockDef;
};

const createResolveExcluded = (def: any, resolutions: Map<any, any>, change: (flag?: boolean) => void): void => {
  resolutions.set(def, undefined);

  change();
};

const createResolve =
  (resolutions: Map<any, any>, change: (flag?: boolean) => void): ((def: any) => any) =>
  (def: any) => {
    if (resolutions.has(def)) {
      return createResolveExisting(def, resolutions, change);
    }

    const detectedDef = isNgModuleDefWithProviders(def) ? def.ngModule : def;
    if (ngMocksUniverse.isExcludedDef(detectedDef)) {
      return createResolveExcluded(def, resolutions, change);
    }
    ngMocksUniverse.touches.add(detectedDef);

    const mockDef = processDef(def);
    if (createResolveWithProviders(def, mockDef)) {
      resolutions.set(def.ngModule, mockDef.ngModule);
    }
    if (ngMocksUniverse.flags.has('skipMock')) {
      ngMocksUniverse.config.get('ngMocksDepsSkip')?.add(mockDef);
    }
    resolutions.set(def, mockDef);
    change(mockDef !== def);

    return mockDef;
  };

export default (
  change: () => void,
  resolutions: Map<any, any>,
): {
  resolve: (def: any) => any;
  resolveProvider: (def: Provider) => any;
} => {
  const resolve = createResolve(resolutions, change);
  const resolveProvider = createResolveProvider(resolutions, change);

  return {
    resolve,
    resolveProvider,
  };
};
