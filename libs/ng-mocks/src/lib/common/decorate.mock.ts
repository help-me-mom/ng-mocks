import coreDefineProperty from './core.define-property';
import { AnyType } from './core.types';
import { ngMocksMockConfig } from './mock';

export default function (mock: AnyType<any>, source: AnyType<any>, config: ngMocksMockConfig = {}): void {
  coreDefineProperty(mock, 'mockOf', source);
  coreDefineProperty(mock, 'nameConstructor', mock.name);
  coreDefineProperty(mock, 'name', `MockOf${source.name}`, true);

  // A13
  const props = (source as any).propDecorators;
  if (props) {
    coreDefineProperty(
      mock,
      'propDecorators',
      {
        ...props,
      },
      true,
    );
  }

  coreDefineProperty(mock.prototype, '__ngMocksConfig', config);
}
