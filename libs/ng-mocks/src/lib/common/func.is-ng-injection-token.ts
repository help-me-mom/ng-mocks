import { InjectionToken } from '@angular/core';

/**
 * Checks whether a variable is an Angular token.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isNgInjectionToken
 *
 * ```ts
 * isNgInjectionToken(APP_ID); // returns true
 * isNgInjectionToken(arbitraryVariable); // returns false
 * ```
 */
export const isNgInjectionToken = (token: any): token is InjectionToken<any> =>
  token && typeof token === 'object' && token.ngMetadataName === 'InjectionToken';
