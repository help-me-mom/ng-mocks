import { Pipe } from '@angular/core';

import collectDeclarations from '../resolve/collect-declarations';

import coreReflectBodyCatch from './core.reflect.body-catch';

export default (def: any): Pipe & { standalone?: boolean } =>
  coreReflectBodyCatch((arg: any) => {
    const declaration = collectDeclarations(arg);
    if (declaration.Pipe) {
      return declaration.Pipe;
    }

    throw new Error('Cannot resolve declarations');
  })(def);
