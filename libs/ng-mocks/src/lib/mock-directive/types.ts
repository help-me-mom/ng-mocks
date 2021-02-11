import { ChangeDetectorRef, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';

import { LegacyControlValueAccessor } from '../common/mock-control-value-accessor';

export type MockedDirective<T> = T &
  LegacyControlValueAccessor & {
    /**
     * Pointer to ChangeDetectorRef.
     */
    __cdr?: ChangeDetectorRef;

    /**
     * Pointer to current element in case of Attribute Directives.
     */
    __element?: ElementRef;

    /**
     * Just a flag for easy understanding what it is.
     */
    __isStructural: boolean;

    /**
     * Pointer to the template of Structural Directives.
     */
    __template?: TemplateRef<any>;

    /**
     * Pointer to ViewContainerRef.
     */
    __vcr?: ViewContainerRef;

    /**
     * Pointer to the view of Structural Directives.
     * @deprecated use this.__vcr
     */
    __viewContainer?: ViewContainerRef;

    /**
     * Helper function to render any Structural Directive with any context.
     */
    __render($implicit?: any, variables?: Record<keyof any, any>): void;
  };
