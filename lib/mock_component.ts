import { Component, EventEmitter, forwardRef, Type } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export function MockComponent<TComponent>(component: Type<TComponent>): Type<TComponent> {
  const propertyMetadata = getPropertyMetadata(component);

  const options = {
    inputs: new Array<string>(),
    outputs: new Array<string>(),
    providers: [{
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComponentMock)
    }],
    selector: getComponentSelector(component),
    template: '<ng-content></ng-content>'
  };

  options.inputs = Object.keys(propertyMetadata).filter((meta) => isInput(propertyMetadata[meta]));
  options.outputs = Object.keys(propertyMetadata).filter((meta) => isOutput(propertyMetadata[meta]));

  class ComponentMock implements ControlValueAccessor {
    constructor() {
      options.outputs.forEach((output) => {
        (this as any)[output] = new EventEmitter<any>();
      });
    }

    /* tslint:disable:no-empty */
    registerOnChange = (fn: (value: any) => void) => {};
    registerOnTouched = (fn: (value: any) => void) => {};
    writeValue = (value: any) => {};
    /* tslint:enable:no-empty */
  }

  /* tslint:disable:no-angle-bracket-type-assertion */
  return Component(options as Component)(<any> ComponentMock as Type<TComponent>);
  /* tslint:enable:no-angle-bracket-type-assertion */
}

function isInput(propertyMetadata: any): boolean {
  return propertyMetadata[0].ngMetadataName === 'Input';
}

function isOutput(propertyMetadata: any): boolean {
  return propertyMetadata[0].ngMetadataName === 'Output';
}

function getComponentSelector(component: any): string {
  if (component.__annotations__) {
    return component.__annotations__[0].selector;
  }
  throw new Error('No annotation or decoration metadata on your component');
}

function getPropertyMetadata(component: any): any {
  return component.__prop__metadata__ || {};
}
