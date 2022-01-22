import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  EmbeddedViewRef,
  Injector,
  Optional,
  QueryList,
  Self,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import coreDefineProperty from '../common/core.define-property';
import coreForm from '../common/core.form';
import { extendClass } from '../common/core.helpers';
import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { Type } from '../common/core.types';
import funcImportExists from '../common/func.import-exists';
import funcIsMock from '../common/func.is-mock';
import { isMockNgDef } from '../common/func.is-mock-ng-def';
import { MockConfig } from '../common/mock';
import { LegacyControlValueAccessor } from '../common/mock-control-value-accessor';
import ngMocksUniverse from '../common/ng-mocks-universe';
import decorateDeclaration from '../mock/decorate-declaration';

import generateTemplate from './render/generate-template';
import getKey from './render/get-key';
import { MockedComponent } from './types';

const mixRenderPrepareVcr = (
  instance: MockConfig & Record<keyof any, any>,
  type: string,
  selector: string,
  cdr: ChangeDetectorRef,
): ViewContainerRef | undefined => {
  if (!instance[`ngMocksRender_${type}_${selector}`]) {
    instance[`ngMocksRender_${type}_${selector}`] = true;
    cdr.detectChanges();
  }

  return instance[`__mockView_${type}_${selector}`];
};

const mixRenderReorderViews = (
  viewContainer: ViewContainerRef,
  views: Array<EmbeddedViewRef<any>>,
  index: number,
): void => {
  for (const view of views.splice(index + 1)) {
    view.destroy();
  }

  let viewIndex = 0;
  for (const view of views) {
    if (!view) {
      continue;
    }
    viewContainer.move(view, viewIndex);
    viewIndex += 1;
  }
};

const mixRenderApplyContext = (view: EmbeddedViewRef<any>, context: Record<any, any>): void => {
  for (const contextKey of Object.keys(view.context)) {
    view.context[contextKey] = undefined;
  }
  for (const contextKey of Object.keys(context)) {
    view.context[contextKey] = (context as any)[contextKey];
  }
  view.markForCheck();
};

const mixRenderHandleViews = (
  vcr: ViewContainerRef,
  cdr: ChangeDetectorRef,
  templates: any[],
  views: Array<EmbeddedViewRef<any>>,
  indices: undefined | number[],
  context: Record<any, any>,
): number => {
  let index = -1;

  for (const templateRef of templates) {
    index += 1;
    views[index] = views[index] || undefined;
    if ((indices && indices.indexOf(index) === -1) || !templateRef) {
      continue;
    }
    if (!(templateRef instanceof TemplateRef)) {
      throw new Error(`Cannot find TemplateRef`);
    }
    if (!views[index]) {
      views[index] = vcr.createEmbeddedView(templateRef, {});
    }
    mixRenderApplyContext(views[index], context);
  }
  cdr.detectChanges();

  return index;
};

const mixRender = (instance: MockConfig & Record<keyof any, any>, cdr: ChangeDetectorRef): void => {
  // Providing a method to render any @ContentChild based on its selector.
  coreDefineProperty(
    instance,
    '__render',
    (contentChildSelector: string | [string, ...number[]], $implicit?: any, variables?: Record<keyof any, any>) => {
      const [type, key, selector, indices] = getKey(contentChildSelector);

      const vcr = mixRenderPrepareVcr(instance, type, selector, cdr);
      if (!vcr) {
        return;
      }

      const property: any = instance[key];
      const templates = property instanceof QueryList ? property.toArray() : [property];

      const views = instance[`ngMocksRender_${type}_${selector}_views`] || [];
      const index = mixRenderHandleViews(vcr, cdr, templates, views, indices, { ...variables, $implicit });

      mixRenderReorderViews(vcr, views, index);
      instance[`ngMocksRender_${type}_${selector}_views`] = views;
      cdr.detectChanges();
    },
  );
};

const mixHideHandler = (
  instance: MockConfig & Record<keyof any, any>,
  type: string,
  selector: string,
  indices: undefined | number[],
) => {
  const views = instance[`ngMocksRender_${type}_${selector}_views`];
  let index = -1;
  for (const view of views) {
    index += 1;
    if ((indices && indices.indexOf(index) === -1) || !view) {
      continue;
    }
    view.destroy();
    views[index] = undefined;
  }
};

const mixHide = (instance: MockConfig & Record<keyof any, any>, changeDetector: ChangeDetectorRef): void => {
  // Providing method to hide any @ContentChild based on its selector.
  coreDefineProperty(instance, '__hide', (contentChildSelector: string | [string, ...number[]]) => {
    const [type, , selector, indices] = getKey(contentChildSelector);

    if (!instance[`ngMocksRender_${type}_${selector}`]) {
      return;
    }
    mixHideHandler(instance, type, selector, indices);

    if (!indices) {
      instance[`ngMocksRender_${type}_${selector}`] = false;
    }
    changeDetector.detectChanges();
  });
};

class ComponentMockBase extends LegacyControlValueAccessor implements AfterContentInit {
  // istanbul ignore next
  public constructor(
    injector: Injector,
    ngControl: any, // NgControl
    changeDetector: ChangeDetectorRef,
  ) {
    super(injector, ngControl);
    if (funcIsMock(this)) {
      mixRender(this, changeDetector);
      mixHide(this, changeDetector);
    }
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

coreDefineProperty(ComponentMockBase, 'parameters', [
  [Injector],
  [coreForm.NgControl || /* istanbul ignore next */ (() => undefined), new Optional(), new Self()],
  [ChangeDetectorRef],
]);

const decorateClass = (component: Type<any>, mock: Type<any>): void => {
  const meta = coreReflectDirectiveResolve(component);
  const template = generateTemplate(meta.queries);
  const mockParams = { exportAs: meta.exportAs, selector: meta.selector, template };
  Component(decorateDeclaration(component, mock, meta, mockParams))(mock);
};

export function MockComponents(...components: Array<Type<any>>): Array<Type<MockedComponent<any>>> {
  return components.map(MockComponent);
}

/**
 * @see https://ng-mocks.sudo.eu/api/MockComponent
 */
export function MockComponent<TComponent>(component: Type<TComponent>): Type<MockedComponent<TComponent>> {
  funcImportExists(component, 'MockComponent');

  if (isMockNgDef(component, 'c')) {
    return component;
  }

  if (ngMocksUniverse.flags.has('cacheComponent') && ngMocksUniverse.cacheDeclarations.has(component)) {
    return ngMocksUniverse.cacheDeclarations.get(component);
  }

  const mock = extendClass(ComponentMockBase);
  decorateClass(component, mock);

  // istanbul ignore else
  if (ngMocksUniverse.flags.has('cacheComponent')) {
    ngMocksUniverse.cacheDeclarations.set(component, mock);
  }

  return mock as any;
}
