import * as module from '@angular/core';

let isIvy = false;
try {
  // tslint:disable-next-line no-require-imports no-var-requires
  isIvy = module.ɵivyEnabled;
} catch {
  // nothing to do
}

import coreDefineProperty from '../../common/core.define-property';
import { extendClass } from '../../common/core.helpers';
import { NG_MOCKS } from '../../common/core.tokens';
import { isNgDef } from '../../common/func.is-ng-def';
import helperCreateClone from '../../mock-service/helper.create-clone';

import { NgMeta } from './types';

class EntryComponentsModule {
  protected originCFR: module.ComponentFactoryResolver['resolveComponentFactory'];

  public constructor(map: Map<any, any>, protected componentFactoryResolver: module.ComponentFactoryResolver) {
    this.originCFR = componentFactoryResolver.resolveComponentFactory;
    componentFactoryResolver.resolveComponentFactory = helperCreateClone(
      this.originCFR,
      undefined,
      undefined,
      (component: any, ...args: any[]) =>
        this.originCFR.apply(componentFactoryResolver, [map.get(component) ?? component, ...args] as any),
    );
  }
}
coreDefineProperty(EntryComponentsModule, 'parameters', [[NG_MOCKS], [module.ComponentFactoryResolver]]);

export default (ngModule: NgMeta): void => {
  const entryComponents: any[] = [];
  for (const declaration of ngModule.declarations) {
    if (isNgDef(declaration, 'c')) {
      entryComponents.push(declaration);
    }
  }
  // the way to cause entryComponents to do its work
  const entryModule = extendClass(EntryComponentsModule);
  module.NgModule({
    // Ivy knows how to make any component an entry point,
    // but we still would like to patch resolveComponentFactory in order to provide mocks.
    entryComponents: isIvy ? [] : /* istanbul ignore next */ entryComponents,
  })(entryModule);
  ngModule.imports.push(entryModule);
};
