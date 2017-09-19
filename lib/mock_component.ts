import { Component, EventEmitter } from '@angular/core';

declare var Reflect: any;

export function MockComponent(component: any): Component {
  const annotations = Reflect.getMetadata('annotations', component);
  const propertyMetadata = Reflect.getMetadata('propMetadata', component);

  const options = {
    inputs: new Array<string>(),
    outputs: new Array<string>(),
    selector: annotations[0].selector,
    template: '<ng-content></ng-content>'
  };

  for (const property of Object.keys(propertyMetadata)) {
    const prop = propertyMetadata[property];
    if (prop[0].toString() === '@Input') {
      options.inputs.push(property);
    } else if (prop[0].toString() === '@Output') {
      options.outputs.push(property);
    }
  }

  class ComponentMock {}

  options.outputs.forEach((output) => {
    (ComponentMock as any).prototype[output] = new EventEmitter<any>();
  });

  return Component(options as Component)(ComponentMock as any);
}
