import { core } from '@angular/compiler';
import { TestModuleMetadata } from '@angular/core/testing';

import { flatten } from '../common/core.helpers';
import { ngModuleResolver } from '../common/core.reflect';
import { isNgDef } from '../common/func.is-ng-def';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import { isNgModuleDefWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockModule } from '../mock-module/mock-module';
import { MockPipe } from '../mock-pipe/mock-pipe';
import MockProvider from '../mock-service/mock-provider';

export default (keep: any, mock: any = null, exclude: any = null): TestModuleMetadata => {
  const declarations: any[] = [];
  const imports: any[] = [];
  const providers: any[] = [];

  const keepFlat: any[] = [];
  for (const def of keep ? flatten(keep) : []) {
    if (keepFlat.indexOf(def) === -1) {
      keepFlat.push(def);
    }
  }

  const mockFlat: any[] = [];
  for (const def of mock ? flatten(mock) : []) {
    if (mockFlat.indexOf(def) === -1) {
      mockFlat.push(def);
    }
  }

  const excludeFlat: any[] = [];
  for (const def of exclude ? flatten(exclude) : []) {
    if (excludeFlat.indexOf(def) === -1) {
      excludeFlat.push(def);
    }
  }

  const skip: any[] = [];

  const resolveProvider = (def: any): void => {
    const provider = typeof def === 'object' && def.provide ? def.provide : def;
    if (skip.indexOf(provider) === -1) {
      skip.push(provider);
    }
    if (excludeFlat.indexOf(provider) !== -1) {
      return;
    }

    const providerDef = keepFlat.indexOf(provider) === -1 ? MockProvider(def) : def;
    if (providerDef) {
      providers.push(providerDef);
    }
  };

  const resolve = (def: any, skipDestruction = true): void => {
    if (!def) {
      return;
    }

    if (isNgModuleDefWithProviders(def)) {
      if (skip.indexOf(def.ngModule) !== -1) {
        return;
      }
      skip.push(def.ngModule);
      if (excludeFlat.indexOf(def.ngModule) !== -1) {
        return;
      }

      imports.push(keepFlat.indexOf(def.ngModule) === -1 ? MockModule(def) : def);
      return;
    }

    if (isNgDef(def, 'm') && keepFlat.indexOf(def) !== -1) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);
      if (excludeFlat.indexOf(def) !== -1) {
        return;
      }

      imports.push(def);
      return;
    }

    if (isNgDef(def, 'm') && skipDestruction && keepFlat.indexOf(def) === -1) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);
      if (excludeFlat.indexOf(def) !== -1) {
        return;
      }

      imports.push(MockModule(def));
      return;
    }

    if (isNgDef(def, 'm') && keepFlat.indexOf(def) === -1) {
      /* istanbul ignore if: unreachable due to the skipDestruction flag */
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);
      if (excludeFlat.indexOf(def) !== -1) {
        return;
      }

      let meta: core.NgModule;
      try {
        meta = ngModuleResolver.resolve(def);
      } catch (e) {
        /* istanbul ignore next */
        throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
      }

      for (const toMock of flatten([meta.declarations, meta.imports])) {
        resolve(toMock);
      }
      for (const toMock of meta.providers ? flatten(meta.providers) : []) {
        resolveProvider(toMock);
      }
      return;
    }

    if (isNgDef(def, 'c')) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);
      if (excludeFlat.indexOf(def) !== -1) {
        return;
      }

      declarations.push(keepFlat.indexOf(def) === -1 ? MockComponent(def) : def);
      return;
    }

    if (isNgDef(def, 'd')) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);
      if (excludeFlat.indexOf(def) !== -1) {
        return;
      }

      declarations.push(keepFlat.indexOf(def) === -1 ? MockDirective(def) : def);
      return;
    }

    if (isNgDef(def, 'p')) {
      if (skip.indexOf(def) !== -1) {
        return;
      }
      skip.push(def);
      if (excludeFlat.indexOf(def) !== -1) {
        return;
      }

      declarations.push(keepFlat.indexOf(def) === -1 ? MockPipe(def) : def);
      return;
    }

    resolveProvider(def);
  };

  for (const def of mockFlat) {
    resolve(def, false);
  }

  for (const def of keepFlat) {
    if (skip.indexOf(def) !== -1) {
      continue;
    }
    if (excludeFlat.indexOf(def) !== -1) {
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
      providers.push(def);
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
