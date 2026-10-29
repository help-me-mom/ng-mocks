import coreReflectMeta from '../../common/core.reflect.meta';
import { Type } from '../../common/core.types';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import { MockModule } from '../../mock-module/mock-module';
import mockNgDef from '../../mock-module/mock-ng-def';
import collectDeclarations from '../../resolve/collect-declarations';

import { getMockOverrideDef } from './get-override-def';
import tryMockDeclaration from './try-mock-declaration';

const resolveMockMetadata = (def: Type<unknown>): void => {
  const mock = ngMocksUniverse.config.get(def).__ngMocksMock;
  const meta = mock && coreReflectMeta(def);
  if (!meta) {
    return;
  }
  const override = getMockOverrideDef(def, mock, meta);
  ngMocksUniverse.configInstance.set(def, {
    ...ngMocksUniverse.configInstance.get(def),
    __ngMocksOverride: override,
  });
};

export default (
  keepDef: Set<any>,
  mockDef: Set<any>,
  replaceDef: Set<any>,
  defProviders: Map<any, any>,
): Map<any, any> => {
  const loProviders = new Map();

  for (const def of [...keepDef, ...mockDef, ...replaceDef]) {
    const meta = collectDeclarations(def);
    const providers = [
      ...(defProviders.get(def) ?? []),
      ...(meta.Component?.providers ?? []),
      ...(meta.Directive?.providers ?? []),
    ];

    const deleteTouch = !ngMocksUniverse.touches.has(def);
    if (!mockDef.has(def)) {
      ngMocksUniverse.flags.add('skipMock');
    }

    const isModule = isNgDef(def, 'm');
    if (providers.length > 0) {
      const [, loDef] = mockNgDef({ providers, skipMarkProviders: !isModule, skipExports: true });
      loProviders.set(def, loDef.providers);
    }
    if (isModule) {
      ngMocksUniverse.builtDeclarations.set(def, MockModule(def));
      resolveMockMetadata(def);
    }

    ngMocksUniverse.flags.delete('skipMock');
    if (deleteTouch) {
      ngMocksUniverse.touches.delete(def);
    }
  }
  for (const def of mockDef) {
    tryMockDeclaration(def);
    if (!isNgDef(def, 'm')) {
      resolveMockMetadata(def);
    }
  }

  return loProviders;
};
