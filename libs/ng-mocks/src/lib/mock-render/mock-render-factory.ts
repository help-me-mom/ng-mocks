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
import { DefaultRenderComponent, IMockRenderOptions, MockedComponentFixture } from './types';

interface MockRenderFactory<C = any, F = DefaultRenderComponent<C>> {
  declaration: AnyType<never>;
  params: F;
  (): MockedComponentFixture<C, F>;
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

const fixtureMessage = [
  'Forgot to flush TestBed?',
  'MockRender cannot be used without a reset after TestBed.get / TestBed.inject / TestBed.createComponent and another MockRender in the same test.',
  'To flush TestBed, add a call of ngMocks.flushTestBed() before the call of MockRender, or pass `reset: true` to MockRender options.',
  'If you want to mock a service before rendering, consider usage of MockInstance.',
].join(' ');

const handleFixtureError = (e: any) => {
  const error = new Error(fixtureMessage);
  coreDefineProperty(error, 'parent', e, false);
  throw error;
};

const globalFlags = ngMocksUniverse.global.get('flags') || /* istanbul ignore next */ {};
// istanbul ignore else
if (globalFlags.onTestBedFlushNeed === undefined) {
  globalFlags.onTestBedFlushNeed = 'throw';
}
ngMocksUniverse.global.set('flags', globalFlags);
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

const generateFactory = (componentCtor: Type<any>, flags: any, params: any, template: any) => {
  const result = () => {
    const fixture: any = TestBed.createComponent(componentCtor);
    coreDefineProperty(fixture, 'ngMocksStackId', ngMocksUniverse.global.get('reporter-stack-id'));

    if (flags.detectChanges === undefined || flags.detectChanges) {
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
  result.params = params;

  return result;
};

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent>(
  template: InjectionToken<MComponent>,
  params?: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, void>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent>(
  template: AnyType<MComponent>,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent, TComponent extends object>(
  template: AnyType<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, TComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent, TComponent extends object = Record<keyof any, any>>(
  template: AnyType<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, TComponent>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent>(template: AnyType<MComponent>): MockRenderFactory<MComponent, MComponent>;

/**
 * An empty string does not have point.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory(template: ''): MockRenderFactory<void, undefined>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent = void>(template: string): MockRenderFactory<MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent = void>(
  template: string,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, void>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent = void, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, TComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, TComponent>;

function MockRenderFactory<MComponent, TComponent extends Record<keyof any, any>>(
  template: string | AnyType<MComponent> | InjectionToken<MComponent>,
  params?: TComponent,
  flags: boolean | IMockRenderOptions = true,
): any {
  funcImportExists(template, 'MockRender');

  const flagsObject: IMockRenderOptions = typeof flags === 'boolean' ? { detectChanges: flags } : { ...flags };
  const meta: Directive = typeof template === 'string' || isNgDef(template, 't') ? {} : funcReflectTemplate(template);

  flushTestBed(flagsObject);
  try {
    const componentCtor: any = funcCreateWrapper(template, meta, params, flagsObject);

    return generateFactory(componentCtor, flagsObject, params, template);
  } catch (e) {
    handleFixtureError(e);
  }
}

export { MockRenderFactory };
