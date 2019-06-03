import { core } from '@angular/compiler';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Query,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MockOf } from '../common';
import { directiveResolver } from '../common/reflect';

const cache = new Map<Type<Component>, Type<Component>>();

export type MockedComponent<T> = T & {
  /** Helper function to hide rendered @ContentChild() template. */
  __hide(contentChildSelector: string): void;

  /** Helper function to render any @ContentChild() template with any context. */
  __render(contentChildSelector: string, $implicit?: any, variables?: {[key: string]: any}): void;

  __simulateChange(value: any): void;
  __simulateTouch(): void;
};

export function MockComponents(...components: Array<Type<any>>): Array<Type<any>> {
  return components.map((component) => MockComponent(component, undefined));
}

export function MockComponent<TComponent>(component: Type<TComponent>, metaData?: core.Directive): Type<TComponent> {
  const cacheHit = cache.get(component);
  if (cacheHit) {
    return cacheHit as Type<TComponent>;
  }

  const { exportAs, inputs, outputs, queries, selector } = metaData || directiveResolver.resolve(component);

  let template = `<ng-content></ng-content>`;
  const viewChildRefs = new Map<string, string>();
  if (queries) {
    const queriesKeys = Object.keys(queries);
    const templateQueries = queriesKeys
      .map((key: string) => {
        const query: Query = queries[key];
        if (query.isViewQuery) {
          return ''; // ignoring all internal @ViewChild.
        }
        if (typeof query.selector !== 'string') {
          return ''; // in case of mocked component, Type based selector doesn't work properly anyway.
        }
        viewChildRefs.set(query.selector, key);
        queries[`__mockView_${key}`] = new ViewChild(`__${query.selector}`, {
          read: ViewContainerRef,
          static: query.static
        });
        return `
          <div *ngIf="mockRender_${query.selector}" data-key="${query.selector}">
            <ng-template #__${query.selector}></ng-template>
          </div>
        `;
      }).join('');
    if (templateQueries) {
      template = `
        ${template}
        ${templateQueries}
      `;
    }
  }

  const options: Component = {
    exportAs,
    inputs,
    outputs,
    providers: [{
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComponentMock)
    },
    {
      provide: component,
      useExisting: forwardRef(() => ComponentMock)
    }],
    queries,
    selector,
    template,
  };

  @MockOf(component)
  class ComponentMock implements ControlValueAccessor {
    constructor(changeDetector: ChangeDetectorRef) {
      Object.keys(component.prototype).forEach((method) => {
        if (!(this as any)[method]) {
          (this as any)[method] = () => {};
        }
      });

      (options.outputs || []).forEach((output) => {
        (this as any)[output.split(':')[0]] = new EventEmitter<any>();
      });

      // Providing method to hide any @ContentChild based on its selector.
      (this as any).__hide = (contentChildSelector: string) => {
        const key = viewChildRefs.get(contentChildSelector);
        if (key) {
          (this as any)[`mockRender_${contentChildSelector}`] = false;
          changeDetector.detectChanges();
        }
      };

      // Providing a method to render any @ContentChild based on its selector.
      (this as any).__render = (contentChildSelector: string, $implicit?: any, variables?: {[key: string]: any}) => {
        const key = viewChildRefs.get(contentChildSelector);
        let templateRef: TemplateRef<any>;
        let viewContainer: ViewContainerRef;
        if (key) {
          (this as any)[`mockRender_${contentChildSelector}`] = true;
          changeDetector.detectChanges();
          viewContainer = (this as any)[`__mockView_${key}`];
          templateRef = (this as any)[key];
          if (viewContainer && templateRef) {
            viewContainer.clear();
            viewContainer.createEmbeddedView(templateRef, {...variables, $implicit} as any);
          }
        }
      };
    }

    __simulateChange = (param: any) => {}; // tslint:disable-line:variable-name
    __simulateTouch = () => {}; // tslint:disable-line:variable-name

    registerOnChange(fn: (value: any) => void): void {
      this.__simulateChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.__simulateTouch = fn;
    }

    writeValue = (value: any) => {};
  }

  // tslint:disable-next-line:no-angle-bracket-type-assertion
  const mockedComponent = Component(options)(<any> ComponentMock as Type<TComponent>);

  cache.set(component, mockedComponent);

  return mockedComponent;
}
