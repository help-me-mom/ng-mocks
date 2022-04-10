import { Mock } from './mock';

/**
 * LegacyControlValueAccessor was used to be a way to manipulate a mock ControlValueAccessor.
 *
 * @deprecated use isMockControlValueAccessor or isMockValidator instead (removing in A13)
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockControlValueAccessor
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockValidator
 */
export class LegacyControlValueAccessor extends Mock {
  /**
   * @deprecated use isMockControlValueAccessor instead (removing in A13)
   * @see https://ng-mocks.sudo.eu/api/helpers/isMockControlValueAccessor
   */
  public __simulateChange(value: any): void;
  // istanbul ignore next
  public __simulateChange() {
    // nothing to do.
  }

  // istanbul ignore next
  /**
   * @deprecated use isMockControlValueAccessor instead (removing in A13)
   * @see https://ng-mocks.sudo.eu/api/helpers/isMockControlValueAccessor
   */
  public __simulateTouch() {
    // nothing to do.
  }

  // istanbul ignore next
  /**
   * @deprecated use isMockValidator instead (removing in A13)
   * @see https://ng-mocks.sudo.eu/api/helpers/isMockValidator
   */
  public __simulateValidatorChange() {
    // nothing to do.
  }
}

/**
 * MockControlValueAccessor exposes access to a mock ControlValueAccessor.
 * It should be used in a combination with isMockControlValueAccessor.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockControlValueAccessor
 */
export interface MockControlValueAccessor {
  /**
   * It simulates an external change of the value.
   * Please consider usage of ngMocks.change().
   *
   * @see https://ng-mocks.sudo.eu/extra/mock-form-controls
   * @see https://ng-mocks.sudo.eu/api/ngMocks/change
   */
  __simulateChange(value: any): void;

  /**
   * It simulates an external touch.
   * Please consider usage of ngMocks.touch().
   *
   * @see https://ng-mocks.sudo.eu/extra/mock-form-controls
   * @see https://ng-mocks.sudo.eu/api/ngMocks/touch
   */
  __simulateTouch(): void;
}

/**
 * MockValidator exposes access to a mock Validator.
 * It should be used in a combination with isMockValidator.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockValidator
 */
export interface MockValidator {
  /**
   * it simulates an external validation change.
   *
   * @see https://ng-mocks.sudo.eu/extra/mock-form-controls
   */
  __simulateValidatorChange(): void;
}
