import { NgModule } from '@angular/core';

import collectDeclarations from '../resolve/collect-declarations';

import coreReflectBodyCatch from './core.reflect.body-catch';

export default (def: any): NgModule =>
  coreReflectBodyCatch((arg: any) => {
    const declaration = collectDeclarations(arg);
    if (declaration.NgModule) {
      return declaration.NgModule;
    }

    throw new Error('Cannot resolve declarations');
  })(def);
