import { Component, Directive } from '@angular/core';

import collectDeclarations from '../resolve/collect-declarations';

import coreReflectBodyCatch from './core.reflect.body-catch';

export default (def: any): Directive & Partial<Component> & { standalone?: boolean } =>
  coreReflectBodyCatch((arg: any) => {
    const declaration = collectDeclarations(arg);
    if (declaration.Component) {
      return declaration.Component;
    }
    if (declaration.Directive) {
      return declaration.Directive;
    }

    throw new Error('Cannot resolve declarations');
  })(def);
