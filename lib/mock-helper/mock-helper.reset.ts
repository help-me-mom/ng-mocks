import ngMocksUniverse from '../common/ng-mocks-universe';

export default (): void => {
  ngMocksUniverse.builtDeclarations = new Map();
  ngMocksUniverse.cacheDeclarations = new Map();
  ngMocksUniverse.cacheProviders = new Map();
  ngMocksUniverse.config = new Map();
  ngMocksUniverse.global = new Map();
  ngMocksUniverse.flags = new Set([
    'cacheModule',
    'cacheComponent',
    'cacheDirective',
    'cacheProvider',
    'correctModuleExports',
  ]);
  ngMocksUniverse.touches = new Set();
};
