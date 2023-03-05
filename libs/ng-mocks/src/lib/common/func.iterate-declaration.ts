import collectDeclarations from '../resolve/collect-declarations';

import coreConfig from './core.config';
import { flatten } from './core.helpers';
import { AnyDeclaration } from './core.types';
import funcGetType from './func.get-type';

const iterator = <T = any>(
  source: AnyDeclaration<T>,
  callback: (source: AnyDeclaration<T>) => void,
  scanned = new Set<any>(),
): void => {
  const meta = collectDeclarations(source);
  for (const decorator of meta.decorators) {
    for (const key of coreConfig.dependencies) {
      if (!meta[decorator][key]) {
        continue;
      }
      for (const def of flatten(meta[decorator][key])) {
        const declaration = funcGetType(def);
        if (!declaration || scanned.has(declaration)) {
          continue;
        }
        scanned.add(declaration);
        callback(declaration);
        iterator(declaration, callback, scanned);
      }
    }
  }
};

export default iterator;
