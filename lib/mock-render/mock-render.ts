import { core } from '@angular/compiler';
import { Component, EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { directiveResolver } from '../common/core.reflect';
import { Type } from '../common/core.types';
import { ngMocks } from '../mock-helper/mock-helper';
import mockServiceHelper from '../mock-service/helper';

import { IMockRenderOptions, MockedComponentFixture } from './types';

function solveOutput(output: any): string {
  if (typeof output === 'function') {
    return '($event)';
  }
  if (output && typeof output === 'object' && output instanceof EventEmitter) {
    return '.emit($event)';
  }
  if (output && typeof output === 'object' && output instanceof Subject) {
    return '.next($event)';
  }
  return '=$event';
}

/**
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent, TComponent extends Record<keyof any, any>>(
  template: Type<MComponent>,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions
): MockedComponentFixture<MComponent, TComponent>;

/**
 * Without params we shouldn't autocomplete any keys of any types.
 *
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent extends Record<keyof any, any>>(
  template: Type<MComponent>
): MockedComponentFixture<MComponent>;

/**
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent = any, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions
): MockedComponentFixture<MComponent, TComponent>;

/**
 * Without params we shouldn't autocomplete any keys of any types.
 *
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent = any>(template: string): MockedComponentFixture<MComponent>;

function MockRender<MComponent, TComponent extends Record<keyof any, any>>(
  template: string | Type<MComponent>,
  params?: TComponent,
  flags: boolean | IMockRenderOptions = true
): MockedComponentFixture<MComponent, TComponent> {
  const flagsObject: IMockRenderOptions = typeof flags === 'boolean' ? { detectChanges: flags } : flags;
  const isComponent = typeof template !== 'string';
  const noParams = !params;

  let inputs: string[] | undefined = [];
  let outputs: string[] | undefined = [];
  let selector: string | undefined = '';
  let mockTemplate = '';
  if (typeof template === 'string') {
    mockTemplate = template;
  } else {
    let meta: core.Directive;
    try {
      meta = directiveResolver.resolve(template);
    } catch (e) {
      /* istanbul ignore next */
      throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
    }

    inputs = meta.inputs;
    outputs = meta.outputs;
    selector = meta.selector;

    mockTemplate += selector ? `<${selector}` : '';
    if (selector && inputs) {
      inputs.forEach((definition: string) => {
        const [property, alias] = definition.split(': ');
        /* istanbul ignore else */
        if (alias && params && typeof params[alias]) {
          mockTemplate += ` [${alias}]="${alias}"`;
        } else if (property && params && typeof params[property]) {
          mockTemplate += ` [${property}]="${property}"`;
        } else if (alias && noParams) {
          mockTemplate += ` [${alias}]="${property}"`;
        } else if (noParams) {
          mockTemplate += ` [${property}]="${property}"`;
        }
      });
    }
    if (selector && outputs) {
      outputs.forEach((definition: string) => {
        const [property, alias] = definition.split(': ');
        /* istanbul ignore else */
        if (alias && params && typeof params[alias]) {
          mockTemplate += ` (${alias})="${alias}${solveOutput(params[alias])}"`;
        } else if (property && params && typeof params[property]) {
          mockTemplate += ` (${property})="${property}${solveOutput(params[property])}"`;
        } else if (alias && noParams) {
          mockTemplate += ` (${alias})="${property}.emit($event)"`;
        } else if (noParams) {
          mockTemplate += ` (${property})="${property}.emit($event)"`;
        }
      });
    }
    mockTemplate += selector ? `></${selector}>` : '';
  }
  const options: Component = {
    providers: flagsObject.providers,
    selector: 'mock-render',
    template: mockTemplate,
  };

  const component = Component(options)(
    class MockRenderComponent {
      constructor() {
        for (const key of Object.keys(params || {})) {
          (this as any)[key] = (params as any)[key];
        }
        if (noParams && isComponent && inputs && inputs.length) {
          for (const definition of inputs) {
            const [property] = definition.split(': ');
            (this as any)[property] = undefined;
          }
        }
        if (noParams && isComponent && outputs && outputs.length) {
          for (const definition of outputs) {
            const [property] = definition.split(': ');
            (this as any)[property] = new EventEmitter();
          }
        }
      }
    } as Type<TComponent>
  );

  // Soft reset of TestBed.
  ngMocks.flushTestBed();

  // Injection of our template.
  TestBed.configureTestingModule({
    declarations: [component],
  });

  const fixture: any = TestBed.createComponent(component);

  if (flagsObject.detectChanges) {
    fixture.detectChanges();
  }

  fixture.point = fixture.debugElement.children[0];
  if (!fixture.point) {
    fixture.point = fixture.debugElement.childNodes[0];
  }
  let pointComponentInstance: any;
  try {
    // ivy throws Error: Expecting instance of DOM Element
    pointComponentInstance = fixture.point?.componentInstance;
  } catch (e) {
    // nothing to do
  }
  if (noParams && pointComponentInstance) {
    const keys = [
      ...mockServiceHelper.extractPropertiesFromPrototype(Object.getPrototypeOf(pointComponentInstance)),
      ...mockServiceHelper.extractMethodsFromPrototype(Object.getPrototypeOf(pointComponentInstance)),
      ...Object.keys(pointComponentInstance),
    ];
    const exists = [
      ...Object.getOwnPropertyNames(fixture.componentInstance),
      ...Object.keys(fixture.componentInstance),
    ];
    for (const key of keys) {
      if (exists.indexOf(key) !== -1) {
        continue;
      }
      const def = mockServiceHelper.extractPropertyDescriptor(Object.getPrototypeOf(pointComponentInstance), key);
      const keyType = def ? undefined : typeof pointComponentInstance[key];
      if (def?.value || keyType === 'function') {
        Object.defineProperty(fixture.componentInstance, key, {
          value: (...args: any[]) => pointComponentInstance[key](...args),

          configurable: true,
          enumerable: true,
          writable: true,
        });
      } else {
        Object.defineProperty(fixture.componentInstance, key, {
          get: () => pointComponentInstance[key],
          set: (v: any) => (pointComponentInstance[key] = v),

          configurable: true,
          enumerable: true,
        });
      }
      exists.push(key);
    }
  }

  return fixture;
}

export { MockRender };
