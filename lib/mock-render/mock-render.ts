import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

export function MockRender<TComponent>(template: string, params: TComponent): ComponentFixture<TComponent> {
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

  TestBed.configureTestingModule({
    declarations: [component]
  });

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}
