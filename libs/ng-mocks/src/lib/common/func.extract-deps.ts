import collectDeclarations from '../resolve/collect-declarations';

import coreConfig from './core.config';
import { flatten } from './core.helpers';
import { AnyDeclaration } from './core.types';
import { getNgType } from './func.get-ng-type';
import funcGetType from './func.get-type';

export const funcExtractDeps = (def: any, result: Set<AnyDeclaration<any>>): Set<AnyDeclaration<any>> => {
  const meta = collectDeclarations(def);
  const type = getNgType(def);
  // istanbul ignore if
  if (!type || type === 'Injectable') {
    return result;
  }

  const decorator = meta[type];
  for (const field of coreConfig.dependencies) {
    if (!decorator[field]) {
      continue;
    }

    for (const item of flatten(decorator[field])) {
      // istanbul ignore if: it is here for standalone things, however they don't support modules with providers.
      result.add(funcGetType(item));
    }
  }

  return result;
};
