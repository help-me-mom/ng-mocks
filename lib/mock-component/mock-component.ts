import { Component, EventEmitter, forwardRef, Type } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MockOf } from '../common';
import { directiveResolver } from '../common/reflect';

const cache = new Map<Type<Component>, Type<Component>>();

export function MockComponents<TComponent>(...components: Array<Type<TComponent>>): Array<Type<TComponent>> {
  return components.map(MockComponent);
}

export function MockComponent<TComponent>(component: Type<TComponent>): Type<TComponent> {
  const cacheHit = cache.get(component);
  if (cacheHit) {
    return cacheHit as Type<TComponent>;
  }

  const {exportAs, inputs, outputs, selector} = directiveResolver.resolve(component);

  const options: Component = {
    exportAs,
    inputs,
    outputs,
    providers: [{
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComponentMock)
    }],
    selector,
    template: '<ng-content></ng-content>'
  };

  @MockOf(component)
  class ComponentMock implements ControlValueAccessor {
    constructor() {
      (options.outputs || []).forEach((output) => {
        (this as any)[output.split(':')[0]] = new EventEmitter<any>();
      });
    }

    /* tslint:disable:no-empty variable-name */
    __simulateChange = (param: any) => {};
    __simulateTouch = () => {};
    /* tslint:enable:no-empty variable-name */

    registerOnChange = (fn: (value: any) => void) => {
      this.__simulateChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.__simulateTouch = fn;
    }

    /* tslint:disable:no-empty */
    writeValue = (value: any) => {};
    /* tslint:enable:no-empty */
  }

  /* tslint:disable:no-angle-bracket-type-assertion */
  const mockedComponent = Component(options)(<any> ComponentMock as Type<TComponent>);
  /* tslint:enable:no-angle-bracket-type-assertion */

  cache.set(component, mockedComponent);

  return mockedComponent;
}
