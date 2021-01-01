import { NgModule } from '@angular/core';

import coreReflectBodyCatch from './core.reflect.body-catch';
import coreReflectModule from './core.reflect.module';

export default (def: any): NgModule => coreReflectBodyCatch((arg: any) => coreReflectModule().resolve(arg))(def);
