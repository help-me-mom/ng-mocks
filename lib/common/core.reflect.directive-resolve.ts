import { Directive } from '@angular/core';

import coreReflectBodyCatch from './core.reflect.body-catch';
import coreReflectDirective from './core.reflect.directive';

export default (def: any): Directive => coreReflectBodyCatch((arg: any) => coreReflectDirective().resolve(arg))(def);
