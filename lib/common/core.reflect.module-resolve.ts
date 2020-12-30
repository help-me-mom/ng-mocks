import { NgModule } from '@angular/core';

import coreReflectBody from './core.reflect.body';
import coreReflectModule from './core.reflect.module';

export default (def: any): NgModule => coreReflectBody((arg: any) => coreReflectModule().resolve(arg))(def);
