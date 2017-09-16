import 'reflect-metadata';
import { Component } from '@angular/core';
import { MockComponent as Ng2MockComponent } from 'ng2-mock-component';

export function MockComponent(component: any) {
  const annotations = Reflect.getMetadata('annotations', component),
    propertyMetadata = Reflect.getMetadata('propMetadata', component),
    inputs: string[] = [],
    outputs: string[] = [];

  let options: Component = {
    selector: annotations[0].selector,
    template: 'MOCK',
    inputs,
    outputs
  };

  for (var property in propertyMetadata) {
    const prop = propertyMetadata[property];
    if (prop[0].toString() === '@Input') {
      inputs.push(property);
    } else if (prop[0].toString() === '@Output') {
      outputs.push(property);
    }
  }

  return Ng2MockComponent(options);
}
