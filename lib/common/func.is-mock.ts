import { MockConfig } from './mock';

export default <T>(value: T): value is T & MockConfig => {
  return value && typeof value === 'object' && !!(value as any).__ngMocksConfig;
};
