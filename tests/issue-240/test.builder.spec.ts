import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { ImpurePipe, PurePipe } from './fixtures';

describe('issue-240:builder', () => {
  beforeEach(() => MockBuilder().mock(PurePipe).mock(ImpurePipe));

  it('mocks impure pipes correctly', () => {
    const fixture = MockRender(
      `
        "pure:{{ "str" | pure }}"
        "impure:{{ "str" | impure }}"
      `,
    );

    const pure = ngMocks.findInstance(PurePipe);
    const impure = ngMocks.get(fixture.point, ImpurePipe);

    spyOn(pure, 'transform');
    spyOn(impure, 'transform');

    expect(pure.transform).toHaveBeenCalledTimes(0);
    expect(impure.transform).toHaveBeenCalledTimes(0);

    fixture.detectChanges();
    expect(pure.transform).toHaveBeenCalledTimes(0);
    expect(impure.transform).toHaveBeenCalledTimes(2);

    fixture.detectChanges();
    expect(pure.transform).toHaveBeenCalledTimes(0);
    expect(impure.transform).toHaveBeenCalledTimes(4);
  });
});
