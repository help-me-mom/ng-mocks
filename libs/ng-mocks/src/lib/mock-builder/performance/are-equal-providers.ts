import { flatten } from '../../common/core.helpers';

const areEqualProviderDefs = (thisDef: any, prototypeDef: any, ...keys: string[]) => {
  for (const key of keys) {
    if (prototypeDef && thisDef && prototypeDef[key] && thisDef[key] && prototypeDef[key] === thisDef[key]) {
      return true;
    }
  }

  return prototypeDef === thisDef;
};

export default (prototype: any, source: any): boolean => {
  if (Array.isArray(prototype) !== Array.isArray(source)) {
    return false;
  }

  const [prototypeDefs, thisDefs] = [flatten(prototype), flatten(source)];
  if (prototypeDefs.length !== thisDefs.length) {
    return false;
  }

  for (let index = 0; index < prototypeDefs.length; index += 1) {
    const [prototypeDef, thisDef] = [prototypeDefs[index], thisDefs[index]];

    if (prototypeDef && thisDef && prototypeDef.multi !== thisDef.multi) {
      return false;
    }
    if (areEqualProviderDefs(thisDef, prototypeDef, 'useValue', 'useClass', 'useFactory', 'useExisting')) {
      continue;
    }

    return false;
  }

  return true;
};
