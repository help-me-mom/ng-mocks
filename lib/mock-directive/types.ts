import { ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';

import { MockControlValueAccessor } from '../common/mock-control-value-accessor';

export type MockedDirective<T> = T &
  MockControlValueAccessor & {
    /** Pointer to current element in case of Attribute Directives. */
    __element?: ElementRef;

    /** Just a flag for easy understanding what it is. */
    __isStructural: boolean;

    /** Pointer to the template of Structural Directives. */
    __template?: TemplateRef<any>;

    /** Pointer to the view of Structural Directives. */
    __viewContainer?: ViewContainerRef;

    /** Helper function to render any Structural Directive with any context. */
    __render($implicit?: any, variables?: { [key: string]: any }): void;
  };
