import { MockNgModuleResolver } from '@angular/compiler/testing';
import { NgModule } from '@angular/core';

import coreReflectBodyCatch from './core.reflect.body-catch';
import coreReflectBodyGlobal from './core.reflect.body-global';

const coreReflectModule = coreReflectBodyGlobal(MockNgModuleResolver);

export default (def: any): NgModule => coreReflectBodyCatch((arg: any) => coreReflectModule().resolve(arg))(def);
