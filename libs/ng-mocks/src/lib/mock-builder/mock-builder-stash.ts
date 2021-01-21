import coreConfig from '../common/core.config';
import ngMocksUniverse from '../common/ng-mocks-universe';

export class MockBuilderStash {
  protected data: Record<keyof any, any> = {};

  public backup(): void {
    this.data = {
      builtDeclarations: ngMocksUniverse.builtDeclarations,
      builtProviders: ngMocksUniverse.builtProviders,
      cacheDeclarations: ngMocksUniverse.cacheDeclarations,
      cacheProviders: ngMocksUniverse.cacheProviders,
      config: ngMocksUniverse.config,
      configInstance: ngMocksUniverse.configInstance,
      flags: ngMocksUniverse.flags,
      touches: ngMocksUniverse.touches,
    };

    ngMocksUniverse.builtDeclarations = new Map();
    ngMocksUniverse.builtProviders = new Map();
    ngMocksUniverse.cacheDeclarations = new Map();
    ngMocksUniverse.cacheProviders = new Map();
    ngMocksUniverse.config = new Map();
    ngMocksUniverse.configInstance = new Map();
    ngMocksUniverse.flags = new Set(coreConfig.flags);
    ngMocksUniverse.touches = new Set();
  }

  public restore(): void {
    for (const key of Object.keys(this.data)) {
      (ngMocksUniverse as any)[key] = (this.data as any)[key];
    }
  }
}
