import { Component, DebugElement, Directive, InjectionToken } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

import coreDefineProperty from '../common/core.define-property';
import { Type } from '../common/core.types';
import funcImportExists from '../common/func.import-exists';
import { isNgDef } from '../common/func.is-ng-def';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { ngMocks } from '../mock-helper/mock-helper';
import helperDefinePropertyDescriptor from '../mock-service/helper.define-property-descriptor';
import { MockService } from '../mock-service/mock-service';

import funcGenerateTemplate from './func.generate-template';
import funcInstallPropReader from './func.install-prop-reader';
import funcReflectTemplate from './func.reflect-template';
import { DefaultRenderComponent, IMockRenderOptions, MockedComponentFixture } from './types';

interface MockRenderFactory<C = any, F = DefaultRenderComponent<C>> {
  declaration: Type<never>;
  params: F;
  (): MockedComponentFixture<C, F>;
}

const generateWrapper = ({ params, options, inputs }: any) => {
  class MockRenderComponent {
    public constructor() {
      if (!params) {
        for (const input of inputs || []) {
          let value: any = null;
          helperDefinePropertyDescriptor(this, input, {
            get: () => value,
            set: (newValue: any) => (value = newValue),
          });
        }
      }
      funcInstallPropReader(this, params);
    }
  }

  Component(options)(MockRenderComponent);
  TestBed.configureTestingModule({
    declarations: [MockRenderComponent],
  });

  return MockRenderComponent;
};

const createWrapper = (template: any, meta: Directive, params: any, flags: any): Type<any> => {
  const mockTemplate = funcGenerateTemplate(template, { ...meta, params });
  const options: Component = {
    providers: flags.providers,
    selector: 'mock-render',
    template: mockTemplate,
  };

  return generateWrapper({ ...meta, params, options });
};

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

const handleFixtureError = (e: any) => {
  const message = [
    'Forgot to flush TestBed?',
    'MockRender cannot be used without a reset after TestBed.get / TestBed.inject / TestBed.createComponent and another MockRender in the same test.',
    'To flush TestBed, add a call of ngMocks.flushTestBed() before the call of MockRender, or pass `reset: true` to MockRender options.',
    'If you want to mock a service before rendering, consider usage of MockInstance.',
  ].join(' ');
  const error = new Error(message);
  coreDefineProperty(error, 'parent', e, false);
  throw error;
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
  template: Type<MComponent>,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent, TComponent extends object>(
  template: Type<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, TComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent, TComponent extends object = Record<keyof any, any>>(
  template: Type<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockRenderFactory<MComponent, TComponent>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
function MockRenderFactory<MComponent>(template: Type<MComponent>): MockRenderFactory<MComponent, MComponent>;

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
    const componentCtor: any = createWrapper(template, meta, params, flagsObject);

    return generateFactory(componentCtor, flagsObject, params, template);
  } catch (e) {
    handleFixtureError(e);
  }
}

export { MockRenderFactory };
