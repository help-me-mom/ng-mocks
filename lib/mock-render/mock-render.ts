// tslint:disable:unified-signatures

import { Component, DebugElement, Type } from '@angular/core';
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

export type DebugElementType<T> = { componentInstance: T } & Pick<DebugElement, DebugElementField>;

function MockRender<MComponent, TComponent extends { [key: string]: any }>(
  template: Type<MComponent>,
  params: TComponent,
  detectChanges?: boolean
): ComponentFixture<TComponent> & { point: DebugElementType<MComponent> };

// without params we shouldn't autocomplete any keys of any types.
function MockRender<MComponent>(
  template: Type<MComponent>
): ComponentFixture<null> & { point: DebugElementType<MComponent> };

function MockRender<MComponent, TComponent extends { [key: string]: any }>(
  template: string,
  params: TComponent,
  detectChanges?: boolean
): ComponentFixture<TComponent>;

// without params we shouldn't autocomplete any keys of any types.
function MockRender<MComponent>(template: string): ComponentFixture<null>;

function MockRender<MComponent, TComponent extends { [key: string]: any }>(
  template: string | Type<MComponent>,
  params?: TComponent,
  detectChanges = true
): ComponentFixture<TComponent> {
  let mockedTemplate = '';
  if (typeof template === 'string') {
    mockedTemplate = template;
  } else {
    const { inputs, outputs, selector } = directiveResolver.resolve(template);
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

  if (detectChanges) {
    fixture.detectChanges();
  }

  if (typeof template !== 'string') {
    fixture.point = fixture.debugElement.children[0];
  }
  return fixture;
}

export { MockRender };
