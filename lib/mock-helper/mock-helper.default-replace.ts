import { AnyType } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default (source: AnyType<any>, destination: AnyType<any>): void => {
  ngMocksUniverse.getDefaults().set(source, destination);
};
