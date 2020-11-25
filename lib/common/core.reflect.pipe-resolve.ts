import { Pipe } from '@angular/core';

import { pipeResolver } from './core.reflect';
import coreReflectBody from './core.reflect.body';

export default (def: any): Pipe => coreReflectBody((arg: any) => pipeResolver.resolve(arg))(def);
