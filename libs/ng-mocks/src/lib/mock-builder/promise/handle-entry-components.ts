import { ComponentFactoryResolver, NgModule, Optional } from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';
import { extendClass } from '../../common/core.helpers';
import { NG_MOCKS } from '../../common/core.tokens';
import { isNgDef } from '../../common/func.is-ng-def';
import helperCreateClone from '../../mock-service/helper.create-clone';

import { NgMeta } from './types';

class EntryComponentsModule {
  public constructor(map: Map<any, any>, componentFactoryResolver?: ComponentFactoryResolver) {
    // istanbul ignore if
    if (!componentFactoryResolver) {
      return;
    }

    const originCFR = componentFactoryResolver.resolveComponentFactory;
    componentFactoryResolver.resolveComponentFactory = helperCreateClone(
      originCFR,
      undefined,
      undefined,
      (component: any, ...args: any[]) =>
        originCFR.apply(componentFactoryResolver, [map.get(component) ?? component, ...args] as any),
    );
  }
}
coreDefineProperty(EntryComponentsModule, 'parameters', [[NG_MOCKS], [ComponentFactoryResolver, new Optional()]]);

export default (ngModule: NgMeta): void => {
  const entryComponents: any[] = [];
  for (const declaration of ngModule.declarations) {
    if (isNgDef(declaration, 'c')) {
      entryComponents.push(declaration);
    }
  }
  // the way to cause entryComponents to do its work
  const entryModule = extendClass(EntryComponentsModule);
  NgModule({
    // Angular 17+ always uses Ivy; entryComponents is a no-op but kept for the
    // resolveComponentFactory patching done in EntryComponentsModule constructor.
    entryComponents: [],
  } as never)(entryModule);
  ngModule.imports.push(entryModule);
};
