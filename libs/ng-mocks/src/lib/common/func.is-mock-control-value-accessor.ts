import funcIsMock from './func.is-mock';
import { MockControlValueAccessor } from './mock-control-value-accessor';

/**
 * isMockControlValueAccessor helps to assert that an instance is a mock ControlValueAccessor
 * to perform valueChange or touch simulations.
 * Usually, it is used in if statements.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockControlValueAccessor
 * @see https://ng-mocks.sudo.eu/api/ngMocks/change
 * @see https://ng-mocks.sudo.eu/api/ngMocks/touch
 */
export const isMockControlValueAccessor = <T>(value: T): value is T & MockControlValueAccessor => {
  if (!funcIsMock(value)) {
    return false;
  }

  return !!value.__ngMocksConfig.isControlValueAccessor;
};
