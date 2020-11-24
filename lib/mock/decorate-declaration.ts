import { Component, Directive, Provider, ViewChild } from '@angular/core';

import { AnyType } from '../common/core.types';
import decorateInputs from '../common/decorate.inputs';
import decorateOutputs from '../common/decorate.outputs';
import decorateQueries from '../common/decorate.queries';
import { MockOf } from '../common/mock-of';
import ngMocksUniverse from '../common/ng-mocks-universe';
import helperMockService from '../mock-service/helper.mock-service';
import cloneProviders from '../mock/clone-providers';
import toExistingProvider from '../mock/to-existing-provider';

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

  if (data.setNgValueAccessor === undefined) {
    data.setNgValueAccessor =
      helperMockService.extractMethodsFromPrototype(source.prototype).indexOf('writeValue') !== -1;
  }
  MockOf(source, {
    config: ngMocksUniverse.config.get(source),
    outputs: meta.outputs,
    setNgValueAccessor: data.setNgValueAccessor,
    viewChildRefs: meta.viewChildRefs,
  })(mock);

  // istanbul ignore else
  if (meta.queries) {
    decorateInputs(mock, meta.inputs, Object.keys(meta.queries));
  }
  decorateOutputs(mock, meta.outputs);
  decorateQueries(mock, meta.queries);

  return options;
};
