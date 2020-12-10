import funcIsMock from './func.is-mock';
import { MockValidator } from './mock-control-value-accessor';

/**
 * @see https://github.com/ike18t/ng-mocks#ismockvalidator
 */
export const isMockValidator = <T>(value: T): value is T & MockValidator => {
  if (!funcIsMock(value)) {
    return false;
  }

  return !!(value as any).__ngMocksConfig.isValidator;
};
