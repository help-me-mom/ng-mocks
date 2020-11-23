import { Component, EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { directiveResolver } from '../common/core.reflect';
import { Type } from '../common/core.types';
import { ngMocks } from '../mock-helper/mock-helper';
import mockServiceHelper from '../mock-service/helper';

import { IMockRenderOptions, MockedComponentFixture } from './types';

const solveOutput = (output: any): string => {
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
};

const defineProperty = (componentInstance: any, key: string, params: any) => {
  Object.defineProperty(componentInstance, key, {
    ...params,
    configurable: true,
    enumerable: true,
    ...(params.value ? { writable: true } : {}),
  });
};

const extractAllKeys = (instance: object) => [
  ...mockServiceHelper.extractPropertiesFromPrototype(Object.getPrototypeOf(instance)),
  ...mockServiceHelper.extractMethodsFromPrototype(Object.getPrototypeOf(instance)),
  ...Object.keys(instance),
];

const extractOwnKeys = (instance: object) => [...Object.getOwnPropertyNames(instance), ...Object.keys(instance)];

const installProxy = (componentInstance: Record<keyof any, any>, pointComponentInstance: Record<keyof any, any>) => {
  const keys = extractAllKeys(pointComponentInstance);
  const exists = extractOwnKeys(componentInstance);

  for (const key of keys) {
    if (exists.indexOf(key) !== -1) {
      continue;
    }

    const def = mockServiceHelper.extractPropertyDescriptor(Object.getPrototypeOf(pointComponentInstance), key);
    const keyType = def ? undefined : typeof pointComponentInstance[key];

    defineProperty(
      componentInstance,
      key,
      def?.value || keyType === 'function'
        ? {
            value: (...args: any[]) => pointComponentInstance[key](...args),
          }
        : {
            get: () => pointComponentInstance[key],
            set: (v: any) => (pointComponentInstance[key] = v),
          },
    );

    exists.push(key);
  }
};

const generateTemplateAttr = (params: any, attr: any, type: 'i' | 'o') => {
  let mockTemplate = '';

  const wrap = (prop: string) => (type === 'i' ? `[${prop}]` : `(${prop})`);

  for (const definition of attr) {
    const [property, alias] = definition.split(': ');
    /* istanbul ignore else */
    if (alias && params) {
      mockTemplate += ` ${wrap(alias)}="${alias}${type === 'o' ? solveOutput(params[alias]) : ''}"`;
    } else if (property && params) {
      mockTemplate += ` ${wrap(property)}="${property}${type === 'o' ? solveOutput(params[property]) : ''}"`;
    } else if (alias && !params) {
      mockTemplate += ` ${wrap(alias)}="${property}${type === 'o' ? '.emit($event)' : ''}"`;
    } else if (!params) {
      mockTemplate += ` ${wrap(property)}="${property}${type === 'o' ? '.emit($event)' : ''}"`;
    }
  }

  return mockTemplate;
};

const generateTemplate = (declaration: any, { selector, params, inputs, outputs }: any): string => {
  let mockTemplate = '';

  if (typeof declaration === 'string') {
    mockTemplate = declaration;
  } else if (selector) {
    mockTemplate += `<${selector}`;
    mockTemplate += generateTemplateAttr(params, inputs, 'i');
    mockTemplate += generateTemplateAttr(params, outputs, 'o');
    mockTemplate += `></${selector}>`;
  }

  return mockTemplate;
};

const generateFixture = ({ params, options, inputs, outputs }: any) => {
  class MockRenderComponent {
    public constructor() {
      for (const key of Object.keys(params || {})) {
        (this as any)[key] = params[key];
      }
      if (!params && inputs) {
        for (const definition of inputs) {
          const [property] = definition.split(': ');
          (this as any)[property] = undefined;
        }
      }
      if (!params && outputs) {
        for (const definition of outputs) {
          const [property] = definition.split(': ');
          (this as any)[property] = new EventEmitter();
        }
      }
    }
  }

  Component(options)(MockRenderComponent);

  // Soft reset of TestBed.
  ngMocks.flushTestBed();

  // Injection of our template.
  TestBed.configureTestingModule({
    declarations: [MockRenderComponent],
  });

  return TestBed.createComponent(MockRenderComponent);
};

/**
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent, TComponent extends Record<keyof any, any>>(
  template: Type<MComponent>,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * Without params we shouldn't autocomplete any keys of any types.
 *
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent extends Record<keyof any, any>>(
  template: Type<MComponent>,
): MockedComponentFixture<MComponent>;

/**
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent = any, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions,
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
  flags: boolean | IMockRenderOptions = true,
): MockedComponentFixture<MComponent, TComponent> {
  const flagsObject: IMockRenderOptions = typeof flags === 'boolean' ? { detectChanges: flags } : flags;

  let inputs: string[] | undefined;
  let outputs: string[] | undefined;
  let selector: string | undefined;
  try {
    const meta = typeof template !== 'string' ? directiveResolver.resolve(template) : {};
    inputs = meta.inputs;
    outputs = meta.outputs;
    selector = meta.selector;
  } catch (e) {
    /* istanbul ignore next */
    throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
  }

  const mockTemplate = generateTemplate(template, { selector, params, inputs, outputs });

  const options: Component = {
    providers: flagsObject.providers,
    selector: 'mock-render',
    template: mockTemplate,
  };

  const fixture: any = generateFixture({ params, options, inputs, outputs });
  if (flagsObject.detectChanges) {
    fixture.detectChanges();
  }
  fixture.point = fixture.debugElement.children[0] || fixture.debugElement.childNodes[0];

  if (!params) {
    try {
      // ivy throws Error: Expecting instance of DOM Element
      installProxy(fixture.componentInstance, fixture.point?.componentInstance);
    } catch (e) {
      // nothing to do
    }
  }

  return fixture;
}

export { MockRender };
