import { MockPipeResolver } from '@angular/compiler/testing';
import { Pipe } from '@angular/core';

import coreReflectBodyCatch from './core.reflect.body-catch';
import coreReflectBodyGlobal from './core.reflect.body-global';

const coreReflectPipe = coreReflectBodyGlobal(MockPipeResolver);

export default (def: any): Pipe => coreReflectBodyCatch((arg: any) => coreReflectPipe().resolve(arg))(def);
