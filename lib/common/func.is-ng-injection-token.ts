import { InjectionToken } from '@angular/core';

/**
 * Checks whether a variable is a real token.
 *
 * @see https://github.com/ike18t/ng-mocks#isnginjectiontoken
 */
export const isNgInjectionToken = (token: any): token is InjectionToken<any> =>
  typeof token === 'object' && token.ngMetadataName === 'InjectionToken';
