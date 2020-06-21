import { core } from '@angular/compiler';
import { Component, DebugElement, DebugNode, EventEmitter, Provider } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { Type } from '../common';
import { directiveResolver } from '../common/reflect';
import { ngMocks } from '../mock-helper';
import { mockServiceHelper } from '../mock-service';

// tslint:disable-next-line:interface-name
export interface MockedDebugNode<T = any> extends DebugNode {
  componentInstance: T;
}

// tslint:disable-next-line:interface-name
export interface MockedDebugElement<T = any> extends DebugElement, MockedDebugNode<T> {
  componentInstance: T;
}

export interface IMockRenderOptions {
  detectChanges?: boolean;
  providers?: Provider[];
}

// tslint:disable-next-line:interface-name
export interface MockedComponentFixture<C = any, F = DefaultRenderComponent<C>> extends ComponentFixture<F> {
  point: MockedDebugElement<C>;
}

// tslint:disable: interface-over-type-literal interface-name
export type DefaultRenderComponent<MComponent extends Record<keyof any, any>> = {
  [K in keyof MComponent]: MComponent[K];
};
// tslint:enable: interface-over-type-literal interface-name

function solveOutput(output: any): string {
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
}

function MockRender<MComponent, TComponent extends { [key: string]: any }>(
  template: Type<MComponent>,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions
): MockedComponentFixture<MComponent, TComponent>;

// without params we shouldn't autocomplete any keys of any types.
function MockRender<MComponent extends Record<keyof any, any>>(
  template: Type<MComponent>
): MockedComponentFixture<MComponent>;

function MockRender<MComponent = any, TComponent extends { [key: string]: any } = { [key: string]: any }>(
  template: string,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions
): MockedComponentFixture<MComponent, TComponent>;

// without params we shouldn't autocomplete any keys of any types.
function MockRender<MComponent = any>(template: string): MockedComponentFixture<MComponent>;

function MockRender<MComponent, TComponent extends { [key: string]: any }>(
  template: string | Type<MComponent>,
  params?: TComponent,
  flags: boolean | IMockRenderOptions = true
): MockedComponentFixture<MComponent, TComponent> {
  const flagsObject: IMockRenderOptions = typeof flags === 'boolean' ? { detectChanges: flags } : flags;
  const isComponent = typeof template !== 'string';
  const noParams = !params;

  let inputs: string[] | undefined = [];
  let outputs: string[] | undefined = [];
  let selector: string | undefined = '';
  let mockedTemplate = '';
  if (typeof template === 'string') {
    mockedTemplate = template;
  } else {
    let meta: core.Directive | undefined;
    if (!meta) {
      try {
        meta = directiveResolver.resolve(template);
      } catch (e) {
        throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
      }
    }

    inputs = meta.inputs;
    outputs = meta.outputs;
    selector = meta.selector;

    mockedTemplate += selector ? `<${selector}` : '';
    if (selector && inputs) {
      inputs.forEach((definition: string) => {
        const [property, alias] = definition.split(': ');
        if (alias && params && typeof params[alias]) {
          mockedTemplate += ` [${alias}]="${alias}"`;
        } else if (property && params && typeof params[property]) {
          mockedTemplate += ` [${property}]="${property}"`;
        } else if (alias && noParams) {
          mockedTemplate += ` [${alias}]="${property}"`;
        } else if (noParams) {
          mockedTemplate += ` [${property}]="${property}"`;
        }
      });
    }
    if (selector && outputs) {
      outputs.forEach((definition: string) => {
        const [property, alias] = definition.split(': ');
        if (alias && params && typeof params[alias]) {
          mockedTemplate += ` (${alias})="${alias}${solveOutput(params[alias])}"`;
        } else if (property && params && typeof params[property]) {
          mockedTemplate += ` (${property})="${property}${solveOutput(params[property])}"`;
        } else if (alias && noParams) {
          mockedTemplate += ` (${alias})="${property}.emit($event)"`;
        } else if (noParams) {
          mockedTemplate += ` (${property})="${property}.emit($event)"`;
        }
      });
    }
    mockedTemplate += selector ? `></${selector}>` : '';
  }
  const options: Component = {
    providers: flagsObject.providers,
    selector: 'mock-render',
    template: mockedTemplate,
  };

  const component = Component(options)(
    class MockRenderComponent {
      constructor() {
        for (const key of Object.keys(params || {})) {
          (this as any)[key] = (params as any)[key];
        }
        if (noParams && isComponent && inputs) {
          for (const definition of inputs) {
            const [property] = definition.split(': ');
            (this as any)[property] = undefined;
          }
        }
        if (noParams && isComponent && outputs) {
          for (const definition of outputs) {
            const [property] = definition.split(': ');
            (this as any)[property] = new EventEmitter();
          }
        }
      }
    } as Type<TComponent>
  );

  // Soft reset of TestBed.
  ngMocks.flushTestBed();

  // Injection of our template.
  TestBed.configureTestingModule({
    declarations: [component],
  });

  const fixture: any = TestBed.createComponent(component);

  if (flagsObject.detectChanges) {
    fixture.detectChanges();
  }

  fixture.point = fixture.debugElement.children[0];
  if (noParams && typeof template === 'function') {
    const properties = mockServiceHelper.extractPropertiesFromPrototype(template.prototype);
    const exists = Object.getOwnPropertyNames(fixture.componentInstance);
    for (const property of properties) {
      if (exists.indexOf(property) !== -1) {
        continue;
      }
      Object.defineProperty(fixture.componentInstance, property, {
        get: () => fixture.point.componentInstance[property],
        set: (v: any) => (fixture.point.componentInstance[property] = v),

        configurable: true,
        enumerable: true,
      });
    }
    const methods = mockServiceHelper.extractMethodsFromPrototype(template.prototype);
    for (const method of methods) {
      if (exists.indexOf(method) !== -1) {
        continue;
      }
      Object.defineProperty(fixture.componentInstance, method, {
        value: (...args: any[]) => fixture.point.componentInstance[method](...args),

        configurable: true,
        enumerable: true,
        writable: true,
      });
    }
  }

  return fixture;
}

export { MockRender };
