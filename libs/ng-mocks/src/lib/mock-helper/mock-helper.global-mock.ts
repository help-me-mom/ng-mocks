import { AnyDeclaration } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';

import funcGlobalPrepare from './func.global-prepare';

export default (source: AnyDeclaration<any>): void => {
  funcGlobalPrepare();
  ngMocksUniverse.getDefaults().set(source, ['mock']);
};
