import { ChangeDetectionStrategy, Component, Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { extendClass } from '../common/core.helpers';
import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { AnyType, DirectiveIo } from '../common/core.types';
import decorateInputs from '../common/decorate.inputs';
import funcDirectiveIoParse from '../common/func.directive-io-parse';
import { isNgDef } from '../common/func.is-ng-def';
import { isStandalone } from '../common/func.is-standalone';

import funcInheritDefinition from './func.inherit-definition';

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

  // Reflecting the clone can append inputs, so keep its array separate from
  // the metadata used to generate the wrapper's bindings.
  set.inputs = [...({ ...meta, ...set }.inputs || [])];
  // Angular JIT only preserves signal flags through property decorators.
  decorateInputs(
    child,
    set.inputs.filter((input: DirectiveIo) => funcDirectiveIoParse(input).isSignal),
  );

  if (isNgDef(template, 'c')) {
    Component({
      // Selector-less components are cloned under a synthetic selector. Default
      // keeps that clone checkable; real metadata and TestBed overrides still win.
      changeDetection: ChangeDetectionStrategy.Default,
      ...meta,
      ...set,
    })(child);
  } else {
    Directive({
      ...meta,
      ...set,
    })(child);
  }
  funcInheritDefinition(child, template);
  TestBed.configureTestingModule({
    [isStandalone(child) ? 'imports' : 'declarations']: [child],
  });
};

export default (template: AnyType<any>): Directive => {
  if (!isNgDef(template, 'c') && !isNgDef(template, 'd')) {
    return {};
  }

  const meta = coreReflectDirectiveResolve(template);
  const override: Directive = {};
  for (const key of Object.keys(meta)) {
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
