import { Component, Type } from '@angular/core';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { directiveResolver } from '../common/reflect';

function MockRender<MComponent, TComponent extends {[key: string]: any}>(
  template: string | Type<MComponent>,
  params?: TComponent,
  detectChanges = true
): ComponentFixture<TComponent> {
  let mockedTemplate = '';
  if (typeof template === 'string') {
    mockedTemplate = template;
  } else {
    const {inputs, outputs, selector} = directiveResolver.resolve(template);
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
    selector: 'mock-render',
    template: mockedTemplate,
  };

  // tslint:disable-next-line:no-angle-bracket-type-assertion
  const component = Component(options)(<any> class MockRenderComponent {
    constructor() {
      Object.assign(this, params);
    }
  } as Type<TComponent>);

  // Soft reset of TestBed.
  (getTestBed() as any)._instantiated = false;
  (getTestBed() as any)._moduleFactory = undefined;

  // Injection of our template.
  TestBed.configureTestingModule({
    declarations: [component],
  });

  const fixture = TestBed.createComponent(component);

  if (detectChanges) {
    fixture.detectChanges();
  }

  return fixture;
}

export { MockRender };
