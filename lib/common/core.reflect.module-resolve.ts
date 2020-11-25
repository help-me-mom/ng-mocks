import { NgModule } from '@angular/core';

import { ngModuleResolver } from './core.reflect';
import coreReflectBody from './core.reflect.body';

export default (def: any): NgModule => coreReflectBody((arg: any) => ngModuleResolver.resolve(arg))(def);
