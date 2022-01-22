// istanbul ignore file

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
     * @deprecated use this.__vcr (removing in A13)
     */
    __viewContainer?: ViewContainerRef;

    /**
     * @deprecated use ngMocks.hide instead (removing in A13)
     */
    __render($implicit?: any, variables?: Record<keyof any, any>): void;
  };
