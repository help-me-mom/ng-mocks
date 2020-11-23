// tslint:disable variable-name

import { EventEmitter, Injector, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

import { IMockBuilderConfig } from '../mock-builder/types';
import mockServiceHelper from '../mock-service/helper';

import ngMocksUniverse from './ng-mocks-universe';

export type ngMocksMockConfig = {
  config?: IMockBuilderConfig;
  outputs?: string[];
  setNgValueAccessor?: boolean;
  viewChildRefs?: Map<string, string>;
};

export class Mock {
  public readonly __ngMocksMock: true = true;

  protected readonly __ngMocksConfig?: ngMocksMockConfig;

  public constructor(@Optional() injector?: Injector) {
    const mockOf = (this.constructor as any).mockOf;

    if (injector && this.__ngMocksConfig && this.__ngMocksConfig.setNgValueAccessor) {
      try {
        const ngControl = (injector.get as any)(/* A5 */ NgControl, undefined, 0b1010);
        if (ngControl && !ngControl.valueAccessor) {
          ngControl.valueAccessor = this;
        }
      } catch (e) {
        // nothing to do.
      }
    }

    // setting outputs

    const mockOutputs = [];
    for (const output of this.__ngMocksConfig && this.__ngMocksConfig.outputs ? this.__ngMocksConfig.outputs : []) {
      mockOutputs.push(output.split(':')[0]);
    }

    for (const output of mockOutputs) {
      if ((this as any)[output] || Object.getOwnPropertyDescriptor(this, output)) {
        continue;
      }
      (this as any)[output] = new EventEmitter<any>();
    }

    // setting our mock methods and props
    const prototype = Object.getPrototypeOf(this);
    for (const method of mockServiceHelper.extractMethodsFromPrototype(prototype)) {
      const descriptor = mockServiceHelper.extractPropertyDescriptor(prototype, method);
      /* istanbul ignore next */
      if (!descriptor) {
        continue;
      }
      Object.defineProperty(this, method, descriptor);
    }
    for (const prop of mockServiceHelper.extractPropertiesFromPrototype(prototype)) {
      const descriptor = mockServiceHelper.extractPropertyDescriptor(prototype, prop);
      /* istanbul ignore next */
      if (!descriptor) {
        continue;
      }
      Object.defineProperty(this, prop, descriptor);
    }

    // setting mocks for original class methods and props
    for (const method of mockServiceHelper.extractMethodsFromPrototype(mockOf.prototype)) {
      if ((this as any)[method] || Object.getOwnPropertyDescriptor(this, method)) {
        continue;
      }
      mockServiceHelper.mock(this, method);
    }
    for (const prop of mockServiceHelper.extractPropertiesFromPrototype(mockOf.prototype)) {
      if ((this as any)[prop] || Object.getOwnPropertyDescriptor(this, prop)) {
        continue;
      }
      mockServiceHelper.mock(this, prop, 'get');
      mockServiceHelper.mock(this, prop, 'set');
    }

    // and faking prototype
    Object.setPrototypeOf(this, mockOf.prototype);

    const config = ngMocksUniverse.config.get(mockOf);
    if (config && config.init && config.init) {
      config.init(this, injector);
    }
  }
}
