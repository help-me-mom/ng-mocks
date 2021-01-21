import { AnyType } from './core.types';
import { ngMocksMockConfig } from './mock';

export default function (mock: AnyType<any>, source: AnyType<any>, config: ngMocksMockConfig = {}): void {
  Object.defineProperties(mock, {
    mockOf: { value: source },
    name: { value: `MockOf${source.name}` },
    nameConstructor: { value: mock.name },
  });
  Object.defineProperty(mock.prototype, '__ngMocksConfig', {
    configurable: true,
    enumerable: false,
    value: config,
    writable: true,
  });
}
