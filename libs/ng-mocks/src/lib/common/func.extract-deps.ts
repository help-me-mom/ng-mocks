import collectDeclarations from '../resolve/collect-declarations';

import coreConfig from './core.config';
import { flatten } from './core.helpers';
import { AnyDeclaration } from './core.types';
import { getNgType } from './func.get-ng-type';
import funcGetType from './func.get-type';

export const funcExtractDeps = (
  def: any,
  result: Set<AnyDeclaration<any>>,
  recursive = false,
  visited = new Set<AnyDeclaration<any>>(),
): Set<AnyDeclaration<any>> => {
  const visit = (current: any): void => {
    if (visited.has(current)) {
      return;
    }
    visited.add(current);

    const meta = collectDeclarations(current);
    const type = getNgType(current);
    // istanbul ignore if
    if (!type || type === 'Injectable') {
      return;
    }

    const decorator = meta[type];
    for (const field of coreConfig.dependencies) {
      if (!decorator[field]) {
        continue;
      }

      for (const item of flatten(decorator[field])) {
        // istanbul ignore if: it is here for standalone things, however they don't support modules with providers.
        const itemType = funcGetType(item);
        result.add(itemType);
        if (recursive) {
          visit(itemType);
        }
      }
    }
  };

  visit(def);

  return result;
};
