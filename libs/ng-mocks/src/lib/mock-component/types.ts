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

export type MockedComponent<T> = T &
  LegacyControlValueAccessor & {
    /**
     *  Helper function to hide rendered @ContentChild() template.
     */
    __hide(contentChildSelector: MockedComponentSelector<T>): void;

    /**
     * Helper function to render any @ContentChild() template with any context.
     */
    __render(
      contentChildSelector: MockedComponentSelector<T>,
      $implicit?: any,
      variables?: Record<keyof any, any>,
    ): void;
  };
