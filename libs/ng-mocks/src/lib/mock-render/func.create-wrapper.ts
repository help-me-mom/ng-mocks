import { Component, Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import coreDefineProperty from '../common/core.define-property';
import { Type } from '../common/core.types';
import helperDefinePropertyDescriptor from '../mock-service/helper.define-property-descriptor';

import funcGenerateTemplate from './func.generate-template';

const generateWrapperOutput =
  (instance: any) =>
  (prop: keyof any, event: any): void => {
    if (typeof instance[prop] === 'function') {
      return instance[prop](event);
    }
    if (instance[prop] && typeof instance[prop] === 'object' && typeof instance[prop].emit === 'function') {
      return instance[prop].emit(event);
    }
    if (instance[prop] && typeof instance[prop] === 'object' && typeof instance[prop].next === 'function') {
      return instance[prop].next(event);
    }

    instance[prop] = event;
  };

const generateWrapper = ({ bindings, options, inputs }: any) => {
  class MockRenderComponent {
    public constructor() {
      coreDefineProperty(this, '__ngMocksOutput', generateWrapperOutput(this));

      if (!bindings) {
        for (const input of inputs || []) {
          let value: any = null;
          helperDefinePropertyDescriptor(this, input, {
            get: () => value,
            set: (newValue: any) => (value = newValue),
          });
        }
      }
    }
  }

  Component(options)(MockRenderComponent);
  TestBed.configureTestingModule({
    declarations: [MockRenderComponent],
  });

  return MockRenderComponent;
};

export default (
  template: any,
  meta: Directive,
  bindings: undefined | null | any[],
  flags: Record<keyof any, any>,
): Type<any> => {
  const mockTemplate = funcGenerateTemplate(template, { ...meta, bindings });
  const options: Component = {
    providers: flags.providers,
    selector: 'mock-render',
    template: mockTemplate,
  };

  return generateWrapper({ ...meta, bindings, options });
};
