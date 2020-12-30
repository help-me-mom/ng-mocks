import { Directive } from '@angular/core';

import coreReflectBody from './core.reflect.body';
import coreReflectDirective from './core.reflect.directive';

export default (def: any): Directive => coreReflectBody((arg: any) => coreReflectDirective().resolve(arg))(def);
