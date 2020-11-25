import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Query,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { Type } from '../common/core.types';
import { getMockedNgDefOf } from '../common/func.get-mocked-ng-def-of';
import { MockControlValueAccessor } from '../common/mock-control-value-accessor';
import ngMocksUniverse from '../common/ng-mocks-universe';
import decorateDeclaration from '../mock/decorate-declaration';

import { MockedComponent } from './types';

const mixRender = (
  instance: MockControlValueAccessor & Record<keyof any, any>,
  changeDetector: ChangeDetectorRef,
): void => {
  // istanbul ignore next
  const refs = instance.__ngMocksConfig?.viewChildRefs || new Map();

  // Providing a method to render any @ContentChild based on its selector.
  instance.__render = (contentChildSelector: string, $implicit?: any, variables?: Record<keyof any, any>) => {
    const key = refs.get(contentChildSelector);
    let templateRef: TemplateRef<any>;
    let viewContainer: ViewContainerRef;
    if (key) {
      instance[`mockRender_${contentChildSelector}`] = true;
      changeDetector.detectChanges();
      viewContainer = instance[`__mockView_${key}`];
      templateRef = instance[key];
      if (viewContainer && templateRef) {
        viewContainer.clear();
        viewContainer.createEmbeddedView(templateRef, { ...variables, $implicit } as any);
        changeDetector.detectChanges();
      }
    }
  };
};

const mixHide = (
  instance: MockControlValueAccessor & Record<keyof any, any>,
  changeDetector: ChangeDetectorRef,
): void => {
  // istanbul ignore next
  const refs = instance.__ngMocksConfig?.viewChildRefs || new Map();

  // Providing method to hide any @ContentChild based on its selector.
  instance.__hide = (contentChildSelector: string) => {
    const key = refs.get(contentChildSelector);
    if (key) {
      instance[`mockRender_${contentChildSelector}`] = false;
      changeDetector.detectChanges();
    }
  };
};

class ComponentMockBase extends MockControlValueAccessor implements AfterContentInit {
  // istanbul ignore next
  public constructor(changeDetector: ChangeDetectorRef, injector: Injector) {
    super(injector);
    mixRender(this, changeDetector);
    mixHide(this, changeDetector);
  }

  public ngAfterContentInit(): void {
    const config = (this.__ngMocksConfig as any).config;
    if (!(this as any).__rendered && config && config.render) {
      for (const block of Object.keys(config.render)) {
        const { $implicit, variables } =
          config.render[block] !== true
            ? config.render[block]
            : {
                $implicit: undefined,
                variables: {},
              };
        (this as any).__render(block, $implicit, variables);
      }
      (this as any).__rendered = true;
    }
  }
}

const viewChildArgs: any = { read: ViewContainerRef, static: false };
const viewChildTemplate = (selector: string): string =>
  `<div *ngIf="mockRender_${selector}" data-key="${selector}"><ng-template #__${selector}></ng-template></div>`;

const generateTemplate = (
  queries?: Record<keyof any, any>,
): {
  template: string;
  viewChildRefs: Map<string, string>;
} => {
  const parts = [`<ng-content></ng-content>`];
  const viewChildRefs = new Map<string, string>();
  // istanbul ignore if
  if (!queries) {
    return { template: parts.join(''), viewChildRefs };
  }

  for (const key of Object.keys(queries)) {
    const query: Query = queries[key];
    if (query.isViewQuery || typeof query.selector !== 'string') {
      continue; // ignoring all internal @ViewChild, Type based selector doesn't work properly anyway.
    }
    viewChildRefs.set(query.selector, key);
    queries[`__mockView_${key}`] = new ViewChild(`__${query.selector}`, viewChildArgs);
    parts.push(viewChildTemplate(query.selector));
  }

  return {
    template: parts.join(''),
    viewChildRefs,
  };
};

const createMockClass = (): Type<any> => {
  class ComponentMock extends ComponentMockBase {
    // istanbul ignore next
    public constructor(changeDetector: ChangeDetectorRef, injector: Injector) {
      super(changeDetector, injector);
    }
  }

  (ComponentMock as any).parameters = [ChangeDetectorRef, Injector];

  return ComponentMock;
};

const decorateClass = (component: Type<any>, mock: Type<any>): void => {
  const meta = coreReflectDirectiveResolve(component);
  const { exportAs, inputs, outputs, queries, selector, providers } = meta;
  const { template, viewChildRefs } = generateTemplate(queries);
  const mockMeta = { inputs, outputs, providers, queries, viewChildRefs };
  const mockParams = { exportAs, selector, template };
  Component(decorateDeclaration(component, mock, mockMeta, mockParams))(mock);
};

export function MockComponents(...components: Array<Type<any>>): Array<Type<MockedComponent<any>>> {
  return components.map(MockComponent);
}

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-component
 */
export function MockComponent<TComponent>(component: Type<TComponent>): Type<MockedComponent<TComponent>> {
  // We are inside of an 'it'. It's fine to to return a mock copy.
  if ((getTestBed() as any)._instantiated) {
    try {
      return getMockedNgDefOf(component, 'c');
    } catch (error) {
      // looks like an in-test mock.
    }
  }
  if (ngMocksUniverse.flags.has('cacheComponent') && ngMocksUniverse.cacheDeclarations.has(component)) {
    return ngMocksUniverse.cacheDeclarations.get(component);
  }

  const mock = createMockClass();
  decorateClass(component, mock);

  // istanbul ignore else
  if (ngMocksUniverse.flags.has('cacheComponent')) {
    ngMocksUniverse.cacheDeclarations.set(component, mock);
  }

  return mock as any;
}
