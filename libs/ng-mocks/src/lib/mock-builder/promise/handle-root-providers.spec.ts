import { FactoryProvider } from '@angular/core';

import CoreDefStack from '../../common/core.def-stack';
import coreDefineProperty from '../../common/core.define-property';
import { NG_MOCKS_ROOT_PROVIDERS } from '../../common/core.tokens';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import { MockBuilderStash } from '../mock-builder-stash';

import getRootProviderParameters from './get-root-provider-parameters';
import handleRootProviders from './handle-root-providers';
import initKeepDef from './init-keep-def';
import { BuilderData, NgMeta } from './types';

// @see https://github.com/help-me-mom/ng-mocks/issues/15042
describe('handle-root-providers', () => {
  const stash = new MockBuilderStash();
  let data: BuilderData;
  let ngModule: NgMeta;

  beforeEach(() => {
    stash.backup();
    ngMocksUniverse.config.set('ngMocksDepsResolution', new Map());
    ngMocksUniverse.config.set('ngMocksDepsSkip', new Set());
    ngMocksUniverse.config.set('ngMocksDeps', new Set());
    data = {
      configDef: new Map(),
      configDefault: {},
      defProviders: new Map(),
      defValue: new Map(),
      excludeDef: new Set(),
      keepDef: new Set(),
      mockDef: new Set(),
      providerDef: new Map(),
      replaceDef: new Set(),
    };
    ngModule = { declarations: [], imports: [], providers: [] };
    // Global keeps can enter the final builder data after this initial pass.
    initKeepDef(data.keepDef, data.configDef);
  });
  afterEach(() => stash.restore());

  for (const type of ['Component', 'Directive', 'Pipe']) {
    it(`preserves reflected roots of a deeply kept standalone ${type}`, () => {
      class RootService {}
      class KeptDependency {}
      coreDefineProperty(RootService, 'ɵprov', {
        providedIn: 'root',
      });
      coreDefineProperty(KeptDependency, '__annotations__', [
        { ngMetadataName: type, standalone: true },
      ]);
      coreDefineProperty(KeptDependency, '__parameters__', [
        [RootService],
      ]);

      data.keepDef.add(KeptDependency);
      data.configDef.set(KeptDependency, {});
      ngMocksUniverse.touches.add(KeptDependency);
      handleRootProviders(ngModule, data, new CoreDefStack());

      expect(ngModule.providers).toEqual([]);
      expect(
        getRootProviderParameters(new Set()).has(RootService),
      ).toBe(false);
      expect(
        ngMocksUniverse.config
          .get('ngMocksDepsSkip')
          .has(RootService),
      ).toBe(true);
      expect(
        getRootProviderParameters(
          new Set([NG_MOCKS_ROOT_PROVIDERS]),
        ).has(RootService),
      ).toBe(true);
    });
  }

  for (const standalone of [false, true]) {
    it(`keeps automatic root mocking for a standalone=${standalone} shallow target`, () => {
      class RootService {}
      class Target {}
      coreDefineProperty(RootService, 'ɵprov', {
        providedIn: 'root',
      });
      coreDefineProperty(Target, '__annotations__', [
        { ngMetadataName: 'Component', standalone },
      ]);
      coreDefineProperty(Target, '__parameters__', [[RootService]]);

      data.keepDef.add(Target);
      data.configDef.set(Target, { shallow: standalone });
      ngMocksUniverse.touches.add(Target);
      handleRootProviders(ngModule, data, new CoreDefStack());

      expect(ngModule.providers.length).toBe(1);
      expect((ngModule.providers[0] as FactoryProvider).provide).toBe(
        RootService,
      );
      expect(ngMocksUniverse.config.get('ngMocksDepsSkip').size).toBe(
        0,
      );
    });
  }
});
