import { Injector, Provider } from '@angular/core';
import * as angularCore from '@angular/core';

import { NG_MOCKS_ROOT_PROVIDERS, NG_MOCKS_TOUCHES } from '../../common/core.tokens';
import { isNgDef } from '../../common/func.is-ng-def';
import { isStandalone } from '../../common/func.is-standalone';
import { installRuntimeInject } from '../../common/ng-mocks-runtime-inject';

export default (keepDef: Set<any>): Provider | undefined => {
  const environmentInitializer = (angularCore as any).ENVIRONMENT_INITIALIZER;
  if (!environmentInitializer || keepDef.has(NG_MOCKS_ROOT_PROVIDERS)) {
    return undefined;
  }

  const declarations = new Set<any>();
  for (const def of keepDef) {
    if (isStandalone(def) && (isNgDef(def, 'c') || isNgDef(def, 'd') || isNgDef(def, 'p'))) {
      declarations.add(def);
    }
  }
  if (declarations.size === 0) {
    return undefined;
  }

  return {
    deps: [Injector, NG_MOCKS_TOUCHES],
    multi: true,
    provide: environmentInitializer,
    useFactory: (injector: Injector, touches: Set<any>) => () => installRuntimeInject(injector, declarations, touches),
  };
};
