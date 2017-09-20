import { Component, EventEmitter } from '@angular/core';

declare var Reflect: any;

export function MockComponent(component: any): Component {
  const annotations = Reflect.getMetadata('annotations', component);
  const propertyMetadata = Reflect.getMetadata('propMetadata', component);
  const stringProperty = (meta: string) => propertyMetadata[meta][0].toString();

  const options = {
    inputs: new Array<string>(),
    outputs: new Array<string>(),
    selector: annotations[0].selector,
    template: '<ng-content></ng-content>'
  };

  options.inputs = Object.keys(propertyMetadata).filter((meta) => stringProperty(meta) === '@Input');
  options.outputs = Object.keys(propertyMetadata).filter((meta) => stringProperty(meta) === '@Output');

  class ComponentMock {}

  options.outputs.forEach((output) => {
    (ComponentMock as any).prototype[output] = new EventEmitter<any>();
  });

  return Component(options as Component)(ComponentMock as any);
}
