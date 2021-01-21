import equalRenderConfigs from './equal-render-configs';

export default (source: any, destination: any): boolean => {
  if (destination === source) {
    return true;
  }
  if (destination.dependency !== source.dependency) {
    return false;
  }
  if (destination.export !== source.export) {
    return false;
  }
  if (destination.exportAll !== source.exportAll) {
    return false;
  }
  if (!equalRenderConfigs(source.render, destination.render)) {
    return false;
  }

  return true;
};
