import { AnyType } from './core.types';
import { ngMocksMockConfig } from './mock';

export default function (base: AnyType<any>, mockClass: AnyType<any>, config: ngMocksMockConfig = {}): void {
  Object.defineProperties(base, {
    mockOf: { value: mockClass },
    name: { value: `MockOf${mockClass.name}` },
    nameConstructor: { value: base.name },
  });
  base.prototype.__ngMocksConfig = config;
}
