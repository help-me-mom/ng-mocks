import { Mock } from './mock';

/**
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
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockControlValueAccessor
 */
export interface MockControlValueAccessor {
  /**
   * @see https://ng-mocks.sudo.eu/extra/mock-form-controls
   */
  __simulateChange(value: any): void;

  /**
   * @see https://ng-mocks.sudo.eu/extra/mock-form-controls
   */
  __simulateTouch(): void;
}

/**
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockValidator
 */
export interface MockValidator {
  /**
   * @see https://ng-mocks.sudo.eu/extra/mock-form-controls
   */
  __simulateValidatorChange(): void;
}
