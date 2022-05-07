import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { ImpurePipe, PurePipe } from './fixtures';

// @see https://github.com/ike18t/ng-mocks/issues/240
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
    const impure = ngMocks.findInstance(fixture.point, ImpurePipe);

    // Without auto-spy we need the code below.
    // Calls would start with 0.
    // spyOn(pure, 'transform');
    // spyOn(impure, 'transform');

    expect(pure.transform).toHaveBeenCalledTimes(1);
    expect(impure.transform).toHaveBeenCalledTimes(2);

    fixture.detectChanges();
    expect(pure.transform).toHaveBeenCalledTimes(1);
    expect(impure.transform).toHaveBeenCalledTimes(4);

    fixture.detectChanges();
    expect(pure.transform).toHaveBeenCalledTimes(1);
    expect(impure.transform).toHaveBeenCalledTimes(6);
  });
});
