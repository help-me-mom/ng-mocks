import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class Service1 {
  public flag = false;
  public readonly name: string = 'Service1';
}

@Injectable()
class Service2 {
  public flag = false;
  public readonly name: string = 'Service2';
}

@NgModule({
  providers: [Service1, Service2],
})
class TargetModule {}

ngMocks.defaultMock(Service1, () => ({
  name: 'mock1',
}));
ngMocks.defaultMock(Service2, () => ({
  name: 'mock2',
}));

describe('ng-mocks-default-mock:precise', () => {
  const m1 = { flag: true };
  const m2 = { flag: true };

  beforeEach(() =>
    MockBuilder(null, TargetModule)
      .mock(Service1, m1)
      .mock(Service2, m2, { precise: true }),
  );

  it('overrides default mock', () => {
    const s1 = ngMocks.findInstance<any>(Service1);
    const s2 = ngMocks.findInstance<any>(Service2);

    // extended.
    expect(s1).not.toBe(m1);
    expect(s1.flag).toEqual(true);
    expect(s1.name).toEqual('mock1');

    // precised.
    expect(s2).toBe(m2);
    expect(s2.flag).toEqual(true);
    expect(s2.name).toEqual(undefined);
  });
});
