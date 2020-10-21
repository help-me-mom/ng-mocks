import { core } from '@angular/compiler';
import {
  Directive,
  ElementRef,
  forwardRef,
  Injector,
  OnInit,
  Optional,
  Provider,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AbstractType, flatten, getMockedNgDefOf, MockControlValueAccessor, MockOf, Type } from '../common';
import { decorateInputs, decorateOutputs, decorateQueries } from '../common/decorate';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { directiveResolver } from '../common/reflect';
import { mockServiceHelper } from '../mock-service/mock-service';

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

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<MockedDirective<TDirective>>;
export function MockDirective<TDirective>(directive: AbstractType<TDirective>): Type<MockedDirective<TDirective>>;
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
  if (ngMocksUniverse.flags.has('cacheDirective') && ngMocksUniverse.cacheMocks.has(directive)) {
    return ngMocksUniverse.cacheMocks.get(directive);
  }

  let meta: core.Directive | undefined;
  /* istanbul ignore else */
  if (!meta) {
    try {
      meta = directiveResolver.resolve(directive);
    } catch (e) {
      /* istanbul ignore next */
      throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
    }
  }
  const { selector, exportAs, inputs, outputs, queries, providers } = meta;

  const options: Directive = {
    exportAs,
    providers: [
      {
        provide: directive,
        useExisting: (() => {
          const value: Type<any> & { __ngMocksSkip?: boolean } = forwardRef(() => DirectiveMock);
          value.__ngMocksSkip = true;
          return value;
        })(),
      },
    ],
    selector,
  };

  const resolutions = new Map();
  const resolveProvider = (def: Provider) => mockServiceHelper.resolveProvider(def, resolutions);

  let setNgValueAccessor: undefined | boolean;
  for (const providerDef of flatten(providers || [])) {
    const provide =
      providerDef && typeof providerDef === 'object' && providerDef.provide ? providerDef.provide : providerDef;
    if (options.providers && provide === NG_VALIDATORS) {
      options.providers.push({
        multi: true,
        provide,
        useExisting: (() => {
          const value: Type<any> & { __ngMocksSkip?: boolean } = forwardRef(() => DirectiveMock);
          value.__ngMocksSkip = true;
          return value;
        })(),
      });
      continue;
    }
    if (setNgValueAccessor === undefined && options.providers && provide === NG_VALUE_ACCESSOR) {
      setNgValueAccessor = false;
      options.providers.push({
        multi: true,
        provide,
        useExisting: (() => {
          const value: Type<any> & { __ngMocksSkip?: boolean } = forwardRef(() => DirectiveMock);
          value.__ngMocksSkip = true;
          return value;
        })(),
      });
      continue;
    }

    const mock = resolveProvider(providerDef);
    /* istanbul ignore else */
    if (options.providers && mock) {
      options.providers.push(mock);
    }
  }
  if (setNgValueAccessor === undefined) {
    setNgValueAccessor =
      mockServiceHelper.extractMethodsFromPrototype(directive.prototype).indexOf('writeValue') !== -1;
  }

  const config = ngMocksUniverse.config.get(directive);

  @Directive(options)
  @MockOf(directive, { outputs, setNgValueAccessor })
  class DirectiveMock extends MockControlValueAccessor implements OnInit {
    /* istanbul ignore next */
    constructor(
      injector: Injector,
      @Optional() element?: ElementRef,
      @Optional() template?: TemplateRef<any>,
      @Optional() viewContainer?: ViewContainerRef
    ) {
      super(injector);
      this.__ngMocksInstall(element, template, viewContainer);
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

    private __ngMocksInstall(
      element?: ElementRef,
      template?: TemplateRef<any>,
      viewContainer?: ViewContainerRef
    ): void {
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

  /* istanbul ignore else */
  if (queries) {
    decorateInputs(DirectiveMock, inputs, Object.keys(queries));
  }
  decorateOutputs(DirectiveMock, outputs);
  decorateQueries(DirectiveMock, queries);

  /* istanbul ignore else */
  if (ngMocksUniverse.flags.has('cacheDirective')) {
    ngMocksUniverse.cacheMocks.set(directive, DirectiveMock);
  }

  return DirectiveMock as any;
}
