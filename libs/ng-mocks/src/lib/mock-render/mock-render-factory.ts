import { DebugElement, Directive, InjectionToken } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

import coreDefineProperty from '../common/core.define-property';
import { AnyDeclaration, AnyType, Type } from '../common/core.types';
import funcImportExists from '../common/func.import-exists';
import { isNgDef } from '../common/func.is-ng-def';
import ngMocksStack from '../common/ng-mocks-stack';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { ngMocks } from '../mock-helper/mock-helper';
import helperDefinePropertyDescriptor from '../mock-service/helper.define-property-descriptor';
import { MockService } from '../mock-service/mock-service';
import funcGetName from '../common/func.get-name';
import { getInjection } from '../common/core.helpers';

import funcCreateWrapper from './func.create-wrapper';
import funcInstallPropReader from './func.install-prop-reader';
import funcReflectTemplate from './func.reflect-template';
import { IMockRenderFactoryOptions, MockedComponentFixture } from './types';

export interface MockRenderFactory<C = any, F extends keyof any = keyof C> {
  bindings: keyof F;
  configureTestBed: () => void;
  declaration: AnyType<never>;
  <T extends Record<F, any>>(params?: Partial<T>, detectChanges?: boolean): MockedComponentFixture<C, T>;
}

const renderDeclaration = (fixture: any, template: any, params: any): void => {
  fixture.point =
    fixture.debugElement.children[0] &&
    fixture.debugElement.children[0].nativeElement.nodeName !== '#text' &&
    fixture.debugElement.children[0].nativeElement.nodeName !== '#comment'
      ? fixture.debugElement.children[0]
      : fixture.debugElement;
  if (isNgDef(template, 'd')) {
    helperDefinePropertyDescriptor(fixture.point, 'componentInstance', {
      get: () => ngMocks.get(fixture.point, template),
    });
  } else if (isNgDef(template, 'p')) {
    helperDefinePropertyDescriptor(fixture.point, 'componentInstance', {
      get: () => ngMocks.findInstance(fixture.point, template),
    });
  }
  tryWhen(!params, () => funcInstallPropReader(fixture.componentInstance, fixture.point.componentInstance, []));
};

const renderInjection = (fixture: any, template: any, params: any): void => {
  let instance: any;
  try {
    instance = getInjection(template);
  } catch (error) {
    if (isNgDef(template, 'p')) {
      throw new Error(
        [
          `Cannot render ${funcGetName(template)}.`,
          'Did you forget to set $implicit param, or add the pipe to providers?',
          'https://ng-mocks.sudo.eu/guides/pipe',
        ].join(' '),
      );
    }
    throw error;
  }
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
  } catch {
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
  coreDefineProperty(error, 'parent', e);
  throw error;
};

const flushTestBed = (flags: Record<string, any>): void => {
  const globalFlags = ngMocksUniverse.global.get('flags');
  const testBed: any = getTestBed();
  if (flags.reset || (!testBed._instantiated && !testBed._testModuleRef)) {
    ngMocks.flushTestBed();
  } else if (globalFlags.onTestBedFlushNeed !== 'throw' && (testBed._instantiated || testBed._testModuleRef)) {
    if (globalFlags.onTestBedFlushNeed === 'warn') {
      console.warn(fixtureMessage);
    }
    ngMocks.flushTestBed();
  }
};

const generateFactoryInstall = (ctor: AnyType<any>, options: IMockRenderFactoryOptions) => () => {
  const testBed: TestBed & {
    _compiler?: {
      declarations?: Array<AnyType<any>>;
    };
    _declarations?: Array<AnyType<any>>;
    declarations?: Array<AnyType<any>>;
  } = getTestBed();
  // istanbul ignore next
  const declarations = testBed._compiler?.declarations || testBed.declarations || testBed._declarations;
  if (!declarations || declarations.indexOf(ctor) === -1) {
    flushTestBed(options);
    try {
      TestBed.configureTestingModule({
        declarations: [ctor],
      });
    } catch (error) {
      handleFixtureError(error);
    }
  }
};

const generateFactory = (
  componentCtor: Type<any> & { tpl?: string },
  bindings: undefined | null | string[],
  template: any,
  options: IMockRenderFactoryOptions,
) => {
  const result = (params: any, detectChanges?: boolean) => {
    result.configureTestBed();
    const fixture: any = TestBed.createComponent(componentCtor);

    funcInstallPropReader(fixture.componentInstance, params ?? {}, bindings ?? []);
    coreDefineProperty(fixture, 'ngMocksStackId', ngMocksUniverse.global.get('bullet:stack:id'));

    if (detectChanges === undefined || detectChanges) {
      fixture.detectChanges();
    }

    if (
      typeof template === 'string' ||
      isNgDef(template, 'c') ||
      isNgDef(template, 'd') ||
      (componentCtor.tpl && isNgDef(template, 'p'))
    ) {
      renderDeclaration(fixture, template, params);
    } else {
      renderInjection(fixture, template, params);
    }

    return fixture;
  };
  result.declaration = componentCtor;
  result.bindings = bindings;
  result.configureTestBed = generateFactoryInstall(componentCtor, options);

  return result;
};

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export function MockRenderFactory<MComponent>(
  template: InjectionToken<MComponent>,
  bindings?: undefined | null,
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, never>;

/**
 * MockRenderFactory is a delayed version of MockRender.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export function MockRenderFactory<MComponent>(
  template: AnyType<MComponent>,
  bindings: undefined | null,
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, keyof MComponent>;

/**
 * MockRenderFactory is a delayed version of MockRender.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export function MockRenderFactory<MComponent, TKeys extends keyof any>(
  template: AnyType<MComponent>,
  bindings: TKeys[],
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, TKeys>;

/**
 * MockRenderFactory is a delayed version of MockRender.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export function MockRenderFactory<MComponent, TKeys extends keyof any = keyof any>(
  template: AnyType<MComponent>,
  bindings: TKeys[],
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, TKeys>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export function MockRenderFactory<MComponent>(
  template: AnyType<MComponent>,
): MockRenderFactory<MComponent, keyof MComponent>;

/**
 * An empty string does not have point.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export function MockRenderFactory(template: ''): MockRenderFactory<void, never>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export function MockRenderFactory<MComponent = void>(template: string): MockRenderFactory<MComponent>;

/**
 * MockRenderFactory is a delayed version of MockRender.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export function MockRenderFactory<MComponent = void, TKeys extends keyof any = keyof any>(
  template: string,
  bindings: TKeys[],
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, TKeys>;

export function MockRenderFactory<MComponent, TKeys extends string>(
  template: string | AnyDeclaration<MComponent>,
  bindings?: undefined | null | TKeys[],
  options: IMockRenderFactoryOptions = {},
): any {
  funcImportExists(template, 'MockRender');

  const meta: Directive = typeof template === 'string' || isNgDef(template, 't') ? {} : funcReflectTemplate(template);
  const componentCtor: any = funcCreateWrapper(template, meta, bindings, options);
  const factory = generateFactory(componentCtor, bindings, template, options);
  if (ngMocksStack.current().level !== 'root' && options.configureTestBed !== false) {
    factory.configureTestBed();
  }

  return factory;
}
