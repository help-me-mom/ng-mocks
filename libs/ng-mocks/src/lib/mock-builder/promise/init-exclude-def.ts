import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (excludeDef: Set<any>): void => {
  const builtDeclarations = ngMocksUniverse.builtDeclarations;
  const builtProviders = ngMocksUniverse.builtProviders;
  const resolutions = ngMocksUniverse.config.get('ngMocksDepsResolution');
  for (const def of excludeDef) {
    builtDeclarations.set(def, null);
    builtProviders.set(def, null);
    resolutions.set(def, 'exclude');
  }
};
