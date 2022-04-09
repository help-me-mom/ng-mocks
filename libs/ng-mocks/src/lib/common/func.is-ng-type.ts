import collectDeclarations from '../resolve/collect-declarations';

import { AnyType } from './core.types';

export const isNgType = (declaration: AnyType<any>, type: string): boolean => {
  const declarations = collectDeclarations(declaration);

  return !!declarations[type];
};
