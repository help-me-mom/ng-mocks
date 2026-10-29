import { AnyType } from '../../common/core.types';
import { funcExtractDeps } from '../../common/func.extract-deps';
import { getSourceOfMock } from '../../common/func.get-source-of-mock';
import { isMockNgDef } from '../../common/func.is-mock-ng-def';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import tryMockProvider from './try-mock-provider';

export default (mockDef: Set<any>, defValue: Map<any, any>): void => {
  const builtDeclarations = ngMocksUniverse.builtDeclarations;
  const resolutions: Map<any, string> = ngMocksUniverse.config.get('ngMocksDepsResolution');
  for (const def of mockDef) {
    const deleteTouch = !ngMocksUniverse.touches.has(def);

    resolutions.set(def, 'mock');
    builtDeclarations.set(def, ngMocksUniverse.config.get(def).__ngMocksMock);
    tryMockProvider(def, defValue);

    if (deleteTouch) {
      ngMocksUniverse.touches.delete(def);
    }
  }

  const selected: Array<AnyType<unknown>> = [...mockDef]
    .map(def => ngMocksUniverse.config.get(def).__ngMocksMock)
    .filter(Boolean);
  let index = 0;
  while (index < selected.length) {
    const mock = selected[index];
    index += 1;
    for (const dependency of funcExtractDeps(mock, new Set())) {
      if (!isNgDef(dependency) || !isMockNgDef(dependency)) {
        continue;
      }
      const source = getSourceOfMock(dependency);
      const config = ngMocksUniverse.config.get(source);
      const resolution = ngMocksUniverse.getResolution(source);
      if ((resolution && resolution !== 'mock') || config.__ngMocksMock) {
        continue;
      }
      // Retain nested class identities, but resolve their metadata again below.
      // Older Ivy also verifies entry components against the original annotation.
      ngMocksUniverse.config.set(source, { ...config, __ngMocksMock: dependency });
      mockDef.add(source);
      resolutions.set(source, 'mock');
      builtDeclarations.set(source, dependency);
      selected.push(dependency);
    }
  }
};
