import { Component, EventEmitter, Input, Output, Type } from '@angular/core';

declare var Reflect: any;

export function MockComponent<TComponent>(component: Type<TComponent>): Type<TComponent> {
  const propertyMetadata = getPropertyMetadata(component);

  const options = {
    inputs: new Array<string>(),
    outputs: new Array<string>(),
    selector: getComponentSelector(component),
    template: '<ng-content></ng-content>'
  };

  options.inputs = Object.keys(propertyMetadata).filter((meta) => isInput(propertyMetadata[meta]));
  options.outputs = Object.keys(propertyMetadata).filter((meta) => isOutput(propertyMetadata[meta]));

  /* tslint:disable:no-unnecessary-class */
  class ComponentMock {
    constructor() {
      options.outputs.forEach((output) => {
        (this as any)[output] = new EventEmitter<any>();
      });
    }
  }
  /* tslint:enable:no-unnecessary-class */

  return Component(options as Component)(ComponentMock as Type<TComponent>);
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
