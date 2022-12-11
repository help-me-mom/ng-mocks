import { NG_MOCKS } from '../common/core.tokens';
import ngMocksUniverse from '../common/ng-mocks-universe';
import funcGetLastFixture from '../mock-helper/func.get-last-fixture';

export default (declaration: any) => {
  let result: any;

  try {
    result = funcGetLastFixture().debugElement.injector.get(NG_MOCKS).get(declaration);
  } catch {
    // nothing to do.
  }

  if (!result) {
    result = ngMocksUniverse.cacheDeclarations.get(declaration);
  }

  if (declaration.__ngMocksResolutions && ngMocksUniverse.config.has('mockNgDefResolver')) {
    ngMocksUniverse.config.get('mockNgDefResolver').merge(declaration.__ngMocksResolutions);
  }

  return result;
};
