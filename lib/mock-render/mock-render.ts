import { Component, EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { Type } from '../common/core.types';
import { ngMocks } from '../mock-helper/mock-helper';
import helperMockService from '../mock-service/helper.mock-service';

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

const createProperty = (pointComponentInstance: Record<keyof any, any>, key: string) => {
  const def = helperMockService.extractPropertyDescriptor(Object.getPrototypeOf(pointComponentInstance), key);
  const keyType = def ? undefined : typeof pointComponentInstance[key];

  return def?.value || keyType === 'function'
    ? {
        value: (...args: any[]) => pointComponentInstance[key](...args),
      }
    : {
        get: () => pointComponentInstance[key],
        set: (v: any) => (pointComponentInstance[key] = v),
      };
};

const extractAllKeys = (instance: object) => [
  ...helperMockService.extractPropertiesFromPrototype(Object.getPrototypeOf(instance)),
  ...helperMockService.extractMethodsFromPrototype(Object.getPrototypeOf(instance)),
  ...Object.keys(instance),
];

const extractOwnKeys = (instance: object) => [...Object.getOwnPropertyNames(instance), ...Object.keys(instance)];

const installProxy = (componentInstance: Record<keyof any, any>, pointComponentInstance: Record<keyof any, any>) => {
  const exists = extractOwnKeys(componentInstance);

  for (const key of extractAllKeys(pointComponentInstance)) {
    if (exists.indexOf(key) !== -1) {
      continue;
    }

    defineProperty(componentInstance, key, createProperty(pointComponentInstance, key));

    exists.push(key);
  }
};

const generateTemplateAttr = (params: any, attr: any, type: 'i' | 'o') => {
  let mockTemplate = '';

  const wrap = (prop: string) => (type === 'i' ? `[${prop}]` : `(${prop})`);

  for (const definition of attr) {
    const [property, alias] = definition.split(': ');
    // istanbul ignore else
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
      for (const definition of !params && inputs ? inputs : []) {
        const [property] = definition.split(': ');
        (this as any)[property] = undefined;
      }
      for (const definition of !params && outputs ? outputs : []) {
        const [property] = definition.split(': ');
        (this as any)[property] = new EventEmitter();
      }
    }
  }

  Component(options)(MockRenderComponent);
  ngMocks.flushTestBed();
  TestBed.configureTestingModule({
    declarations: [MockRenderComponent],
  });

  return TestBed.createComponent(MockRenderComponent);
};

const tryWhen = (flag: boolean, callback: () => void) => {
  if (!flag) {
    return;
  }

  try {
    // ivy throws Error: Expecting instance of DOM Element
    callback();
  } catch (e) {
    // nothing to do
  }
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
  if (typeof template !== 'string') {
    ({ inputs = undefined, outputs = undefined, selector = undefined } = coreReflectDirectiveResolve(template));
  }

  const mockTemplate = generateTemplate(template, { selector, params, inputs, outputs });
  const options: Component = { providers: flagsObject.providers, selector: 'mock-render', template: mockTemplate };
  const fixture: any = generateFixture({ params, options, inputs, outputs });
  if (flagsObject.detectChanges) {
    fixture.detectChanges();
  }
  fixture.point = fixture.debugElement.children[0] || fixture.debugElement.childNodes[0];
  tryWhen(!params, () => installProxy(fixture.componentInstance, fixture.point?.componentInstance));

  return fixture;
}

export { MockRender };
