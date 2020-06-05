// tslint:disable:unified-signatures

import { core } from '@angular/compiler';
import { Component, DebugElement, DebugNode, Provider, Type } from '@angular/core';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { directiveResolver } from '../common/reflect';

// A5 and its TS 2.4 don't support Omit, that's why we need the magic below.
// TODO remove it once A5 isn't supported.

export type DebugNodeField =
  | 'context'
  | 'injector'
  | 'listeners'
  | 'nativeNode'
  | 'parent'
  | 'providerTokens'
  | 'references';

export type MockedDebugNode<T = any> = { componentInstance: T } & Pick<DebugNode, DebugNodeField> & {
    childNodes?: MockedDebugNode[];
  };

export type DebugElementField =
  | 'attributes'
  | 'children'
  | 'classes'
  | 'name'
  | 'nativeElement'
  | 'properties'
  | 'query'
  | 'queryAll'
  | 'queryAllNodes'
  | 'styles'
  | 'triggerEventHandler';

export type MockedDebugElement<T = any> = Pick<DebugElement, DebugElementField> & MockedDebugNode<T>;

export interface IMockRenderOptions {
  detectChanges?: boolean;
  providers?: Provider[];
}

// tslint:disable-next-line:interface-name
export interface MockedComponentFixture<C = any, F = undefined> extends ComponentFixture<F> {
  point: MockedDebugElement<C>;
}

function MockRender<MComponent, TComponent extends { [key: string]: any }>(
  template: Type<MComponent>,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions
): MockedComponentFixture<MComponent, TComponent>;

// without params we shouldn't autocomplete any keys of any types.
function MockRender<MComponent>(template: Type<MComponent>): MockedComponentFixture<MComponent>;

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

    const { inputs, outputs, selector } = meta;
    mockedTemplate += `<${selector}`;
    if (inputs) {
      inputs.forEach((definition: string) => {
        const [property, alias] = definition.split(': ');
        if (alias && params && typeof params[alias]) {
          mockedTemplate += ` [${alias}]="${alias}"`;
        } else if (property && params && typeof params[property]) {
          mockedTemplate += ` [${property}]="${property}"`;
        }
      });
    }
    if (outputs) {
      outputs.forEach((definition: string) => {
        const [property, alias] = definition.split(': ');
        if (alias && params && typeof params[alias]) {
          mockedTemplate += ` (${alias})="${alias}($event)"`;
        } else if (property && params && typeof params[property]) {
          mockedTemplate += ` (${property})="${property}($event)"`;
        }
      });
    }
    mockedTemplate += `></${selector}>`;
  }
  const options: Component = {
    providers: flagsObject.providers,
    selector: 'mock-render',
    template: mockedTemplate,
  };

  const component = Component(options)(
    class MockRenderComponent {
      constructor() {
        Object.assign(this, params);
      }
    } as Type<TComponent>
  );

  // Soft reset of TestBed.
  (getTestBed() as any)._instantiated = false;
  (getTestBed() as any)._moduleFactory = undefined;
  (getTestBed() as any)._testModuleRef = null;

  // Injection of our template.
  TestBed.configureTestingModule({
    declarations: [component],
  });

  const fixture: any = TestBed.createComponent(component);

  if (flagsObject.detectChanges) {
    fixture.detectChanges();
  }

  fixture.point = fixture.debugElement.children[0];
  return fixture;
}

export { MockRender };
