// istanbul ignore file

import { LegacyControlValueAccessor } from '../common/mock-control-value-accessor';

export type MockedComponentSelector<T> =
  | [keyof T]
  | [keyof T, number]
  | [keyof T, number, number]
  | [keyof T, number, number, number]
  | [keyof T, number, number, number, number]
  | [keyof T, number, number, number, number, number]
  | [keyof T, number, number, number, number, number, number]
  | [keyof T, number, number, number, number, number, number, number]
  | [keyof T, number, number, number, number, number, number, number, number]
  | [keyof T, number, number, number, number, number, number, number, number, number]
  | [keyof T, number, number, number, number, number, number, number, number, number, number]
  | string;

/**
 * MockedComponent is a legacy representation of an interface of a mock component instance.
 * Please avoid its usage and try to rely on ngMocks.render() and ngMocks.hide().
 *
 * @see https://ng-mocks.sudo.eu/api/ngMocks/render
 * @see https://ng-mocks.sudo.eu/api/ngMocks/hide
 */
export type MockedComponent<T> = T &
  LegacyControlValueAccessor & {
    /**
     * @deprecated use ngMocks.hide instead (removing in A13)
     * @see https://ng-mocks.sudo.eu/api/ngMocks/hide
     */
    __hide(contentChildSelector: MockedComponentSelector<T>): void;

    /**
     * @deprecated use ngMocks.render instead (removing in A13)
     * @see https://ng-mocks.sudo.eu/api/ngMocks/render
     */
    __render(
      contentChildSelector: MockedComponentSelector<T>,
      $implicit?: any,
      variables?: Record<keyof any, any>,
    ): void;
  };
