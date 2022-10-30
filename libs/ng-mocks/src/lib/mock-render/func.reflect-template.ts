import { Component, Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import coreDefineProperty from '../common/core.define-property';
import { extendClass } from '../common/core.helpers';
import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { AnyType } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';

const registerTemplateMiddleware = (template: AnyType<any>, meta: Directive): void => {
  const child = extendClass(template);

  const alias = {
    provide: template,
    useExisting: child,
  };
  meta.providers = [...(meta.providers || []), alias];

  // https://github.com/help-me-mom/ng-mocks/issues/1876
  // We need to apply overrides to our cloned declaration.
  let set: any = {};
  try {
    const ngMocksOverrides: Map<any, any> = (TestBed as any).ngMocksOverrides;
    const { override } = ngMocksOverrides.get(template);
    set = { ...override.set };
    set.providers = set.providers ? [...set.providers, alias] : meta.providers;
  } catch {
    // nothing to do
  }

  const standalone = (meta as any).__ngMocksStandalone === true;
  (isNgDef(template, 'c') ? Component : Directive)({
    ...meta,
    ...set,
    ...(standalone ? { standalone } : {}),
  })(child);
  TestBed.configureTestingModule({
    [standalone ? 'imports' : 'declarations']: [child],
  });
};

export default (template: AnyType<any>): Directive => {
  if (!isNgDef(template, 'c') && !isNgDef(template, 'd')) {
    return {};
  }

  const meta = coreReflectDirectiveResolve(template);
  const override: Directive = {};
  for (const key of Object.keys(meta)) {
    if (key === 'standalone') {
      coreDefineProperty(override, '__ngMocksStandalone', !!meta[key as never]);
      continue;
    }

    override[key as never] = meta[key as never];
  }

  if (override.selector && /[\s,[\]]/.test(override.selector)) {
    override.selector = '';
  }

  if (!override.selector) {
    // istanbul ignore next
    override.selector = (TestBed as any).ngMocksSelectors?.get(template) || '';
    if (!override.selector) {
      override.selector = `ng-mocks-${template.name}`;
      registerTemplateMiddleware(template, override);
      // istanbul ignore else
      if ((TestBed as any).ngMocksSelectors) {
        (TestBed as any).ngMocksSelectors.set(template, override.selector);
      }
    }
  }

  return override;
};
