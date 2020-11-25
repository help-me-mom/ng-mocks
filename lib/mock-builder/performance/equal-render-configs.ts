import equalRenderDefs from './equal-render-defs';

const objectsDiffer = (destination: any, source: any): boolean => {
  if (Object.keys(destination).length !== Object.keys(source).length) {
    return true;
  }
  for (const key of Object.keys(destination)) {
    if (!equalRenderDefs(destination[key], source[key])) {
      return true;
    }
  }

  return false;
};

export default (source: any, destination: any): boolean => {
  if (!equalRenderDefs(destination, source)) {
    return false;
  }
  if (typeof destination !== 'object' || typeof source !== 'object') {
    return true;
  }
  if (objectsDiffer(destination, source)) {
    return false;
  }

  return true;
};
