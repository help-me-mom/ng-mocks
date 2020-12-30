import { AnyType } from './core.types';
import { ngMocksMockConfig } from './mock';

export default function (mock: AnyType<any>, source: AnyType<any>, config: ngMocksMockConfig = {}): void {
  Object.defineProperties(mock, {
    mockOf: { value: source },
    name: { value: `MockOf${source.name}` },
    nameConstructor: { value: mock.name },
  });
  mock.prototype.__ngMocksConfig = config;
}
