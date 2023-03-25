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
});
