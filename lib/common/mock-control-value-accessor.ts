// tslint:disable variable-name ban-ts-ignore

import { Mock } from './mock';

/**
 * @deprecated use isMockControlValueAccessor or isMockValidator instead
 * @see https://github.com/ike18t/ng-mocks#ismockcontrolvalueaccessor
 * @see https://github.com/ike18t/ng-mocks#ismockvalidator
 */
export class LegacyControlValueAccessor extends Mock {
  /**
   * @deprecated use isMockControlValueAccessor instead
   * @see https://github.com/ike18t/ng-mocks#ismockcontrolvalueaccessor
   */
  public __simulateChange(value: any): void;
  // istanbul ignore next
  public __simulateChange() {
    // nothing to do.
  }

  // istanbul ignore next
  /**
   * @deprecated use isMockControlValueAccessor instead
   * @see https://github.com/ike18t/ng-mocks#ismockcontrolvalueaccessor
   */
  public __simulateTouch() {
    // nothing to do.
  }

  // istanbul ignore next
  /**
   * @deprecated use isMockValidator instead
   * @see https://github.com/ike18t/ng-mocks#ismockvalidator
   */
  public __simulateValidatorChange() {
    // nothing to do.
  }
}

/**
 * @see https://github.com/ike18t/ng-mocks#ismockcontrolvalueaccessor
 */
export interface MockControlValueAccessor {
  /**
   * @see https://github.com/ike18t/ng-mocks#how-to-create-a-mock-form-control
   */
  __simulateChange(value: any): void;

  /**
   * @see https://github.com/ike18t/ng-mocks#how-to-create-a-mock-form-control
   */
  __simulateTouch(): void;
}

/**
 * @see https://github.com/ike18t/ng-mocks#ismockvalidator
 */
export interface MockValidator {
  /**
   * @see https://github.com/ike18t/ng-mocks#how-to-create-a-mock-form-control
   */
  __simulateValidatorChange(): void;
}
