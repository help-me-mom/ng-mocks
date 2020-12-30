import coreReflectJit from './core.reflect.jit';
import { Type } from './core.types';

export const isNgType = (declaration: Type<any>, type: string): boolean =>
  coreReflectJit()
    .annotations(declaration)
    .some(annotation => annotation.ngMetadataName === type);
