import coreReflectJit from './core.reflect.jit';
import { AnyType } from './core.types';

export const isNgType = (declaration: AnyType<any>, type: string): boolean =>
  coreReflectJit()
    .annotations(declaration)
    .some(annotation => annotation.ngMetadataName === type);
