import { InjectionToken, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

const token = new InjectionToken<{ value: string }>('TOKEN');
const tokenFail = new InjectionToken<{ value: string }>('TOKEN1');

@NgModule({
  providers: [
    {
      provide: token,
      useValue: {
        value: 'target',
      },
    },
  ],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('mock-render-tokens', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('renders tokens', () => {
    const fixture = MockRender(token);
    expect(fixture.point.componentInstance).toEqual(
      assertion.any(Object),
    );
    expect(fixture.point.componentInstance.value).toEqual('target');
  });

  it('fails on unprovided tokens', () => {
    expect(() => MockRender(tokenFail)).toThrow();
  });
});
