import { Component, Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { extendClass } from '../common/core.helpers';
import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { AnyType } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';

const registerTemplateMiddleware = (template: AnyType<any>, meta: Directive): void => {
  const child = extendClass(template);

  let providers = meta.providers || [];
  providers = [
    ...providers,
    {
      provide: template,
      useExisting: child,
    },
  ];
  meta.providers = providers;

  if (isNgDef(template, 'c')) {
    Component(meta)(child);
  } else {
    Directive(meta)(child);
  }
  TestBed.configureTestingModule({
    declarations: [child],
  });
};

export default (template: AnyType<any>): Directive => {
  if (!isNgDef(template, 'c') && !isNgDef(template, 'd')) {
    return {};
  }

  const meta = { ...coreReflectDirectiveResolve(template) };

  if (meta.selector && meta.selector.match(/[\[\],\s]/)) {
    meta.selector = '';
  }

  if (!meta.selector) {
    // istanbul ignore next
    meta.selector = (TestBed as any).ngMocksSelectors?.get(template) || '';
    if (!meta.selector) {
      meta.selector = `ng-mocks-${template.name}`;
      registerTemplateMiddleware(template, meta);
      // istanbul ignore else
      if ((TestBed as any).ngMocksSelectors) {
        (TestBed as any).ngMocksSelectors.set(template, meta.selector);
      }
    }
  }

  return meta;
};
