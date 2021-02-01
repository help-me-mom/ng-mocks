import { LegacyControlValueAccessor } from '../common/mock-control-value-accessor';

export type MockedComponent<T> = T &
  LegacyControlValueAccessor & {
    /**
     *  Helper function to hide rendered @ContentChild() template.
     */
    __hide(
      contentChildSelector:
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
        | string,
    ): void;

    /**
     * Helper function to render any @ContentChild() template with any context.
     */
    __render(
      contentChildSelector:
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
        | string,
      $implicit?: any,
      variables?: Record<keyof any, any>,
    ): void;
  };
