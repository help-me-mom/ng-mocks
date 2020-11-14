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

import { flatten } from '../common/core.helpers';
import { directiveResolver } from '../common/core.reflect';
import { AnyType, Type } from '../common/core.types';
import decorateInputs from '../common/decorate.inputs';
import decorateOutputs from '../common/decorate.outputs';
import decorateQueries from '../common/decorate.queries';
import { getMockedNgDefOf } from '../common/func.get-mocked-ng-def-of';
import { MockControlValueAccessor } from '../common/mock-control-value-accessor';
import { MockOf } from '../common/mock-of';
import ngMocksUniverse from '../common/ng-mocks-universe';
import mockServiceHelper from '../mock-service/helper';

import { MockedDirective } from './types';

export function MockDirectives(...directives: Array<Type<any>>): Array<Type<MockedDirective<any>>> {
  return directives.map(MockDirective);
}

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-directive
 */
export function MockDirective<TDirective>(directive: AnyType<TDirective>): Type<MockedDirective<TDirective>>;
export function MockDirective<TDirective>(directive: Type<TDirective>): Type<MockedDirective<TDirective>> {
  // We are inside of an 'it'.
  // It's fine to to return a mock copy or to throw an exception if it wasn't replaced with its mock copy in TestBed.
  if ((getTestBed() as any)._instantiated) {
    try {
      return getMockedNgDefOf(directive, 'd');
    } catch (error) {
      // looks like an in-test mock.
    }
  }
  if (ngMocksUniverse.flags.has('cacheDirective') && ngMocksUniverse.cacheDeclarations.has(directive)) {
    return ngMocksUniverse.cacheDeclarations.get(directive);
  }

  let meta: core.Directive;
  try {
    meta = directiveResolver.resolve(directive);
  } catch (e) {
    /* istanbul ignore next */
    throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
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

      // Providing method to render mock values.
      (this as any).__render = ($implicit?: any, variables?: Record<keyof any, any>) => {
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
    ngMocksUniverse.cacheDeclarations.set(directive, DirectiveMock);
  }

  return DirectiveMock as any;
}
