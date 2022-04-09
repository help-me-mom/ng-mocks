import { InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, ngMocks } from 'ng-mocks';

const TOKEN1 = new InjectionToken('TOKEN1');
const TOKEN2 = new InjectionToken('TOKEN2');

@NgModule({
  providers: [
    {
      provide: TOKEN1,
      useValue: 'token1',
    },
    {
      provide: TOKEN2,
      useValue: 'token2',
    },
  ],
})
class TargetModule {}

ngMocks.defaultMock(TOKEN1, () => 'mockToken1');
ngMocks.defaultMock(TOKEN2, () => 'mockToken2');
ngMocks.defaultMock(TOKEN2);

describe('ng-mocks-default-mock:unset', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [MockModule(TargetModule)],
    }).compileComponents(),
  );

  it('unsets defaultMock', () => {
    const t1 = TestBed.get(TOKEN1);
    const t2 = TestBed.get(TOKEN2);

    // default mock.
    expect(t1).toEqual('mockToken1');
    // default mock was unset.
    expect(t2).toEqual('');
  });
});
