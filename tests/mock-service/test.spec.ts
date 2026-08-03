import { MockService } from 'ng-mocks';

describe('mock-service', () => {
  it('detects unnamed classes', () => {
    const instance = MockService(
      class {
        private readonly value = 'unnamed';

        public echo1() {
          return this.value;
        }
      },
    );
    expect(instance.echo1()).toBeUndefined();
  });

  it('adds prefixes', () => {
    const instance = MockService(
      class {
        private readonly value = 'unnamed';

        public echo1() {
          return this.value;
        }
      },
      'prefix',
    );
    expect(instance.echo1()).toBeUndefined();
  });

  it('mocks functions with a class prefix as functions', () => {
    const classify = () => undefined;
    (classify as any).prototype = {};
    classify.toString = () => 'function classify() {}';

    expect(typeof MockService(classify)).toEqual('function');
  });

  it('mocks downleveled classes with regexp characters as classes', () => {
    const target$ = () => undefined;
    (target$ as any).prototype = {};
    target$.toString = () =>
      'function target$() { classCallCheck(this, target$); }';

    expect(typeof MockService(target$)).toEqual('object');
  });
});
