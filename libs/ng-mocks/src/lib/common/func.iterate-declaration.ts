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
    // A Service is categorized as Injectable, but its metadata is stored under Service.
    const decoratorMeta = decorator === 'Injectable' ? (meta.Injectable ?? meta.Service) : meta[decorator];
    for (const key of coreConfig.dependencies) {
      if (!decoratorMeta[key]) {
        continue;
      }
      for (const def of flatten(decoratorMeta[key])) {
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
