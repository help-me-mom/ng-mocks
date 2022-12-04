import { Component, Directive, NgModule, ViewChild } from '@angular/core';

import CoreDefStack from '../common/core.def-stack';
import { AnyType } from '../common/core.types';
import decorateInputs from '../common/decorate.inputs';
import decorateMock from '../common/decorate.mock';
import decorateOutputs from '../common/decorate.outputs';
import decorateQueries from '../common/decorate.queries';
import { ngMocksMockConfig } from '../common/mock';
import ngMocksUniverse from '../common/ng-mocks-universe';
import mockNgDef from '../mock-module/mock-ng-def';
import helperMockService from '../mock-service/helper.mock-service';

import cloneProviders from './clone-providers';
import toExistingProvider from './to-existing-provider';

const buildConfig = (
  source: AnyType<any>,
  meta: {
    inputs?: string[];
    outputs?: string[];
    providers?: NgModule['providers'];
    queries?: Record<string, ViewChild>;
  },
  setControlValueAccessor: boolean,
) => {
  return {
    config: ngMocksUniverse.config.get(source),
    outputs: meta.outputs,
    queryScanKeys: [],
    setControlValueAccessor: setControlValueAccessor,
  };
};

export default <T extends Component & Directive>(
  source: AnyType<any>,
  mock: AnyType<any>,
  meta: Component &
    Directive &
    NgModule & {
      hostBindings?: Array<[string, any]>;
      hostListeners?: Array<[string, any, any]>;
      imports?: any[];
      standalone?: boolean;
    },
  params: T,
): Component & Directive => {
  const hasResolver = ngMocksUniverse.config.has('mockNgDefResolver');
  if (!hasResolver) {
    ngMocksUniverse.config.set('mockNgDefResolver', new CoreDefStack());
  }

  const options: T & { imports?: any[]; standalone?: boolean } = {
    ...params,
  };

  if (meta.exportAs !== undefined) {
    options.exportAs = meta.exportAs;
  }
  if (meta.selector !== undefined) {
    options.selector = meta.selector;
  }
  if (meta.standalone !== undefined) {
    options.standalone = meta.standalone;
  }

  if (meta.standalone && meta.imports) {
    const [, { imports }] = mockNgDef({ imports: meta.imports, skipExports: true });
    if (imports?.length) {
      options.imports = imports as never;
    }
  }

  const { setControlValueAccessor, providers } = cloneProviders(
    source,
    mock,
    meta.providers || [],
    ngMocksUniverse.config.get('mockNgDefResolver'),
  );
  providers.push(toExistingProvider(source, mock));
  options.providers = providers;

  const { providers: viewProviders } = cloneProviders(
    source,
    mock,
    meta.viewProviders || [],
    ngMocksUniverse.config.get('mockNgDefResolver'),
  );
  if (viewProviders.length > 0) {
    options.viewProviders = viewProviders;
  }

  const config: ngMocksMockConfig = buildConfig(
    source,
    meta,
    setControlValueAccessor ??
      helperMockService.extractMethodsFromPrototype(source.prototype).indexOf('writeValue') !== -1,
  );
  decorateMock(mock, source, config);

  // istanbul ignore else
  if (meta.queries) {
    decorateInputs(mock, meta.inputs, Object.keys(meta.queries));
  }
  decorateOutputs(mock, meta.outputs);
  config.queryScanKeys = decorateQueries(mock, meta.queries);

  config.hostBindings = [];
  for (const [key] of meta.hostBindings || /* istanbul ignore next */ []) {
    // mock declarations should not have side effects based on host bindings.
    // HostBinding(...args)(mock.prototype, key);
    if (config.hostBindings.indexOf(key) === -1) {
      config.hostBindings.push(key);
    }
  }

  config.hostListeners = [];
  for (const [key] of meta.hostListeners || /* istanbul ignore next */ []) {
    // mock declarations should not have side effects based on host bindings.
    // HostListener(...args)(mock.prototype, key);
    if (config.hostListeners.indexOf(key) === -1) {
      config.hostListeners.push(key);
    }
  }

  if (!hasResolver) {
    ngMocksUniverse.config.delete('mockNgDefResolver');
  }

  return options;
};
