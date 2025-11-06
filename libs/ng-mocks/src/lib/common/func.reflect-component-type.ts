import * as angularCore from '@angular/core';

import funcGetGlobal from './func.get-global';

/**
 * Helper function to safely access Angular's reflectComponentType API.
 * This API is available in Angular 14+ and is used for runtime reflection
 * of component metadata, particularly for signal inputs/outputs.
 */
export default (def: any): any => {
  const global = funcGetGlobal();

  // Use test override if present, otherwise use real API
  const reflectComponentType = global.__ngMocksReflectComponentType ?? (angularCore as any)['reflectComponentType'];

  if (!reflectComponentType) {
    return undefined;
  }

  return reflectComponentType(def);
};
