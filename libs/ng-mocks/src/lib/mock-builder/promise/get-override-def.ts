import { Directive, NgModule } from '@angular/core';

import ngMocksUniverse from '../../common/ng-mocks-universe';
import mockNgDef from '../../mock-module/mock-ng-def';

export default (meta?: Directive | NgModule): NgModule | undefined => {
  if (!meta) {
    return undefined;
  }

  const skipMock = ngMocksUniverse.flags.has('skipMock');
  // istanbul ignore else
  if (!skipMock) {
    ngMocksUniverse.flags.add('skipMock');
  }
  const [changed, def] = mockNgDef(meta);
  // istanbul ignore else
  if (!skipMock) {
    ngMocksUniverse.flags.delete('skipMock');
  }
  if (!changed) {
    return undefined;
  }

  return def;
};
