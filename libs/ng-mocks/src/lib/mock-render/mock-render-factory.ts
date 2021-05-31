import { DebugElement, Directive, InjectionToken } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

import coreDefineProperty from '../common/core.define-property';
import { AnyType, Type } from '../common/core.types';
import funcImportExists from '../common/func.import-exists';
import { isNgDef } from '../common/func.is-ng-def';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { ngMocks } from '../mock-helper/mock-helper';
import helperDefinePropertyDescriptor from '../mock-service/helper.define-property-descriptor';
import { MockService } from '../mock-service/mock-service';

import funcCreateWrapper from './func.create-wrapper';
import funcInstallPropReader from './func.install-prop-reader';
import funcReflectTemplate from './func.reflect-template';
import { IMockRenderOptions, MockedComponentFixture } from './types';

interface MockRenderFactory<C = any, F extends keyof any = keyof C> {
  bindings: keyof F;
  declaration: AnyType<never>;
  <T extends Record<F, any>>(params?: Partial<T>, detectChanges?: boolean): MockedComponentFixture<C, T>;
}

const isExpectedRender = (template: any): boolean =>
  typeof template === 'string' || isNgDef(template, 'c') || isNgDef(template, 'd');

const renderDeclaration = (fixture: any, template: any, params: any): void => {
  fixture.point = fixture.debugElement.children[0] || fixture.debugElement.childNodes[0];
  if (isNgDef(template, 'd')) {
    helperDefinePropertyDescriptor(fixture.point, 'componentInstance', {
      get: () => ngMocks.get(fixture.point, template),
    });
  }
  tryWhen(!params, () => funcInstallPropReader(fixture.componentInstance, fixture.point?.componentInstance, []));
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
  funcInstallPropReader(fixture.componentInstance, fixture.point.componentInstance, [], true);
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

const fixtureMessage = [
  'Forgot to flush TestBed?',
  'MockRender cannot be used without a reset after TestBed.get / TestBed.inject / TestBed.createComponent and another MockRender in the same test.',
  'If you want to mock a service before rendering, consider usage of MockRenderFactory or MockInstance.',
  'To flush TestBed, add a call of ngMocks.flushTestBed() before the call of MockRender, or pass `reset: true` to MockRender options.',
].join(' ');

const handleFixtureError = (e: any) => {
  const error = new Error(fixtureMessage);
  coreDefineProperty(error, 'parent', e, false);
  throw error;
};

const globalFlags = ngMocksUniverse.global.get('flags');
const flushTestBed = (flags: Record<string, any>): void => {
  const testBed: any = getTestBed();
  if (flags.reset || (!testBed._instantiated && !testBed._testModuleRef)) {
    ngMocks.flushTestBed();
  } else if (globalFlags.onTestBedFlushNeed !== 'throw' && (testBed._testModuleRef || testBed._instantiated)) {
    if (globalFlags.onTestBedFlushNeed === 'warn') {
      // tslint:disable-next-line:no-console
      console.warn(fixtureMessage);
    }
    ngMocks.flushTestBed();
  }
};

const generateFactory = (componentCtor: Type<any>, bindings: undefined | null | string[], template: any) => {
  const result = (params: any, detectChanges?: boolean) => {
    const fixture: any = TestBed.createComponent(componentCtor);

    funcInstallPropReader(fixture.componentInstance, params ?? {}, bindings ?? []);
    coreDefineProperty(fixture, 'ngMocksStackId', ngMocksUniverse.global.get('reporter-stack-id'));

    if (detectChanges === undefined || detectChanges) {
      fixture.detectChanges();
    }

    if (isExpectedRender(template)) {
      renderDeclaration(fixture, template, params);
    } else {
      renderInjection(fixture, template, params);
    }

    return fixture;
  };
  result.declaration = componentCtor;
  result.bindings = bindings;

  return result;
};

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent>(
  template: InjectionToken<MComponent>,
  bindings?: undefined | null,
  options?: IMockRenderOptions,
): MockRenderFactory<MComponent, never>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent>(
  template: AnyType<MComponent>,
  bindings: undefined | null,
  options?: IMockRenderOptions,
): MockRenderFactory<MComponent, keyof MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent, TKeys extends keyof any>(
  template: AnyType<MComponent>,
  bindings: TKeys[],
  options?: IMockRenderOptions,
): MockRenderFactory<MComponent, TKeys>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent, TKeys extends keyof any = keyof any>(
  template: AnyType<MComponent>,
  bindings: TKeys,
  options?: IMockRenderOptions,
): MockRenderFactory<MComponent, TKeys>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent>(template: AnyType<MComponent>): MockRenderFactory<MComponent, keyof MComponent>;

/**
 * An empty string does not have point.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory(template: ''): MockRenderFactory<void, never>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent = void>(template: string): MockRenderFactory<MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent = void, TKeys extends keyof any = keyof any>(
  template: string,
  bindings?: undefined | null,
  options?: IMockRenderOptions,
): MockRenderFactory<MComponent, TKeys>;

function MockRenderFactory<MComponent, TKeys extends string>(
  template: string | AnyType<MComponent> | InjectionToken<MComponent>,
  bindings?: undefined | null | TKeys[],
  options: IMockRenderOptions = {},
): any {
  funcImportExists(template, 'MockRender');

  const meta: Directive = typeof template === 'string' || isNgDef(template, 't') ? {} : funcReflectTemplate(template);

  flushTestBed(options);
  try {
    const componentCtor: any = funcCreateWrapper(template, meta, bindings, options);

    return generateFactory(componentCtor, bindings, template);
  } catch (e) {
    handleFixtureError(e);
  }
}

export { MockRenderFactory };
