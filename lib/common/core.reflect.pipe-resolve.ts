import { Pipe } from '@angular/core';

import coreReflectBody from './core.reflect.body';
import coreReflectPipe from './core.reflect.pipe';

export default (def: any): Pipe => coreReflectBody((arg: any) => coreReflectPipe().resolve(arg))(def);
