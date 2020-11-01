import { FactoryProvider, Injector } from '@angular/core';

import { ngMocksUniverse } from '../common/ng-mocks-universe';

export default <D, I>(def: D, mock: () => I): FactoryProvider => ({
  deps: [Injector],
  provide: def,
  useFactory: (injector?: Injector) => {
    const instance = mock();
    const config = ngMocksUniverse.config.get(def);
    if (injector && instance && config && config.init) {
      config.init(instance, injector);
    }
    return instance;
  },
});
