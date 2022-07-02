import { Observable, Subject } from 'rxjs';

import { MockService, ngMocks } from 'ng-mocks';

class MyService {
  public readonly onErrorSet$?: Observable<string>;
  public readonly onSuccessSet$?: Observable<string>;
  public readonly onWarningSet$?: Observable<string>;

  protected value = 'MyService';

  public stringMethod(): string {
    return this.value;
  }

  public voidMethod(sum: string): void {
    this.value = `${this.value}${sum}`;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/166
describe('issue-166', () => {
  it('accepts spies', () => {
    const spy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    // in case of jest
    // const spy = jest.fn();
    const stub = ngMocks.stub(MockService(MyService), {
      onErrorSet$: new Subject<string>(),
      onWarningSet$: new Subject<string>(),
      stringMethod: spy,
      voidMethod: spy,
    });
    ngMocks.stub(stub, 'onSuccessSet$', 'get');

    expect(stub).toBeDefined();
  });
});
