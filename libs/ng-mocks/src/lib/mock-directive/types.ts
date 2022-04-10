// istanbul ignore file

import { ChangeDetectorRef, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';

import { LegacyControlValueAccessor } from '../common/mock-control-value-accessor';

/**
 * MockedDirective is a legacy representation of an interface of a mock directive instance.
 * Please avoid its usage and try to rely on ngMocks.render() and ngMocks.hide().
 *
 * @see https://ng-mocks.sudo.eu/api/ngMocks/render#render-structural-directives
 * @see https://ng-mocks.sudo.eu/api/ngMocks/hide
 */
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
     * @deprecated use ngMocks.render instead (removing in A13)
     * @see https://ng-mocks.sudo.eu/api/ngMocks/render#render-structural-directives
     */
    __render($implicit?: any, variables?: Record<keyof any, any>): void;
  };
