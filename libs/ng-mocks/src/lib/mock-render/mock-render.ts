import { Component, DebugElement, Directive, InjectionToken } from '@angular/core';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import coreDefineProperty from '../common/core.define-property';
import { Type } from '../common/core.types';
import funcImportExists from '../common/func.import-exists';
import { isNgDef } from '../common/func.is-ng-def';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { ngMocks } from '../mock-helper/mock-helper';
import { MockService } from '../mock-service/mock-service';

import funcGenerateTemplate from './func.generate-template';
import funcInstallPropReader from './func.install-prop-reader';
import funcReflectTemplate from './func.reflect-template';
import { IMockRenderOptions, MockedComponentFixture } from './types';

const generateFixture = ({ params, options }: any) => {
  class MockRenderComponent {
    public constructor() {
      funcInstallPropReader(this, params);
    }
  }

  Component(options)(MockRenderComponent);
  TestBed.configureTestingModule({
    declarations: [MockRenderComponent],
  });

  const fixture = TestBed.createComponent(MockRenderComponent);
  coreDefineProperty(fixture, 'ngMocksStackId', ngMocksUniverse.global.get('reporter-stack-id'));

  return fixture;
};

const fixtureFactory = <T>(template: any, meta: Directive, params: any, flags: any): ComponentFixture<T> => {
  const mockTemplate = funcGenerateTemplate(template, { ...meta, params });
  const options: Component = {
    providers: flags.providers,
    selector: 'mock-render',
    template: mockTemplate,
  };
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
      enumerable: true,
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

const handleFixtureError = (e: any) => {
  if (
    e &&
    typeof e === 'object' &&
    typeof e.message === 'string' &&
    e.message.startsWith('Cannot configure the test module')
  ) {
    const message = [
      'Forgot to flush TestBed?',
      'MockRender cannot be used without a reset after TestBed.get / TestBed.inject / TestBed.createComponent and another MockRender in the same test.',
      'To flush TestBed, add a call of ngMocks.flushTestBed() before the call of MockRender, or pass `reset: true` to MockRender options.',
      'If you want to mock a service before rendering, consider usage of MockInstance.',
    ].join(' ');
    const error = new Error(message);
    coreDefineProperty(error, 'parent', e, false);
    throw error;
  }
  throw e;
};

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent>(
  template: InjectionToken<MComponent>,
  params?: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, void>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent>(
  template: Type<MComponent>,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent, TComponent extends object>(
  template: Type<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent, TComponent extends object = Record<keyof any, any>>(
  template: Type<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent>(template: Type<MComponent>): MockedComponentFixture<MComponent, MComponent>;

/**
 * An empty string does not have point.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender(template: ''): ComponentFixture<void> & { point: undefined };

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent = void>(template: string): MockedComponentFixture<MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent = void>(
  template: string,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, void>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent = void, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

function MockRender<MComponent, TComponent extends Record<keyof any, any>>(
  template: string | Type<MComponent> | InjectionToken<MComponent>,
  params?: TComponent,
  flags: boolean | IMockRenderOptions = true,
): any {
  funcImportExists(template, 'MockRender');

  const flagsObject: IMockRenderOptions = typeof flags === 'boolean' ? { detectChanges: flags } : { ...flags };
  const meta: Directive = typeof template === 'string' || isNgDef(template, 't') ? {} : funcReflectTemplate(template);

  const testBed: any = getTestBed();
  if (flagsObject.reset || (!testBed._instantiated && !testBed._testModuleRef)) {
    ngMocks.flushTestBed();
  }
  try {
    const fixture: any = fixtureFactory(template, meta, params, flagsObject);
    if (isExpectedRender(template)) {
      renderDeclaration(fixture, template, params);
    } else {
      renderInjection(fixture, template, params);
    }

    return fixture;
  } catch (e) {
    handleFixtureError(e);
  }
}

export { MockRender };
