import { Component, EventEmitter, forwardRef, Type } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { getInputsOutputs } from '../common/reflect';

const cache = new Map<Type<Component>, Type<Component>>();

export function MockComponents<TComponent>(...components: Array<Type<TComponent>>): Array<Type<TComponent>> {
  return components.map(MockComponent);
}

export function MockComponent<TComponent>(component: Type<TComponent>): Type<TComponent> {
  const cacheHit = cache.get(component);
  if (cacheHit) {
    return cacheHit as Type<TComponent>;
  }

  const annotations = (component as any).__annotations__[0] || {};

  const options: Component = {
    exportAs: annotations.exportAs,
    inputs: getInputsOutputs(component, 'Input'),
    outputs: getInputsOutputs(component, 'Output'),
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
  const mockedComponent = Component(options)(<any> ComponentMock as Type<TComponent>);
  /* tslint:enable:no-angle-bracket-type-assertion */

  cache.set(component, mockedComponent);

  return mockedComponent;
}
