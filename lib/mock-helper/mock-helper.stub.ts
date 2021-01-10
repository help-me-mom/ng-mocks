import helperMockService from '../mock-service/helper.mock-service';
import { MockedFunction } from '../mock-service/types';

export default <T = MockedFunction>(instance: any, override: any, style?: 'get' | 'set'): T => {
  if (typeof override === 'string') {
    return helperMockService.mock(instance, override, style);
  }
  for (const key of Object.getOwnPropertyNames(override)) {
    const def = Object.getOwnPropertyDescriptor(override, key);
    // istanbul ignore else
    if (def) {
      def.configurable = true;
      Object.defineProperty(instance, key, def);
    }
  }

  return instance;
};
