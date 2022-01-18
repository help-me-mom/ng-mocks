// tslint:disable cyclomatic-complexity

import { Component, Directive, Provider, ViewChild } from '@angular/core';

import { AnyType } from '../common/core.types';
import decorateInputs from '../common/decorate.inputs';
import decorateMock from '../common/decorate.mock';
import decorateOutputs from '../common/decorate.outputs';
import decorateQueries from '../common/decorate.queries';
import { ngMocksMockConfig } from '../common/mock';
import ngMocksUniverse from '../common/ng-mocks-universe';
import helperMockService from '../mock-service/helper.mock-service';

import cloneProviders from './clone-providers';
import toExistingProvider from './to-existing-provider';

const buildConfig = (
  source: AnyType<any>,
  meta: {
    inputs?: string[];
    outputs?: string[];
    providers?: Provider[];
    queries?: Record<string, ViewChild>;
  },
  setControlValueAccessor: boolean,
): ngMocksMockConfig => ({
  config: ngMocksUniverse.config.get(source),
  outputs: meta.outputs,
  queryScanKeys: [],
  setControlValueAccessor,
});

export default <T extends Component | Directive>(
  source: AnyType<any>,
  mock: AnyType<any>,
  meta: {
    hostBindings?: Array<[string, any]>;
    hostListeners?: Array<[string, any, any]>;
    inputs?: string[];
    outputs?: string[];
    providers?: Provider[];
    queries?: Record<string, ViewChild>;
    viewProviders?: Provider[];
  },
  params: T,
): T => {
  const data = cloneProviders(source, mock, meta.providers || []);
  const providers = [toExistingProvider(source, mock), ...data.providers];
  const { providers: viewProviders } = cloneProviders(source, mock, meta.viewProviders || []);
  const options: T = { ...params, providers, viewProviders };

  if (data.setControlValueAccessor === undefined) {
    data.setControlValueAccessor =
      helperMockService.extractMethodsFromPrototype(source.prototype).indexOf('writeValue') !== -1;
  }

  const config: ngMocksMockConfig = buildConfig(source, meta, data.setControlValueAccessor);
  decorateMock(mock, source, config);

  // istanbul ignore else
  if (meta.queries) {
    decorateInputs(mock, meta.inputs, Object.keys(meta.queries));
  }
  decorateOutputs(mock, meta.outputs);
  config.queryScanKeys = decorateQueries(mock, meta.queries);

  config.hostBindings = [];
  for (const [key] of meta.hostBindings || []) {
    // mock declarations should not have side effects based on host bindings.
    // HostBinding(...args)(mock.prototype, key);
    if (config.hostBindings.indexOf(key) === -1) {
      config.hostBindings.push(key);
    }
  }

  config.hostListeners = [];
  for (const [key] of meta.hostListeners || []) {
    // mock declarations should not have side effects based on host bindings.
    // HostListener(...args)(mock.prototype, key);
    if (config.hostListeners.indexOf(key) === -1) {
      config.hostListeners.push(key);
    }
  }

  return options;
};
