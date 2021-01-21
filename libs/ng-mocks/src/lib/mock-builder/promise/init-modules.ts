import { mapValues } from '../../common/core.helpers';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import { MockModule } from '../../mock-module/mock-module';
import mockNgDef from '../../mock-module/mock-ng-def';

export default (
  keepDef: Set<any>,
  mockDef: Set<any>,
  replaceDef: Set<any>,
  defProviders: Map<any, any>,
): Map<any, any> => {
  const loProviders = new Map();

  for (const def of [...mapValues(keepDef), ...mapValues(mockDef), ...mapValues(replaceDef)]) {
    if (!isNgDef(def, 'm')) {
      continue;
    }

    if (defProviders.has(def) && mockDef.has(def)) {
      const [, loDef] = mockNgDef({ providers: defProviders.get(def) });
      loProviders.set(def, loDef.providers);
    } else if (defProviders.has(def)) {
      loProviders.set(def, defProviders.get(def));
    }

    ngMocksUniverse.builtDeclarations.set(def, MockModule(def));
    ngMocksUniverse.touches.delete(def);
  }

  return loProviders;
};
