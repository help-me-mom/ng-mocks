import { Component, Directive, Provider, ViewChild } from '@angular/core';

import { AnyType } from '../common/core.types';
import decorateInputs from '../common/decorate.inputs';
import decorateMock from '../common/decorate.mock';
import decorateOutputs from '../common/decorate.outputs';
import decorateQueries from '../common/decorate.queries';
import ngMocksUniverse from '../common/ng-mocks-universe';
import helperMockService from '../mock-service/helper.mock-service';

import cloneProviders from './clone-providers';
import toExistingProvider from './to-existing-provider';

export default <T extends Component | Directive>(
  source: AnyType<any>,
  mock: AnyType<any>,
  meta: {
    inputs?: string[];
    outputs?: string[];
    providers?: Provider[];
    queries?: Record<string, ViewChild>;
    viewChildRefs?: Map<string, string>;
  },
  params: T,
): T => {
  const data = cloneProviders(mock, meta.providers || []);
  const providers = [toExistingProvider(source, mock), ...data.providers];
  const options: T = { ...params, providers };

  if (data.setControlValueAccessor === undefined) {
    data.setControlValueAccessor =
      helperMockService.extractMethodsFromPrototype(source.prototype).indexOf('writeValue') !== -1;
  }
  decorateMock(mock, source, {
    config: ngMocksUniverse.config.get(source),
    outputs: meta.outputs,
    setControlValueAccessor: data.setControlValueAccessor,
    viewChildRefs: meta.viewChildRefs,
  });

  // istanbul ignore else
  if (meta.queries) {
    decorateInputs(mock, meta.inputs, Object.keys(meta.queries));
  }
  decorateOutputs(mock, meta.outputs);
  decorateQueries(mock, meta.queries);

  return options;
};
