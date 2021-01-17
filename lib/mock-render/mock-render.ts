import { Component, DebugElement, Directive, EventEmitter, InjectionToken } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { extendClass } from '../common/core.helpers';
import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { AnyType, Type } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';
import { ngMocks } from '../mock-helper/mock-helper';
import { MockService } from '../mock-service/mock-service';

import funcGenerateTemplate from './func.generate-template';
import funcInstallPropReader from './func.install-prop-reader';
import { IMockRenderOptions, MockedComponentFixture } from './types';

const applyParamsToFixtureInstanceGetData = (params: any, keys: string[]) => (!params && keys ? keys : []);

const applyParamsToFixtureInstance = (
  instance: Record<keyof any, any>,
  params: any,
  inputs: string[],
  outputs: string[],
): void => {
  funcInstallPropReader(instance, params);
  for (const definition of applyParamsToFixtureInstanceGetData(params, inputs)) {
    const [property] = definition.split(': ');
    instance[property] = undefined;
  }
  for (const definition of applyParamsToFixtureInstanceGetData(params, outputs)) {
    const [property] = definition.split(': ');
    instance[property] = new EventEmitter();
  }
};

const registerTemplateMiddleware = (template: AnyType<any>, meta: Directive): void => {
  const child = extendClass(template);

  let providers = meta.providers || [];
  providers = [
    ...providers,
    {
      provide: template,
      useExisting: child,
    },
  ];
  meta.providers = providers;

  if (isNgDef(template, 'c')) {
    Component(meta)(child);
  } else {
    Directive(meta)(child);
  }
  TestBed.configureTestingModule({
    declarations: [child],
  });
};

const reflectTemplate = (template: AnyType<any>): Directive => {
  if (!isNgDef(template, 'c') && !isNgDef(template, 'd')) {
    return {};
  }

  const meta = { ...coreReflectDirectiveResolve(template) };

  if (meta.selector && meta.selector.match(/[\[\],]/)) {
    meta.selector = '';
  }

  if (!meta.selector) {
    meta.selector = `ng-mocks-${template.name}`;
    registerTemplateMiddleware(template, meta);
  }

  return meta;
};

const generateFixture = ({ params, options, inputs, outputs }: any) => {
  class MockRenderComponent {
    public constructor() {
      applyParamsToFixtureInstance(this, params, inputs, outputs);
    }
  }

  Component(options)(MockRenderComponent);
  TestBed.configureTestingModule({
    declarations: [MockRenderComponent],
  });

  return TestBed.createComponent(MockRenderComponent);
};

const fixtureFactory = <T>(template: any, meta: Directive, params: any, flags: any): ComponentFixture<T> => {
  const mockTemplate = funcGenerateTemplate(template, { ...meta, params });
  const options: Component = { providers: flags.providers, selector: 'mock-render', template: mockTemplate };
  const fixture: any = generateFixture({ ...meta, params, options });
  if (flags.detectChanges) {
    fixture.detectChanges();
  }

  return fixture;
};

const isExpectedRender = (template: any): boolean =>
  typeof template === 'string' || isNgDef(template, 'c') || isNgDef(template, 'd');

const renderDeclaration = (fixture: any, template: any, params: any): void => {
  fixture.point = fixture.debugElement.children[0] || fixture.debugElement.childNodes[0];
  if (isNgDef(template, 'd')) {
    Object.defineProperty(fixture.point, 'componentInstance', {
      configurable: true,
      get: () => ngMocks.get(fixture.point, template),
    });
  }
  tryWhen(!params, () => funcInstallPropReader(fixture.componentInstance, fixture.point?.componentInstance));
};

const renderInjection = (fixture: any, template: any, params: any): void => {
  const instance = TestBed.get(template);
  if (params) {
    ngMocks.stub(instance, params);
  }
  fixture.point = MockService(DebugElement, {
    childNodes: [],
    children: [],
    componentInstance: instance,
    nativeElement: MockService(HTMLElement),
  });
  funcInstallPropReader(fixture.componentInstance, fixture.point.componentInstance, true);
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
  template: InjectionToken<MComponent>,
  params?: undefined,
  detectChanges?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, void>;

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
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender<MComponent>(template: Type<MComponent>): MockedComponentFixture<MComponent, MComponent>;

/**
 * An empty string does not have point.
 *
 * @see https://github.com/ike18t/ng-mocks#mockrender
 */
function MockRender(template: ''): ComponentFixture<void> & { point: undefined };

/**
 * Without params we should not autocomplete any keys of any types.
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
  template: string | Type<MComponent> | InjectionToken<MComponent>,
  params?: TComponent,
  flags: boolean | IMockRenderOptions = true,
): any {
  const flagsObject: IMockRenderOptions = typeof flags === 'boolean' ? { detectChanges: flags } : flags;
  const meta: Directive = typeof template === 'string' || isNgDef(template, 't') ? {} : reflectTemplate(template);

  ngMocks.flushTestBed();
  const fixture: any = fixtureFactory(template, meta, params, flagsObject);
  if (isExpectedRender(template)) {
    renderDeclaration(fixture, template, params);
  } else {
    renderInjection(fixture, template, params);
  }

  return fixture;
}

export { MockRender };
