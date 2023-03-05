import { AnyDeclaration } from '../common/core.types';
import funcIterateDeclaration from '../common/func.iterate-declaration';
import ngMocksUniverse from '../common/ng-mocks-universe';

import funcGlobalPrepare from './func.global-prepare';
import mockHelperDefaultMock from './mock-helper.default-mock';

const action = (source: AnyDeclaration<any>): void => {
  ngMocksUniverse.getDefaults().delete(source);
  mockHelperDefaultMock(source);
};

export default (source: AnyDeclaration<any>, recursively = false): void => {
  funcGlobalPrepare();
  action(source);

  if (recursively) {
    funcIterateDeclaration(source, action);
  }
};
