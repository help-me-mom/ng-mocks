import { DOCUMENT } from '@angular/common';
import { isNgInjectionToken } from 'ng-mocks';

import ngConfig from '../common/core.config';
import { ngMocksUniverse } from '../common/ng-mocks-universe';

// Checks if we should avoid mocking of the provider.
export default (provide: any): boolean => {
  if (!provide) {
    return true;
  }
  if (ngMocksUniverse.touches.has(provide)) {
    return true;
  }

  if (provide === DOCUMENT) {
    return true;
  }

  if (typeof provide === 'function' && ngConfig.neverMockProvidedFunction.indexOf(provide.name) !== -1) {
    return true;
  }
  if (isNgInjectionToken(provide) && ngConfig.neverMockToken.indexOf(provide.toString()) !== -1) {
    return true;
  }

  // Empty providedIn or things for a platform have to be skipped.
  let skip = !provide.ɵprov?.providedIn || provide.ɵprov.providedIn === 'platform';
  /* istanbul ignore next: A6 */
  skip = skip && (!provide.ngInjectableDef?.providedIn || provide.ngInjectableDef.providedIn === 'platform');
  if (typeof provide === 'function' && skip) {
    return true;
  }
  return false;
};
