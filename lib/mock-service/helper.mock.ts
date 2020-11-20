import mockServiceHelper from './helper';
import { MockedFunction } from './types';

export default <T = MockedFunction>(instance: any, name: string, ...args: string[]): T => {
  let accessType: 'get' | 'set' | undefined;
  let mockName: string | undefined;

  if (args.length && args[0] !== 'get' && args[0] !== 'set') {
    mockName = args[0];
  } else if (args.length && (args[0] === 'get' || args[0] === 'set')) {
    accessType = args[0] as any;
    mockName = args[1];
  }

  const def = Object.getOwnPropertyDescriptor(instance, name);
  if (def && def[accessType || 'value']) {
    return def[accessType || 'value'];
  }

  /* istanbul ignore next */
  const detectedMockName = `${
    mockName
      ? mockName
      : typeof instance.prototype === 'function'
      ? instance.prototype.name
      : typeof instance.constructor === 'function'
      ? instance.constructor.name
      : 'unknown'
  }.${name}${accessType ? `:${accessType}` : ''}`;
  const mock: any = mockServiceHelper.mockFunction(detectedMockName, !!accessType);

  const mockDef: PropertyDescriptor = {
    // keeping setter if we adding getter
    ...(accessType === 'get' && def && def.set
      ? {
          set: def.set,
        }
      : {}),

    // keeping getter if we adding setter
    ...(accessType === 'set' && def && def.get
      ? {
          get: def.get,
        }
      : {}),

    // to allow replacement for functions
    ...(accessType
      ? {}
      : {
          writable: true,
        }),

    [accessType || 'value']: mock,
    configurable: true,
    enumerable: true,
  };

  if (mockDef.get && mockDef.set && (mockDef.get as any).__ngMocks && (mockDef.set as any).__ngMocks) {
    (mockDef.set as any).__ngMocksSet((val: any) => (mockDef.get as any).__ngMocksGet(val));
  }

  Object.defineProperty(instance, name, mockDef);

  return mock;
};
