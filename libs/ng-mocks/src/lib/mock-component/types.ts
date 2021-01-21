import { LegacyControlValueAccessor } from '../common/mock-control-value-accessor';

export type MockedComponent<T> = T &
  LegacyControlValueAccessor & {
    /**
     *  Helper function to hide rendered @ContentChild() template.
     */
    __hide(contentChildSelector: string): void;

    /**
     * Helper function to render any @ContentChild() template with any context.
     */
    __render(contentChildSelector: string, $implicit?: any, variables?: Record<keyof any, any>): void;
  };
