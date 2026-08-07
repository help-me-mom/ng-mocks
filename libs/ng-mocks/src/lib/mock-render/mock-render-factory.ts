import { ChangeDetectorRef, DebugElement, Directive, InjectionToken, VERSION } from '@angular/core';
import { getTestBed, TestBed, TestModuleMetadata } from '@angular/core/testing';

import coreDefineProperty from '../common/core.define-property';
import { getInjection } from '../common/core.helpers';
import { AnyDeclaration, AnyType, Type } from '../common/core.types';
import funcGetName from '../common/func.get-name';
import funcImportExists from '../common/func.import-exists';
import { isNgDef } from '../common/func.is-ng-def';
import ngMocksStack from '../common/ng-mocks-stack';
import { getTestModuleOptions } from '../common/ng-mocks-test-module-metadata';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { ngMocks } from '../mock-helper/mock-helper';
import helperDefinePropertyDescriptor from '../mock-service/helper.define-property-descriptor';
import { MockService } from '../mock-service/mock-service';

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

const installZonelessInputScheduler = (
  fixture: any,
  source: Record<string, any>,
  inputs: string[],
): ((key: string, value: any) => boolean) => {
  const writers = new Map<string, { scheduling: boolean; write: (value: any) => void }>();

  for (const input of inputs) {
    const descriptor = Object.getOwnPropertyDescriptor(source, input);
    if (
      descriptor?.configurable === false ||
      (descriptor && 'value' in descriptor && descriptor.writable === false) ||
      (descriptor && !('value' in descriptor) && !descriptor.set)
    ) {
      continue;
    }

    let value = descriptor && 'value' in descriptor ? descriptor.value : source[input];
    const write = descriptor?.set ? descriptor.set.bind(source) : (newValue: any) => (value = newValue);
    const state = { scheduling: false, write };
    const installed = helperDefinePropertyDescriptor(source, input, {
      enumerable: descriptor?.enumerable ?? true,
      get: descriptor?.get ? descriptor.get.bind(source) : () => value,
      set: (newValue: any) => {
        write(newValue);
        state.scheduling = true;
        try {
          fixture.componentRef.setInput(input, newValue);
        } finally {
          state.scheduling = false;
        }
      },
    });
    if (installed) {
      writers.set(input, state);
    }
  }

  return (key: string, value: any): boolean => {
    const state = writers.get(key);
    if (!state) {
      return false;
    }
    if (!state.scheduling) {
      state.write(value);
    }

    return true;
  };
};

// Angular 22 changed how wrapper fixture checks reach the rendered point, so only
// patch new versions and leave older Angular behavior untouched.
const shouldPatchPointDetectChanges = (major = VERSION.major): boolean => Number.parseInt(major, 10) >= 22;

// Angular 22 reports both implicit OnPush and explicit Eager as Eager in
// decorator annotations. The compiled definition contains the effective
// strategy that MockRender must preserve.
/* istanbul ignore next */
const isOnPush = (fixture: any): boolean => fixture.point?.componentInstance?.constructor?.ɵcmp?.onPush === true;

// Token and plain-text renders do not have a child component CDR. The lookup is
// intentionally best-effort so MockRender keeps supporting every render shape.
// Covered by the Angular 22 e2e suite; root coverage runs on Angular 21.
/* istanbul ignore next */
const getFixturePointChangeDetectorRef = (fixture: any): undefined | ChangeDetectorRef => {
  if (!shouldPatchPointDetectChanges() || !fixture.point || fixture.point === fixture.debugElement) {
    return undefined;
  }
  if (isOnPush(fixture)) {
    return undefined;
  }
  try {
    return fixture.point.injector.get(ChangeDetectorRef);
  } catch {
    return undefined;
  }
};

