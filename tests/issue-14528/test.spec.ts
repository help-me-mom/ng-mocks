import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockProvider } from 'ng-mocks';

let constructorCalls = 0;

@Injectable({ providedIn: 'root' })
class SideEffectService {
  public constructor() {
    constructorCalls += 1;
  }

  public doThing(): string {
    return 'real';
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14528
describe('issue-14528', () => {
  beforeEach(() => {
    constructorCalls = 0;
    TestBed.configureTestingModule({
      providers: [
        MockProvider(SideEffectService, {
          doThing: () => 'mocked',
        }),
      ],
    });
  });

  it('does not run a mocked service constructor when applying overrides', () => {
    expect(constructorCalls).toEqual(0);

    const anyTestBed: any = TestBed;
    const service = anyTestBed.inject
      ? anyTestBed.inject(SideEffectService)
      : anyTestBed.get(SideEffectService);

    expect(service.doThing()).toEqual('mocked');
    expect(constructorCalls).toEqual(0);
  });
});
