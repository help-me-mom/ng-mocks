import { NgModule, Optional } from '@angular/core';
import * as angularCore from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';
import { extendClass } from '../../common/core.helpers';
import { NG_MOCKS } from '../../common/core.tokens';
import { isNgDef } from '../../common/func.is-ng-def';
import helperCreateClone from '../../mock-service/helper.create-clone';

import { NgMeta } from './types';

type EntryComponent = angularCore.Type<unknown>;
type EntryComponentMap = Map<EntryComponent, EntryComponent>;

type ComponentFactoryResolver = {
  resolveComponentFactory: (component: EntryComponent) => unknown;
};

// The resolver token is only passed to Angular DI metadata, so its prototype is
// enough to match Angular's abstract class value without using the broad Function type.
type ComponentFactoryResolverToken = {
  prototype: ComponentFactoryResolver;
};

type AngularCoreWithComponentFactoryResolver = typeof angularCore & {
  ComponentFactoryResolver: ComponentFactoryResolverToken;
};

export class EntryComponentsModule {
  public constructor(map: EntryComponentMap, componentFactoryResolver?: ComponentFactoryResolver) {
    // istanbul ignore if
    if (!componentFactoryResolver) {
      return;
    }

    const originCFR = componentFactoryResolver.resolveComponentFactory;
    const patchedResolveComponentFactory: ComponentFactoryResolver['resolveComponentFactory'] = component =>
      originCFR.call(componentFactoryResolver, map.get(component) ?? component);
    componentFactoryResolver.resolveComponentFactory = helperCreateClone(
      originCFR,
      undefined,
      undefined,
      patchedResolveComponentFactory,
    );
  }
}
type EntryComponentsModuleParameter = [typeof NG_MOCKS] | [ComponentFactoryResolverToken, Optional];

export const createEntryComponentsModuleParameters = (
  core: object,
  componentFactoryResolverAvailable: boolean,
): EntryComponentsModuleParameter[] => {
  const parameters: EntryComponentsModuleParameter[] = [[NG_MOCKS]];
  if (componentFactoryResolverAvailable) {
    const componentFactoryResolver = (core as AngularCoreWithComponentFactoryResolver).ComponentFactoryResolver;
    parameters.push([componentFactoryResolver, new Optional()]);
  }

  return parameters;
};

// Angular 22 removes ComponentFactoryResolver as a value export. Keep the presence
// check directly on the namespace so bundlers retain the legacy binding when it exists.
const parameters = createEntryComponentsModuleParameters(angularCore, 'ComponentFactoryResolver' in angularCore);
coreDefineProperty(EntryComponentsModule, 'parameters', parameters);

class IvyModule {}
NgModule()(IvyModule);
const ivyModule: typeof IvyModule & { ɵmod?: unknown } = IvyModule;

export default (ngModule: NgMeta): void => {
  const entryComponents: EntryComponent[] = [];
  for (const declaration of ngModule.declarations) {
    if (isNgDef(declaration, 'c')) {
      entryComponents.push(declaration);
    }
  }
  // the way to cause entryComponents to do its work
  const entryModule = extendClass(EntryComponentsModule);
  NgModule({
    // Ivy knows how to make any component an entry point,
    // but we still would like to patch resolveComponentFactory in order to provide mocks.
    // ɵmod is added only if Ivy has been enabled.
    entryComponents: ivyModule.ɵmod ? [] : /* istanbul ignore next */ entryComponents,
  } as never)(entryModule);
  ngModule.imports.push(entryModule);
};
