import equalRenderDefs from './equal-render-defs';

export default (source: any, destination: any): boolean => {
  if (!equalRenderDefs(destination, source)) {
    return false;
  }
  if (typeof destination !== 'object' || typeof source !== 'object') {
    return true;
  }
  if (Object.keys(destination).length !== Object.keys(source).length) {
    return false;
  }
  for (const key of Object.keys(destination)) {
    if (!equalRenderDefs(destination[key], source[key])) {
      return false;
    }
  }

  return true;
};
