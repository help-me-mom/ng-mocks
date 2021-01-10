import { AnyType } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default (source: AnyType<any>, destination: AnyType<any>): void => {
  let fail = true;
  if (isNgDef(source, 'm') && isNgDef(destination, 'm')) {
    fail = false;
  } else if (isNgDef(source, 'c') && isNgDef(destination, 'c')) {
    fail = false;
  } else if (isNgDef(source, 'd') && isNgDef(destination, 'd')) {
    fail = false;
  } else if (isNgDef(source, 'p') && isNgDef(destination, 'p')) {
    fail = false;
  }

  if (fail) {
    throw new Error('Cannot replace the declaration, both have to be a Module, a Component, a Directive or a Pipe');
  }

  ngMocksUniverse.cacheDeclarations.clear();
  ngMocksUniverse.config.get('ngMocksDepsSkip')?.clear();
  ngMocksUniverse.getDefaults().set(source, destination);
};
