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

const createProperty = (pointComponentInstance: Record<keyof any, any>, key: string) => {
  return {
    get: () => {
      if (typeof pointComponentInstance[key] === 'function') {
        return (...args: any[]) => pointComponentInstance[key](...args);
      }

      return pointComponentInstance[key];
    },
    set: (v: any) => (pointComponentInstance[key] = v),
  };
};

const extractAllKeys = (instance: object) => [
  ...helperMockService.extractPropertiesFromPrototype(Object.getPrototypeOf(instance)),
  ...helperMockService.extractMethodsFromPrototype(Object.getPrototypeOf(instance)),
  ...Object.keys(instance),
];

const extractOwnKeys = (instance: object) => [...Object.getOwnPropertyNames(instance), ...Object.keys(instance)];

const installProxy = (
  componentInstance: Record<keyof any, any>,
  pointComponentInstance?: Record<keyof any, any>,
): void => {
  if (!pointComponentInstance) {
    return;
  }

  const exists = extractOwnKeys(componentInstance);
  for (const key of extractAllKeys(pointComponentInstance)) {
    if (exists.indexOf(key) !== -1) {
      continue;
    }

    Object.defineProperty(componentInstance, key, createProperty(pointComponentInstance, key));
    exists.push(key);
  }
};

const generateTemplateAttrWrap = (prop: string, type: 'i' | 'o') => (type === 'i' ? `[${prop}]` : `(${prop})`);

const generateTemplateAttrWithParams = (params: any, prop: string, type: 'i' | 'o'): string =>
  ` ${generateTemplateAttrWrap(prop, type)}="${prop}${type === 'o' ? solveOutput(params[prop]) : ''}"`;

const generateTemplateAttrWithoutParams = (key: string, value: string, type: 'i' | 'o'): string =>
  ` ${generateTemplateAttrWrap(key, type)}="${value}${type === 'o' ? '.emit($event)' : ''}"`;

const generateTemplateAttr = (params: any, attr: any, type: 'i' | 'o') => {
  let mockTemplate = '';
  for (const definition of attr) {
    const [property, alias] = definition.split(': ');
    mockTemplate += params
      ? generateTemplateAttrWithParams(params, alias || property, type)
      : generateTemplateAttrWithoutParams(alias || property, property, type);
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

const applyParamsToFixtureInstanceGetData = (params: any, keys: string[]) => (!params && keys ? keys : []);

const applyParamsToFixtureInstance = (
  instance: Record<keyof any, any>,
  params: any,
  inputs: string[],
  outputs: string[],
): void => {
  installProxy(instance, params);
  for (const definition of applyParamsToFixtureInstanceGetData(params, inputs)) {
    const [property] = definition.split(': ');
    instance[property] = undefined;
  }
  for (const definition of applyParamsToFixtureInstanceGetData(params, outputs)) {
    const [property] = definition.split(': ');
    instance[property] = new EventEmitter();
  }
};

const generateFixture = ({ params, options, inputs, outputs }: any) => {
  class MockRenderComponent {
    public constructor() {
      applyParamsToFixtureInstance(this, params, inputs, outputs);
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
function MockRender<MComponent>(
  template: Type<MComponent>,
  params: undefined,
  detectChanges?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, MComponent>;

/**
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent, TComponent extends object>(
  template: Type<MComponent>,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent, TComponent extends object = Record<keyof any, any>>(
  template: Type<MComponent>,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * Without params we shouldn't autocomplete any keys of any types.
 *
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent>(template: Type<MComponent>): MockedComponentFixture<MComponent, MComponent>;

/**
 * Without params we shouldn't autocomplete any keys of any types.
 *
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent = void>(template: string): MockedComponentFixture<MComponent>;

/**
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent = void>(
  template: string,
  params: Record<keyof any, any>,
  detectChanges?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, Record<keyof any, any>>;

/**
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

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
    ({ inputs, outputs, selector } = coreReflectDirectiveResolve(template));
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
