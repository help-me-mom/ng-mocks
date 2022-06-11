import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, MockProvider, ngMocks } from 'ng-mocks';

const myToken = new InjectionToken('MY_TOKEN');

// @see https://github.com/ike18t/ng-mocks/issues/1256
// global MockInstance doesn't reset own customizations
describe('issue-1256', () => {
  MockInstance.scope();

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [MockProvider(myToken, { test: 1 })],
    }).compileComponents(),
  );

  it('changes value #1', () => {
    MockInstance(myToken, () => ({ test: 2 }));
    const value = ngMocks.findInstance<any>(myToken);
    expect(value.test).toEqual(2);
  });

  it('uses the default value', () => {
    const value = ngMocks.findInstance<any>(myToken);
    expect(value.test).toEqual(1);
  });
});
