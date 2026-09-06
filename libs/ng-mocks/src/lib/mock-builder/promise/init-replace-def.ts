import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (replaceDef: Set<any>, defValue: Map<any, any>): void => {
  const builtDeclarations = ngMocksUniverse.builtDeclarations;
  const resolutions = ngMocksUniverse.config.get('ngMocksDepsResolution');
  for (const def of replaceDef) {
    builtDeclarations.set(def, defValue.get(def));
    resolutions.set(def, 'replace');
  }
};
