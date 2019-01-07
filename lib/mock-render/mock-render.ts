import { Component, Type } from '@angular/core';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

export function MockRender<TComponent>(template: string, params?: TComponent): ComponentFixture<TComponent> {
  const options: Component = {
    selector: 'mock-render',
    template
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
  fixture.detectChanges();
  return fixture;
}
