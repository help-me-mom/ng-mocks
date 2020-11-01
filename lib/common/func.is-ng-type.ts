import { jitReflector } from './core.reflect';
import { Type } from './core.types';

export const isNgType = (declaration: Type<any>, type: string): boolean =>
  jitReflector.annotations(declaration).some(annotation => annotation.ngMetadataName === type);
