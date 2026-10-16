import equalRenderConfigs from './equal-render-configs';

export default (source: Record<string, unknown>, destination: Record<string, unknown>): boolean => {
  if (destination === source) {
    return true;
  }
  for (const key of ['dependency', 'export', 'exportAll', 'shallow', 'onRoot', 'precise']) {
    if (destination[key] !== source[key]) {
      return false;
    }
  }

  return equalRenderConfigs(source.render, destination.render);
};
