import { ngMocksUniverse } from '../common/ng-mocks-universe';

export default (): void => {
  ngMocksUniverse.builder = new Map();
  ngMocksUniverse.cacheMocks = new Map();
  ngMocksUniverse.cacheProviders = new Map();
  ngMocksUniverse.config = new Map();
  ngMocksUniverse.global = new Map();
  ngMocksUniverse.flags = new Set(['cacheModule', 'cacheComponent', 'cacheDirective', 'cacheProvider']);
  ngMocksUniverse.touches = new Set();
};
