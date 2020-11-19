import { MockService } from 'ng-mocks';

describe('mock-service-override', () => {
  class MyClass {
    protected name = 'real';

    public echo1(): string {
      return this.name;
    }

    public echo2(): string {
      return this.name;
    }
  }

  it('overrides partially', () => {
    const instance = MockService(MyClass, { echo2: () => 'mock' });
    expect(instance.echo1()).toBeUndefined();
    expect(instance.echo2()).toEqual('mock');
  });
});
