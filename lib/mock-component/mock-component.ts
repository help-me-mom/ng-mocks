import { core } from '@angular/compiler';
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Query,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { getMockedNgDefOf, MockControlValueAccessor, MockOf, Type } from '../common';
import { decorateInputs, decorateOutputs, decorateQueries } from '../common/decorate';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { directiveResolver } from '../common/reflect';

export type MockedComponent<T> = T &
  MockControlValueAccessor & {
    /** Helper function to hide rendered @ContentChild() template. */
    __hide(contentChildSelector: string): void;

    /** Helper function to render any @ContentChild() template with any context. */
    __render(contentChildSelector: string, $implicit?: any, variables?: { [key: string]: any }): void;
  };

export function MockComponents(...components: Array<Type<any>>): Array<Type<MockedComponent<any>>> {
  return components.map(component => MockComponent(component, undefined));
}

export function MockComponent<TComponent>(
  component: Type<TComponent>,
  metaData?: core.Directive
): Type<MockedComponent<TComponent>> {
  // we are inside of an 'it'.
  // It's fine to to return a mock or to throw an exception if it wasn't mocked in TestBed.
  if ((getTestBed() as any)._instantiated) {
    try {
      return getMockedNgDefOf(component, 'c');
    } catch (error) {
      // looks like an in-test mock.
    }
  }
  if (ngMocksUniverse.flags.has('cacheComponent') && ngMocksUniverse.cache.has(component)) {
    return ngMocksUniverse.cache.get(component);
  }

  let meta: core.Directive | undefined = metaData;
  if (!meta) {
    try {
      meta = directiveResolver.resolve(component);
    } catch (e) {
      throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
    }
  }
  const { exportAs, inputs, outputs, queries, selector } = meta;

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
          static: false,
        } as any);
        return `
          <div *ngIf="mockRender_${query.selector}" data-key="${query.selector}">
            <ng-template #__${query.selector}></ng-template>
          </div>
        `;
      })
      .join('');
    if (templateQueries) {
      template = `
        ${template}
        ${templateQueries}
      `;
    }
  }

  const options: Component = {
    exportAs,
    providers: [
      {
        multi: true,
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ComponentMock),
      },
      {
        provide: component,
        useExisting: forwardRef(() => ComponentMock),
      },
    ],
    selector,
    template,
  };

  const config = ngMocksUniverse.config.get(component);

  @MockOf(component, outputs)
  class ComponentMock extends MockControlValueAccessor implements AfterContentInit {
    constructor(changeDetector: ChangeDetectorRef) {
      super();

      // Providing method to hide any @ContentChild based on its selector.
      (this as any).__hide = (contentChildSelector: string) => {
        const key = viewChildRefs.get(contentChildSelector);
        if (key) {
          (this as any)[`mockRender_${contentChildSelector}`] = false;
          changeDetector.detectChanges();
        }
      };

      // Providing a method to render any @ContentChild based on its selector.
      (this as any).__render = (contentChildSelector: string, $implicit?: any, variables?: { [key: string]: any }) => {
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
            viewContainer.createEmbeddedView(templateRef, { ...variables, $implicit } as any);
            changeDetector.detectChanges();
          }
        }
      };
    }

    ngAfterContentInit(): void {
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

  decorateInputs(ComponentMock, inputs);
  decorateOutputs(ComponentMock, outputs);
  decorateQueries(ComponentMock, queries);

  const mockedComponent: Type<MockedComponent<TComponent>> = Component(options)(ComponentMock as any);
  if (ngMocksUniverse.flags.has('cacheComponent')) {
    ngMocksUniverse.cache.set(component, mockedComponent);
  }

  return mockedComponent;
}
