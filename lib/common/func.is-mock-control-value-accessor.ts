import funcIsMock from './func.is-mock';
import { MockControlValueAccessor } from './mock-control-value-accessor';

/**
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockControlValueAccessor
 */
export const isMockControlValueAccessor = <T>(value: T): value is T & MockControlValueAccessor => {
  if (!funcIsMock(value)) {
    return false;
  }

  return !!value.__ngMocksConfig.isControlValueAccessor;
};
