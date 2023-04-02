import { Component, Directive } from '@angular/core';

import coreConfig from '../common/core.config';
import coreDefineProperty from '../common/core.define-property';
import { Type } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';
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

const generateWrapperComponent = ({ bindings, options, inputs }: any) => {
  class MockRenderComponent {
    public constructor() {
      coreDefineProperty(this, '__ngMocksOutput', generateWrapperOutput(this));

      // The getter helps to remove the __ngContext__ attribute from <mock-render> tag.
      // It helps with snapshot assertions.
      // @see https://github.com/help-me-mom/ng-mocks/issues/3811
      let ngContext = 0;
      helperDefinePropertyDescriptor(this, '__ngContext__', {
        get: () => ngContext,
        set: (newValue: any) => (ngContext = newValue),
        enumerable: false,
      });

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

  // A16: adding unique property.
  coreDefineProperty(MockRenderComponent.prototype, `__ngMocks_index_${ngMocksUniverse.index()}`, undefined, false);
  Component(options)(MockRenderComponent);

  return MockRenderComponent;
};

const generateWrapperDirective = ({ selector, options }: any) => {
  class MockRenderDirective {}
  Directive({
    selector,
    providers: options.providers,
  })(MockRenderDirective);

  return MockRenderDirective;
};

const getCache = () => {
  const caches: Array<Type<any> & Record<'cacheKey', any[]>> = ngMocksUniverse.config.get('MockRenderCaches') ?? [];
  if (caches.length === 0) {
    ngMocksUniverse.config.set('MockRenderCaches', caches);
  }

  return caches;
};

const checkCache = (caches: Array<Type<any> & Record<'cacheKey', any[]>>, cacheKey: any[]): undefined | Type<any> => {
  for (const cache of caches) {
    if (cache.cacheKey.length !== cacheKey.length) {
      continue;
    }
    let isValid = true;
    for (let i = 0; i < cacheKey.length; i += 1) {
      if (cache.cacheKey[i] !== cacheKey[i]) {
        isValid = false;
        break;
      }
    }
    if (isValid) {
      return cache;
    }
  }

  return undefined;
};

export default (
  template: any,
  meta: Directive,
  bindings: undefined | null | any[],
  flags: Record<keyof any, any>,
): Type<any> => {
  const caches = getCache();

  // nulls help to detect defaults
  const cacheKey = [
    template,
    ...(bindings ?? [null]),
    ...(flags.providers ?? [null]),
    ...(flags.viewProviders ?? [null]),
  ];
  let ctor = checkCache(caches, cacheKey);
  if (ctor) {
    return ctor;
  }

  const inputs = meta.inputs ? [...meta.inputs] : [];
  const outputs = meta.outputs ? [...meta.outputs] : [];
  if (meta.hostDirectives) {
    for (const hostDirective of meta.hostDirectives) {
      if (typeof hostDirective !== 'object' || !hostDirective.directive) {
        continue;
      }

      if (hostDirective.inputs) {
        inputs.push(...hostDirective.inputs);
      }
      if (hostDirective.outputs) {
        outputs.push(...hostDirective.outputs);
      }
    }
  }

  const mockTemplate = funcGenerateTemplate(template, { selector: meta.selector, inputs, outputs, bindings });
  const options: Component = {
    providers: flags.providers,
    selector: 'mock-render',
    template: mockTemplate,
    viewProviders: flags.viewProviders,
  };

  ctor = generateWrapperComponent({ ...meta, bindings, options });
  coreDefineProperty(ctor, 'cacheKey', cacheKey);
  coreDefineProperty(ctor, 'tpl', mockTemplate);

  if (meta.selector && options.providers) {
    const dir = generateWrapperDirective({ ...meta, bindings, options });
    coreDefineProperty(ctor, 'providers', dir);
  }

  caches.unshift(ctor as any);
  caches.splice(ngMocksUniverse.global.get('mockRenderCacheSize') ?? coreConfig.mockRenderCacheSize);

  return ctor;
};