// After the wrapper has checked its bound params, Angular 22 needs the rendered
// point checked as well so the new values reach nested CVA and component views.
// Covered by the Angular 22 e2e suite; root coverage runs on Angular 21.
/* istanbul ignore next */
const patchFixtureDetectChanges = (fixture: any): void => {
  const detectChanges = fixture.detectChanges.bind(fixture);
  fixture.detectChanges = (checkNoChanges = true) => {
    detectChanges(checkNoChanges);

    const pointCdr = getFixturePointChangeDetectorRef(fixture);
    if (pointCdr) {
      pointCdr.detectChanges();
      if (checkNoChanges) {
        fixture.checkNoChanges();
      }
    }
  };
};

export const patchPointDetectChanges = (fixture: any, major = VERSION.major): void => {
  if (!shouldPatchPointDetectChanges(major)) {
    return;
  }
  // Covered by the Angular 22 e2e suite; root coverage runs on Angular 21.
  /* istanbul ignore next */
  patchFixtureDetectChanges(fixture);
};

const flushTestBed = (flags: Record<string, any>): void => {
  const globalFlags = ngMocksUniverse.global.get('flags');
  const testBed: any = getTestBed();
  // TestBed.get / inject can now intentionally seed mocked declaration instances, so MockRender keeps
  // warning about stale TestBed state when a previous render or manual createComponent already exists.
  if (flags.reset || (!testBed._instantiated && !testBed._testModuleRef)) {
    ngMocks.flushTestBed();
  } else if (globalFlags.onTestBedFlushNeed !== 'throw' && (testBed._instantiated || testBed._testModuleRef)) {
    if (globalFlags.onTestBedFlushNeed === 'warn') {
      console.warn(fixtureMessage);
    }
    ngMocks.flushTestBed();
  }
};

const generateFactoryInstall =
  (ctor: AnyType<any> & { providers?: AnyType<any> }, options: IMockRenderFactoryOptions) => () => {
    const testBed: TestBed & {
      _compiler?: {
        declarations?: Array<AnyType<any>>;
      };
      _declarations?: Array<AnyType<any>>;
      declarations?: Array<AnyType<any>>;
    } = getTestBed();
    // istanbul ignore next
    const existing = testBed._compiler?.declarations || testBed.declarations || testBed._declarations;
    if (!existing || existing.indexOf(ctor) === -1) {
      flushTestBed(options);
      try {
        const declarations: Array<AnyType<any>> = [];
        if (ctor.providers) {
          declarations.push(ctor.providers);
        }
        declarations.push(ctor);
        const moduleDef: TestModuleMetadata = {
          ...getTestModuleOptions(),
          declarations,
        };
        TestBed.configureTestingModule(moduleDef);
      } catch (error) {
        handleFixtureError(error);
      }
    }
  };

const generateFactory = (
  componentCtor: Type<any> & { inputBindings: string[]; tpl?: string },
  bindings: undefined | null | string[],
  template: any,
  options: IMockRenderFactoryOptions,
) => {
  const result = (params: any, detectChanges?: boolean) => {
    result.configureTestBed();
    const fixture: any = TestBed.createComponent(componentCtor);

    if (fixture.zonelessEnabled) {
      // In zoneless mode Angular routes fixture.detectChanges through ApplicationRef.tick(),
      // which changes follow-up MockRender change detection versus the historical zone-based path.
      // Rebinding detectChanges to ChangeDetectorRef keeps later renders and checkNoChanges behavior
      // aligned with what ng-mocks expects across the supported Angular versions.
      const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
      fixture.detectChanges = (checkNoChanges = true) => {
        cdr.detectChanges();
        if (checkNoChanges) {
          fixture.checkNoChanges();
        }
      };
    }

    const source = params ?? {};
    const inputBindings =
      bindings === undefined || bindings === null
        ? componentCtor.inputBindings
        : componentCtor.inputBindings.filter(input => bindings.indexOf(input) !== -1);
    const writeSource = fixture.zonelessEnabled
      ? installZonelessInputScheduler(fixture, source, inputBindings)
      : undefined;
    funcInstallPropReader(
      fixture.componentInstance,
      source,
      bindings ?? [],
      false,
      componentCtor.inputBindings,
      writeSource,
    );
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

    patchPointDetectChanges(fixture);

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
