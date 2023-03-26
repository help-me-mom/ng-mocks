import { mapValues } from '../../common/core.helpers';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import { MockModule } from '../../mock-module/mock-module';
import mockNgDef from '../../mock-module/mock-ng-def';
import collectDeclarations from '../../resolve/collect-declarations';

import tryMockDeclaration from './try-mock-declaration';

export default (
  keepDef: Set<any>,
  mockDef: Set<any>,
  replaceDef: Set<any>,
  defProviders: Map<any, any>,
): Map<any, any> => {
  const loProviders = new Map();

  for (const def of [...mapValues(keepDef), ...mapValues(mockDef), ...mapValues(replaceDef)]) {
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
    }

    ngMocksUniverse.flags.delete('skipMock');
    if (deleteTouch) {
      ngMocksUniverse.touches.delete(def);
    }
  }
  for (const def of mapValues(mockDef)) {
    tryMockDeclaration(def);
  }

  return loProviders;
};
