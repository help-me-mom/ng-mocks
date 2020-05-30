import { core } from '@angular/compiler';
import { Directive, ElementRef, forwardRef, Optional, TemplateRef, Type, ViewContainerRef } from '@angular/core';

import { MockControlValueAccessor, MockOf } from '../common';
import { decorateInputs, decorateOutputs, decorateQueries } from '../common/decorate';
import { directiveResolver } from '../common/reflect';

const cache = new Map<Type<Directive>, Type<MockedDirective<Directive>>>();

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
  const cacheHit = cache.get(directive);
  if (cacheHit) {
    return cacheHit as Type<MockedDirective<TDirective>>;
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
        provide: directive,
        useExisting: forwardRef(() => DirectiveMock),
      },
    ],
    selector,
  };

  @MockOf(directive, outputs)
  class DirectiveMock extends MockControlValueAccessor {
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
  }

  decorateInputs(DirectiveMock, inputs);
  decorateOutputs(DirectiveMock, outputs);
  decorateQueries(DirectiveMock, queries);

  const mockedDirective: Type<MockedDirective<TDirective>> = Directive(options)(DirectiveMock as any);
  cache.set(directive, mockedDirective);

  return mockedDirective;
}
