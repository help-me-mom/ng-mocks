import { InjectionToken } from '@angular/core';

/**
 * Checks whether a variable is a real token.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isNgInjectionToken
 */
export const isNgInjectionToken = (token: any): token is InjectionToken<any> =>
  token && typeof token === 'object' && token.ngMetadataName === 'InjectionToken';
