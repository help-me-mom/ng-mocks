import { Component, EventEmitter, forwardRef, Type } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MockOf } from '../common';
import { directiveResolver } from '../common/reflect';
import { MockedComponent } from './mock-component';

const cache = new Map<Type<Component>, Type<Component>>();

export type MockedComponent<T> = T & {
  __simulateChange(value: any): void;
  __simulateTouch(): void;
};

export function MockComponents(...components: Array<Type<any>>): Array<Type<any>> {
  return components.map(MockComponent);
}

export function MockComponent<TComponent>(component: Type<TComponent>): Type<TComponent> {
  const cacheHit = cache.get(component);
  if (cacheHit) {
    return cacheHit as Type<TComponent>;
  }

  const { exportAs, inputs, outputs, selector } = directiveResolver.resolve(component);

  const options: Component = {
    exportAs,
    inputs,
    outputs,
    providers: [{
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComponentMock)
    },
    {
      provide: component,
      useExisting: forwardRef(() => ComponentMock)
    }],
    selector,
    template: '<ng-content></ng-content>'
  };

  @MockOf(component)
  class ComponentMock implements ControlValueAccessor {
    constructor() {
      Object.keys(component.prototype).forEach((method) => {
        if (!(this as any)[method]) {
          (this as any)[method] = () => {};
        }
      });

      (options.outputs || []).forEach((output) => {
        (this as any)[output.split(':')[0]] = new EventEmitter<any>();
      });
    }

    __simulateChange = (param: any) => {}; // tslint:disable-line:variable-name
    __simulateTouch = () => {}; // tslint:disable-line:variable-name

    registerOnChange = (fn: (value: any) => void) => {
      this.__simulateChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.__simulateTouch = fn;
    }

    writeValue = (value: any) => {};
  }

  // tslint:disable-next-line:no-angle-bracket-type-assertion
  const mockedComponent = Component(options)(<any> ComponentMock as Type<TComponent>);

  cache.set(component, mockedComponent);

  return mockedComponent;
}
