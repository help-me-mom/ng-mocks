import helperMockService from '../mock-service/helper.mock-service';
import helperUseFactory from '../mock-service/helper.use-factory';

import coreConfig from './core.config';
import coreDefineProperty from './core.define-property';
import coreReflectProvidedIn from './core.reflect.provided-in';
import ngMocksUniverse from './ng-mocks-universe';

interface RuntimeInjectConfig {
  injector: any;
  mocks: Map<any, any>;
  restore: () => void;
  touches: Set<any>;
}

const active: RuntimeInjectConfig[] = [];
const installed = new Set<RuntimeInjectConfig>();

const shouldMock = (provide: any, config: RuntimeInjectConfig): boolean => {
  if (
    active.indexOf(config) === -1 ||
    !helperMockService.mockFunction.customMockFunction ||
    typeof provide !== 'function' ||
    config.touches.has(provide) ||
    coreConfig.neverMockProvidedFunction.indexOf(provide.name) !== -1
  ) {
    return false;
  }

  const resolution = ngMocksUniverse.getResolution(provide);
  if (resolution === 'keep' || resolution === 'exclude') {
    return false;
  }

  return coreReflectProvidedIn(provide) === 'root';
};

const getMock = (provide: any, config: RuntimeInjectConfig): any => {
  if (!config.mocks.has(provide)) {
    const provider = helperUseFactory(provide);
    config.mocks.set(provide, provider.useFactory(config.injector));
  }

  return config.mocks.get(provide);
};

const installInjector = (config: RuntimeInjectConfig, restorers: Array<() => void>): void => {
  const injector = config.injector;
  const ownDescriptor = Object.getOwnPropertyDescriptor(injector, 'get');
  const original = injector.get;

  coreDefineProperty(
    injector,
    'get',
    function (this: any, provide: any, ...args: any[]): any {
      if (config.mocks.has(provide)) {
        return config.mocks.get(provide);
      }

      const mock = shouldMock(provide, config);
      let activeIndex = active.length - 1;
      while (activeIndex >= 0 && active[activeIndex] !== config) {
        activeIndex -= 1;
      }
      if (activeIndex === -1) {
        return original.call(this, provide, ...args);
      }

      active.splice(activeIndex, 1);
      try {
        return mock ? getMock(provide, config) : original.call(this, provide, ...args);
      } finally {
        active.splice(activeIndex, 0, config);
      }
    },
    true,
  );

  restorers.push(() => {
    if (ownDescriptor) {
      Object.defineProperty(injector, 'get', ownDescriptor);
    } else {
      delete injector.get;
    }
  });
};

const installDeclaration = (declaration: any, config: RuntimeInjectConfig, restorers: Array<() => void>): void => {
  const definition = declaration.ɵcmp ?? declaration.ɵdir ?? declaration.ɵpipe;
  const factoryDescriptor = definition && Object.getOwnPropertyDescriptor(definition, 'factory');
  const definitionFactory = definition?.factory;
  const factory = definitionFactory ?? declaration.ɵfac ?? declaration.ngFactoryDef;
  if (!definition || !factory) {
    return;
  }

  definition.factory = function (this: any, ...args: any[]): any {
    active.push(config);
    try {
      return factory.apply(this, args);
    } finally {
      active.pop();
    }
  };

  restorers.push(() => {
    if (factoryDescriptor) {
      Object.defineProperty(definition, 'factory', factoryDescriptor);
    } else {
      delete definition.factory;
    }
  });
};

export const installRuntimeInject = (injector: any, declarations: Set<any>, touches: Set<any>): void => {
  const restorers: Array<() => void> = [];
  const config: RuntimeInjectConfig = {
    injector,
    mocks: new Map(),
    restore: () => {
      while (restorers.length > 0) {
        restorers.pop()?.();
      }
      for (let index = active.length - 1; index >= 0; index -= 1) {
        if (active[index] === config) {
          active.splice(index, 1);
        }
      }
      installed.delete(config);
    },
    touches,
  };

  installInjector(config, restorers);
  for (const declaration of declarations) {
    installDeclaration(declaration, config, restorers);
  }

  installed.add(config);
  injector.onDestroy?.(config.restore);
};

export const resetRuntimeInject = (): void => {
  for (const config of installed) {
    config.restore();
  }
};
