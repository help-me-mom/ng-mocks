// tslint:disable:unified-signatures

import { Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { directiveResolver } from '../common/reflect';

// A5 and its TS 2.4 don't support Omit, that's why we need the magic below.
// TODO remove it once A5 isn't supported.
export type DebugElementField =
  | 'attributes'
  | 'childNodes'
  | 'children'
  | 'classes'
  | 'context'
  | 'injector'
  | 'listeners'
  | 'name'
  | 'nativeElement'
  | 'nativeNode'
  | 'parent'
  | 'properties'
  | 'providerTokens'
  | 'query'
  | 'queryAll'
  | 'queryAllNodes'
  | 'references'
  | 'styles'
  | 'triggerEventHandler';

export type MockedDebugElement<T> = { componentInstance: T } & Pick<DebugElement, DebugElementField>;

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

function MockRender<MComponent, TComponent extends { [key: string]: any }>(
  template: string,
  params: TComponent,
  detectChanges?: boolean | IMockRenderOptions
): MockedComponentFixture<any, TComponent>;

// without params we shouldn't autocomplete any keys of any types.
function MockRender<MComponent>(template: string): MockedComponentFixture;

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
    const { inputs, outputs, selector } = directiveResolver.resolve(template);
    mockedTemplate += selector ? `<${selector}` : '';
    if (selector && inputs) {
      inputs.forEach((definition: string) => {
        const [property, alias] = definition.split(': ');
        if (alias && params && typeof params[alias]) {
          mockedTemplate += ` [${alias}]="${alias}"`;
        } else if (property && params && typeof params[property]) {
          mockedTemplate += ` [${property}]="${property}"`;
        }
      });
    }
    if (selector && outputs) {
      outputs.forEach((definition: string) => {
        const [property, alias] = definition.split(': ');
        if (alias && params && typeof params[alias]) {
          mockedTemplate += ` (${alias})="${alias}($event)"`;
        } else if (property && params && typeof params[property]) {
          mockedTemplate += ` (${property})="${property}($event)"`;
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
        Object.assign(this, params);
      }
    } as Type<TComponent>
  );

  // Soft reset of TestBed.
  (getTestBed() as any)._instantiated = false;
  (getTestBed() as any)._moduleFactory = undefined;

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
