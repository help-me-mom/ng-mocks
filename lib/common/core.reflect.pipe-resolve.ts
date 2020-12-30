import { Pipe } from '@angular/core';

import coreReflectBodyCatch from './core.reflect.body-catch';
import coreReflectPipe from './core.reflect.pipe';

export default (def: any): Pipe => coreReflectBodyCatch((arg: any) => coreReflectPipe().resolve(arg))(def);
