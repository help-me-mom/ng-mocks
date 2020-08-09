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
    const mockedExample = MockService(Example);

    // Properties
    expect(mockedExample.hardCodedGet).toBeUndefined();
    expect(mockedExample.dynamicGet).toBeUndefined();
    mockedExample['_dynamicGet'] = 'value set in test to _dynamicGet';
    expect(mockedExample.dynamicGet).toBeUndefined();
    (mockedExample as any).dynamicGet = 'test';
    expect(mockedExample.dynamicGet).toBe('test');

    // Methods
    expect(mockedExample.hardCodedMethod()).toBeUndefined();
    expect(mockedExample.dynamicMethod()).toBeUndefined();
    mockedExample['_dynamicMethod'] = 'value set in test to _dynamicMethod';
    expect(mockedExample.dynamicMethod()).toBeUndefined();
  });
});
