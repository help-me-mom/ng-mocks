import { Component, Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Type } from '../common/core.types';
import helperDefinePropertyDescriptor from '../mock-service/helper.define-property-descriptor';

import funcGenerateTemplate from './func.generate-template';
import funcInstallPropReader from './func.install-prop-reader';

const generateWrapper = ({ params, options, inputs }: any) => {
  class MockRenderComponent {
    public constructor() {
      if (!params) {
        for (const input of inputs || []) {
          let value: any = null;
          helperDefinePropertyDescriptor(this, input, {
            get: () => value,
            set: (newValue: any) => (value = newValue),
          });
        }
      }
      funcInstallPropReader(this, params);
    }
  }

  Component(options)(MockRenderComponent);
  TestBed.configureTestingModule({
    declarations: [MockRenderComponent],
  });

  return MockRenderComponent;
};

export default (template: any, meta: Directive, params: any, flags: any): Type<any> => {
  const mockTemplate = funcGenerateTemplate(template, { ...meta, params });
  const options: Component = {
    providers: flags.providers,
    selector: 'mock-render',
    template: mockTemplate,
  };

  return generateWrapper({ ...meta, params, options });
};
