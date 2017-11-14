import { Component, EventEmitter, Input, Output } from '@angular/core';

declare var Reflect: any;

export function MockComponent(component: any): Component {
  const propertyMetadata = getPropertyMetadata(component);

  const options = {
    inputs: new Array<string>(),
    outputs: new Array<string>(),
    selector: getComponentSelector(component),
    template: '<ng-content></ng-content>'
  };

  options.inputs = Object.keys(propertyMetadata).filter((meta) => isInput(propertyMetadata[meta]));
  options.outputs = Object.keys(propertyMetadata).filter((meta) => isOutput(propertyMetadata[meta]));

  class ComponentMock {}

  options.outputs.forEach((output) => {
    (ComponentMock as any).prototype[output] = new EventEmitter<any>();
  });

  return Component(options as Component)(ComponentMock as any);
}

function isInput(propertyMetadata: any): boolean {
  return propertyMetadata[0].type === Input || propertyMetadata[0].toString() === '@Input';
}

function isOutput(propertyMetadata: any): boolean {
  return propertyMetadata[0].type === Output || propertyMetadata[0].toString() === '@Output';
}

function getComponentSelector(component: any): string {
  if (component.decorators) {
    return component.decorators[0].args[0].selector;
  }
  if (Reflect.hasMetadata('annotations', component)) {
    const metadata = Reflect.getMetadata('annotations', component);
    return metadata[0].selector;
  }
  throw new Error('No annotation or decoration metadata on your component');
}

function getPropertyMetadata(component: any): any {
  if (component.propDecorators) {
    return component.propDecorators;
  }
  if (Reflect.hasMetadata('propMetadata', component)) {
    return Reflect.getMetadata('propMetadata', component);
  }
  return {};
}
