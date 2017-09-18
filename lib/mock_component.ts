import { Component } from '@angular/core';
import { MockComponent as Ng2MockComponent } from 'ng2-mock-component';
import 'reflect-metadata';

export function MockComponent(component: any) {
  const annotations = Reflect.getMetadata('annotations', component);
  const propertyMetadata = Reflect.getMetadata('propMetadata', component);
  const inputs: string[] = [];
  const outputs: string[] = [];

  const options: Component = {
    inputs,
    outputs,
    selector: annotations[0].selector,
    template: '<ng-content></ng-content>'
  };

  for (const property of Object.keys(propertyMetadata)) {
    const prop = propertyMetadata[property];
    if (prop[0].toString() === '@Input') {
      inputs.push(property);
    } else if (prop[0].toString() === '@Output') {
      outputs.push(property);
    }
  }

  return Ng2MockComponent(options);
}
