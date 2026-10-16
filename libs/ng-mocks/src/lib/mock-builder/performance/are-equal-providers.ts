import { flatten } from '../../common/core.helpers';

const areEqualDependencies = (source: unknown, destination: unknown): boolean => {
  if (source === destination) {
    return true;
  }
  if (!Array.isArray(source) || !Array.isArray(destination) || source.length !== destination.length) {
    return false;
  }

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] !== destination[index]) {
      return false;
    }
  }

  return true;
};

const areEqualProviderDefs = (source: unknown, destination: unknown): boolean => {
  if (source === destination) {
    return true;
  }
  if (!source || !destination || typeof source !== 'object' || typeof destination !== 'object') {
    return false;
  }

  const sourceDef = source as Record<string, unknown>;
  const destinationDef = destination as Record<string, unknown>;
  if (
    sourceDef.provide !== destinationDef.provide ||
    sourceDef.multi !== destinationDef.multi ||
    !areEqualDependencies(sourceDef.deps, destinationDef.deps)
  ) {
    return false;
  }
  for (const key of ['useValue', 'useClass', 'useFactory', 'useExisting']) {
    if (key in sourceDef || key in destinationDef) {
      return key in sourceDef && key in destinationDef && sourceDef[key] === destinationDef[key];
    }
  }

  return false;
};

export default (prototype: unknown, source: unknown): boolean => {
  if (Array.isArray(prototype) !== Array.isArray(source)) {
    return false;
  }

  const [prototypeDefs, thisDefs] = [flatten(prototype), flatten(source)];
  if (prototypeDefs.length !== thisDefs.length) {
    return false;
  }

  for (let index = 0; index < prototypeDefs.length; index += 1) {
    if (!areEqualProviderDefs(prototypeDefs[index], thisDefs[index])) {
      return false;
    }
  }

  return true;
};
