import { MockService, ngMocks } from 'ng-mocks';

class Example {
  private readonly privateDynamicGet = 'return value from dynamicGet';

  private readonly privateDynamicMethod =
    'return value from dynamicMethod';

  public get dynamicGet() {
    return this.privateDynamicGet;
  }

  public get hardCodedGet() {
    return 'return value from hardCodedGet';
  }

  public dynamicMethod() {
    return this.privateDynamicMethod;
  }

  public hardCodedMethod() {
    return 'return value from hardCodedMethod';
  }
}

// @see https://github.com/ike18t/ng-mocks/issues/177
describe('issue-177', () => {
  it('should mock get/set properties and methods', () => {
    const mockExample = MockService(Example);

    // Properties
    expect(mockExample.hardCodedGet).toBeUndefined();
    expect(mockExample.dynamicGet).toBeUndefined();
    ngMocks.stub(mockExample, {
      privateDynamicGet: 'value set in test to _dynamicGet',
    } as any);
    expect(mockExample.dynamicGet).toBeUndefined();
    (mockExample as any).dynamicGet = 'test';
    expect(mockExample.dynamicGet).toBe('test');

    // Methods
    expect(mockExample.hardCodedMethod()).toBeUndefined();
    expect(mockExample.dynamicMethod()).toBeUndefined();
    ngMocks.stub(mockExample, {
      privateDynamicMethod: 'value set in test to _dynamicMethod',
    } as any);
    expect(mockExample.dynamicMethod()).toBeUndefined();
  });
});
