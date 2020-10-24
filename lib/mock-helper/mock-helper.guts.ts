// tslint:disable:no-default-export

import { core } from '@angular/compiler';
import { TestModuleMetadata } from '@angular/core/testing';

import { flatten, isNgDef, isNgInjectionToken, isNgModuleDefWithProviders } from '../common/lib';
import { ngModuleResolver } from '../common/reflect';
import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockModule, MockProvider } from '../mock-module/mock-module';
import { MockPipe } from '../mock-pipe/mock-pipe';

export default (keep: any, mock?: any): TestModuleMetadata => {
  const declarations: any[] = [];
  const imports: any[] = [];
  const providers: any[] = [];

  const keepFlat: any[] = flatten(keep);
  const mockFlat: any[] = mock ? flatten(mock) : [];
  const skip: any[] = [];

  const resolve = (def: any, skipDestruction = true): void => {
    if (!def) {
      return;
    }

    if (isNgModuleDefWithProviders(def)) {
      if (skip.indexOf(def.ngModule) !== -1) {
        return;
      }
      skip.push(def.ngModule);

      imports.push(keepFlat.indexOf(def.ngModule) === -1 ? MockModule(def) : def);
      return;
    }

    if (isNgDef(def, 'm') && keepFlat.indexOf(def) !== -1) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);

      imports.push(def);
      return;
    }

    if (isNgDef(def, 'm') && skipDestruction && keepFlat.indexOf(def) === -1) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);

      imports.push(MockModule(def));
      return;
    }

    if (isNgDef(def, 'm') && keepFlat.indexOf(def) === -1) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);

      let meta: core.NgModule;
      try {
        meta = ngModuleResolver.resolve(def);
      } catch (e) {
        /* istanbul ignore next */
        throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
      }

      for (const toMock of flatten([meta.declarations, meta.imports, meta.providers])) {
        resolve(toMock);
      }
      return;
    }

    if (isNgDef(def, 'c')) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);

      declarations.push(keepFlat.indexOf(def) === -1 ? MockComponent(def) : def);
      return;
    }

    if (isNgDef(def, 'd')) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);

      declarations.push(keepFlat.indexOf(def) === -1 ? MockDirective(def) : def);
      return;
    }

    if (isNgDef(def, 'p')) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);

      declarations.push(keepFlat.indexOf(def) === -1 ? MockPipe(def) : def);
      return;
    }

    const provider = typeof def === 'object' && def.provide ? def.provide : def;
    if (!isNgInjectionToken(provider) && skip.indexOf(provider) !== -1) {
      return;
    }
    skip.push(provider);
    const providerDef = keepFlat.indexOf(provider) === -1 ? MockProvider(def) : def;
    if (providerDef) {
      providers.push(providerDef);
    }
  };

  for (const def of mockFlat) {
    resolve(def, false);
  }

  for (const def of keepFlat) {
    if (skip.indexOf(def) !== -1) {
      continue;
    }

    if (isNgDef(def, 'm')) {
      imports.push(def);
      continue;
    }

    if (isNgDef(def, 'c')) {
      declarations.push(def);
      continue;
    }

    if (isNgDef(def, 'd')) {
      declarations.push(def);
      continue;
    }

    if (isNgDef(def, 'p')) {
      declarations.push(def);
      continue;
    }

    if (isNgInjectionToken(def)) {
      continue;
    }
    providers.push(def);
  }

  return {
    declarations,
    imports,
    providers,
  };
};
