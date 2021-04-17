import { ComponentFactoryResolver, NgModule } from '@angular/core';

let isIvy = false;
try {
  // tslint:disable-next-line no-require-imports no-var-requires
  const module = require('@angular/core');
  isIvy = module.ɵivyEnabled;
} catch (e) {
  // nothing to do
}

import coreDefineProperty from '../../common/core.define-property';
import { extendClass } from '../../common/core.helpers';
import { NG_MOCKS } from '../../common/core.tokens';
import { isNgDef } from '../../common/func.is-ng-def';

import { NgMeta } from './types';

class EntryComponentsModule {
  protected origin: ComponentFactoryResolver['resolveComponentFactory'];

  public constructor(map: Map<any, any>, protected componentFactoryResolver: ComponentFactoryResolver) {
    this.origin = componentFactoryResolver.resolveComponentFactory;
    componentFactoryResolver.resolveComponentFactory = component =>
      this.origin.call(componentFactoryResolver, map.get(component) ?? component) as any;
  }
}
coreDefineProperty(EntryComponentsModule, 'parameters', [[NG_MOCKS], [ComponentFactoryResolver]]);

export default (ngModule: NgMeta): void => {
  const entryComponents: any[] = [];
  for (const declaration of ngModule.declarations) {
    if (isNgDef(declaration, 'c')) {
      entryComponents.push(declaration);
    }
  }
  // the way to cause entryComponents to do its work
  const entryComponent = extendClass(EntryComponentsModule);
  NgModule({
    // Ivy knows how to make any component an entry point,
    // but we still would like to patch resolveComponentFactory in order to provide mocks.
    entryComponents: isIvy ? /* istanbul ignore next */ [] : entryComponents,
  })(entryComponent);
  ngModule.imports.push(entryComponent);
};
