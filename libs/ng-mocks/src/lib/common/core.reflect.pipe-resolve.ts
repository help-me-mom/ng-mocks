import { Pipe } from '@angular/core';

import coreReflectBodyCatch from './core.reflect.body-catch';

export default (def: any): Pipe =>
  coreReflectBodyCatch((arg: any) => {
    if (Array.isArray(arg.__annotations__)) {
      for (const declaration of arg.__annotations__) {
        if (declaration.ngMetadataName === 'Pipe') {
          return declaration;
        }
      }
    }
    if (Array.isArray(arg.decorators)) {
      for (const declaration of arg.decorators) {
        if (declaration.type.prototype.ngMetadataName === 'Pipe') {
          return declaration.args[0];
        }
      }
    }

    throw new Error('Cannot resolve declarations');
  })(def);
