import helperMockService from '../mock-service/helper.mock-service';
import { MockedFunction } from '../mock-service/types';

export default <T = MockedFunction>(instance: any, override: any, style?: 'get' | 'set'): T => {
  if (typeof override === 'string') {
    return helperMockService.mock(instance, override, style);
  }

  // if someone is giving us a function, then we should swap instance and overrides.
  // so in the end the function can be called, but it also has all desired properties.
  let correctInstance = instance;
  let applyOverrides = override;
  const skipProps = ['__zone_symbol__unconfigurables'];
  if (typeof override === 'function') {
    correctInstance = helperMockService.createClone(override);
    applyOverrides = instance;
    skipProps.push(...Object.getOwnPropertyNames(correctInstance));
  }

  for (const key of Object.getOwnPropertyNames(applyOverrides)) {
    const desc = skipProps.indexOf(key) === -1 ? Object.getOwnPropertyDescriptor(applyOverrides, key) : undefined;
    if (desc && Object.prototype.hasOwnProperty.call(desc, 'value') && desc.value === undefined) {
      continue;
    }
    helperMockService.definePropertyDescriptor(correctInstance, key, desc);
  }

  return correctInstance;
};
