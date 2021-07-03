import { flatten, mapValues } from '../../common/core.helpers';
import errorJestMock from '../../common/error.jest-mock';
import { isNgDef } from '../../common/func.is-ng-def';
import { isNgInjectionToken } from '../../common/func.is-ng-injection-token';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import { BuilderData } from './types';

const skipDef = (def: any): boolean =>
  ngMocksUniverse.touches.has(def) || isNgDef(def) || isNgInjectionToken(def) || typeof def === 'string';

export default (params: BuilderData): void => {
  for (const def of flatten([mapValues(params.keepDef), mapValues(params.mockDef)])) {
    if (skipDef(def)) {
      continue;
    }
    errorJestMock(def);
  }
};
