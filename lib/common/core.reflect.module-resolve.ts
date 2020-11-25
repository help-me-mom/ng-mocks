import { NgModule } from '@angular/core';

import { ngModuleResolver } from './core.reflect';

export default (def: any): NgModule => {
  try {
    return ngModuleResolver.resolve(def);
  } catch (e) {
    // istanbul ignore next
    throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
  }
};
