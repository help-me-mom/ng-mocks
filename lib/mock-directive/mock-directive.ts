import {
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Optional,
  TemplateRef,
  Type,
  ViewContainerRef
} from '@angular/core';
import { MockOf } from '../common';
import { directiveResolver } from '../common/reflect';

const cache = new Map<Type<Directive>, Type<Directive>>();

export type MockDirective<T> = T & {
  /** Pointer to current element in case of Attribute Directives. */
  __element?: ElementRef;

  /** Just a flag for easy understanding what it is. */
  __isStructural: boolean;

  /** Pointer to the template of Structural Directives. */
  __template?: TemplateRef<any>;

  /** Pointer to the view of Structural Directives. */
  __viewContainer?: ViewContainerRef;

  /** Helper function to render any Structural Directive with any context. */
  __render($implicit?: any, variables?: {[key: string]: any}): void;
};

export function MockDirectives(...directives: Array<Type<any>>): Array<Type<any>> {
  return directives.map(MockDirective);
}

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<MockDirective<TDirective>> {
  const cacheHit = cache.get(directive);
  if (cacheHit) {
    return cacheHit as Type<MockDirective<TDirective>>;
  }

  const { selector, exportAs, inputs, outputs } = directiveResolver.resolve(directive);

  // tslint:disable:no-unnecessary-class
  @MockOf(directive)
  @Directive({
    exportAs,
    inputs,
    outputs,
    providers: [{
      provide: directive,
      useExisting: forwardRef(() => DirectiveMock)
    }],
    selector
  })
  class DirectiveMock {

    constructor(
      @Optional() element?: ElementRef,
      @Optional() template?: TemplateRef<any>,
      @Optional() viewContainer?: ViewContainerRef,
    ) {
      (this as any).__element = element;
      (this as any).__isStructural = viewContainer && template;
      (this as any).__template = template;
      (this as any).__viewContainer = viewContainer;

      Object.keys(directive.prototype).forEach((method) => {
        if (!(this as any)[method]) {
          (this as any)[method] = () => {};
        }
      });

      (outputs || []).forEach((output) => {
        (this as any)[output.split(':')[0]] = new EventEmitter<any>();
      });

      // Providing method to render mocked values.
      (this as any).__render = ($implicit?: any, variables?: {[key: string]: any}) => {
        if (viewContainer && template) {
          viewContainer.clear();
          viewContainer.createEmbeddedView(template, {...variables, $implicit});
        }
      };

      // In case of structural directives we don't know how to render it properly when it's mocked.
      // Because variables can be mapped, reduced, changed etc.
      // Due to that we render it without any variables.
      if (viewContainer && template) {
        (this as any).__render();
      }
    }
  }
  // tslint:enable:no-unnecessary-class

  cache.set(directive, DirectiveMock);

  return DirectiveMock as Type<MockDirective<TDirective>>;
}
