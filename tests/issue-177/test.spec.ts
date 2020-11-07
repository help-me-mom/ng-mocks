// tslint:disable: prefer-function-over-method no-string-literal

import { MockService } from 'ng-mocks';

class Example {
  private _dynamicGet = 'return value from dynamicGet';

  private _dynamicMethod = 'return value from dynamicMethod';

  get dynamicGet() {
    return this._dynamicGet;
  }

  get hardCodedGet() {
    return 'return value from hardCodedGet';
  }

  dynamicMethod() {
    return this._dynamicMethod;
  }

  hardCodedMethod() {
    return 'return value from hardCodedMethod';
  }
}

describe('issue-177', () => {
  it('should mock get/set properties and methods', () => {
    const mockExample = MockService(Example);

    // Properties
    expect(mockExample.hardCodedGet).toBeUndefined();
    expect(mockExample.dynamicGet).toBeUndefined();
    mockExample['_dynamicGet'] = 'value set in test to _dynamicGet';
    expect(mockExample.dynamicGet).toBeUndefined();
    (mockExample as any).dynamicGet = 'test';
    expect(mockExample.dynamicGet).toBe('test');

    // Methods
    expect(mockExample.hardCodedMethod()).toBeUndefined();
    expect(mockExample.dynamicMethod()).toBeUndefined();
    mockExample['_dynamicMethod'] = 'value set in test to _dynamicMethod';
    expect(mockExample.dynamicMethod()).toBeUndefined();
  });
});
