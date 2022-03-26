import funcGetName from '../common/func.get-name';

import helperMockService from './helper.mock-service';
import { MockedFunction } from './types';

// istanbul ignore next
const createName = (name: string, mockName?: string, instance?: any, accessType?: string) =>
  `${
    mockName ? mockName : typeof instance.prototype === 'function' ? instance.prototype.name : funcGetName(instance)
  }.${name}${accessType || ''}`;

const generateMockDef = (def: any, mock: any, accessType?: string): PropertyDescriptor => ({
  ...(accessType === 'get' && def && def.set
    ? {
        set: def.set,
      }
    : {}),

  ...(accessType === 'set' && def && def.get
    ? {
        get: def.get,
      }
    : {}),

  ...(accessType
    ? {}
    : {
        writable: true,
      }),

  [accessType || 'value']: mock,
  configurable: true,
  enumerable: true,
});

const parseArgs = (
  args: any[],
): {
  accessType?: 'get' | 'set';
  mockName?: string;
} => {
  let accessType: 'get' | 'set' | undefined;
  let mockName: string | undefined;

  if (args.length && args[0] !== 'get' && args[0] !== 'set') {
    mockName = args[0];
  } else if (args.length && (args[0] === 'get' || args[0] === 'set')) {
    accessType = args[0];
    mockName = args[1];
  }

  return { accessType, mockName };
};

export default <T = MockedFunction>(instance: any, name: string, ...args: Array<string | undefined>): T => {
  const { accessType, mockName } = parseArgs(args);

  const def = Object.getOwnPropertyDescriptor(instance, name);
  if (def && def[accessType || 'value']) {
    return def[accessType || 'value'];
  }

  const detectedMockName = createName(name, mockName, instance, accessType);
  const mock: any = helperMockService.mockFunction(detectedMockName, !!accessType);

  const mockDef = generateMockDef(def, mock, accessType);
  if (mockDef.get && mockDef.set && (mockDef.get as any).__ngMocks && (mockDef.set as any).__ngMocks) {
    (mockDef.set as any).__ngMocksSet((val: any) => (mockDef.get as any).__ngMocksGet(val));
  }

  Object.defineProperty(instance, name, mockDef);

  return mock;
};
