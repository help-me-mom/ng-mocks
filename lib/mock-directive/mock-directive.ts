import { core } from '@angular/compiler';
import { Directive, ElementRef, forwardRef, OnInit, Optional, TemplateRef, ViewContainerRef } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { getMockedNgDefOf, MockControlValueAccessor, MockOf, Type } from '../common';
import { decorateInputs, decorateOutputs, decorateQueries } from '../common/decorate';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { directiveResolver } from '../common/reflect';

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

export function MockDirectives(...directives: Array<Type<any>>): Array<Type<MockedDirective<any>>> {
  return directives.map(MockDirective);
}

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<MockedDirective<TDirective>> {
  // We are inside of an 'it'.
  // It's fine to to return a mock or to throw an exception if it wasn't mocked in TestBed.
  if ((getTestBed() as any)._instantiated) {
    try {
      return getMockedNgDefOf(directive, 'd');
    } catch (error) {
      // looks like an in-test mock.
    }
  }
  if (ngMocksUniverse.flags.has('cacheDirective') && ngMocksUniverse.cache.has(directive)) {
    return ngMocksUniverse.cache.get(directive);
  }

  let meta: core.Directive | undefined;
  if (!meta) {
    try {
      meta = directiveResolver.resolve(directive);
    } catch (e) {
      throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
    }
  }
  const { selector, exportAs, inputs, outputs, queries } = meta;

  const options: Directive = {
    exportAs,
    providers: [
      {
        multi: true,
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DirectiveMock),
      },
      {
        provide: directive,
        useExisting: forwardRef(() => DirectiveMock),
      },
    ],
    selector,
  };

  const config = ngMocksUniverse.config.get(directive);

  @MockOf(directive, outputs)
  class DirectiveMock extends MockControlValueAccessor implements OnInit {
    constructor(
      @Optional() element?: ElementRef,
      @Optional() template?: TemplateRef<any>,
      @Optional() viewContainer?: ViewContainerRef
    ) {
      super();

      // Basically any directive on ng-template is treated as structural, even it doesn't control render process.
      // In our case we don't if we should render it or not and due to this we do nothing.
      (this as any).__element = element;
      (this as any).__template = template;
      (this as any).__viewContainer = viewContainer;
      (this as any).__isStructural = template && viewContainer;

      // Providing method to render mocked values.
      (this as any).__render = ($implicit?: any, variables?: { [key: string]: any }) => {
        if (viewContainer && template) {
          viewContainer.clear();
          viewContainer.createEmbeddedView(template, { ...variables, $implicit });
        }
      };
    }

    ngOnInit(): void {
      if (config && config.render) {
        const { $implicit, variables } =
          config.render !== true
            ? config.render
            : {
                $implicit: undefined,
                variables: {},
              };
        (this as any).__render($implicit, variables);
      }
    }
  }

  decorateInputs(DirectiveMock, inputs);
  decorateOutputs(DirectiveMock, outputs);
  decorateQueries(DirectiveMock, queries);

  const mockedDirective: Type<MockedDirective<TDirective>> = Directive(options)(DirectiveMock as any);
  if (ngMocksUniverse.flags.has('cacheDirective')) {
    ngMocksUniverse.cache.set(directive, mockedDirective);
  }

  return mockedDirective;
}
