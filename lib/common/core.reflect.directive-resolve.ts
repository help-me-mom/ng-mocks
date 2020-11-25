import { Directive } from '@angular/core';

import { directiveResolver } from './core.reflect';
import coreReflectBody from './core.reflect.body';

export default (def: any): Directive => coreReflectBody((arg: any) => directiveResolver.resolve(arg))(def);
