import { Component, EventEmitter, forwardRef, Type } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export function MockComponent<TComponent>(component: Type<TComponent>): Type<TComponent> {
  const annotations = (component as any).__annotations__[0] || {};
  const propertyMetadata = (component as any).__prop__metadata__ || {};

  const options: Component = {
    exportAs: annotations.exportAs,
    inputs: Object.keys(propertyMetadata)
                  .filter((meta) => isInput(propertyMetadata[meta]))
                  .map((meta) => [meta, propertyMetadata[meta][0].bindingPropertyName || meta].join(':')),
    outputs: Object.keys(propertyMetadata)
                   .filter((meta) => isOutput(propertyMetadata[meta]))
                   .map((meta) => [meta, propertyMetadata[meta][0].bindingPropertyName || meta].join(':')),
    providers: [{
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComponentMock)
    }],
    selector: annotations.selector,
    template: '<ng-content></ng-content>'
  };

  class ComponentMock implements ControlValueAccessor {
    constructor() {
      (options.outputs || []).forEach((output) => {
        (this as any)[output.split(':')[0]] = new EventEmitter<any>();
      });
    }

    /* tslint:disable:no-empty */
    registerOnChange = (fn: (value: any) => void) => {};
    registerOnTouched = (fn: (value: any) => void) => {};
    writeValue = (value: any) => {};
    /* tslint:enable:no-empty */
  }

  /* tslint:disable:no-angle-bracket-type-assertion */
  return Component(options)(<any> ComponentMock as Type<TComponent>);
  /* tslint:enable:no-angle-bracket-type-assertion */
}

function isInput(propertyMetadata: any): boolean {
  return propertyMetadata[0].ngMetadataName === 'Input';
}

function isOutput(propertyMetadata: any): boolean {
  return propertyMetadata[0].ngMetadataName === 'Output';
}
