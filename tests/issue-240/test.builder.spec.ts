import { VERSION } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { ImpurePipe, PurePipe } from './fixtures';

// @see https://github.com/help-me-mom/ng-mocks/issues/240
describe('issue-240:builder', () => {
  beforeEach(() => MockBuilder().mock(PurePipe).mock(ImpurePipe));

  it('mocks impure pipes correctly', () => {
    // In Angular 21+, fixture.detectChanges() uses ChangeDetectorRef.detectChanges()
    // which runs impure pipes differently than ApplicationRef.tick() in prior versions.
    const isA21Plus = Number.parseInt(VERSION.major, 10) >= 21;

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
    expect(impure.transform).toHaveBeenCalledTimes(isA21Plus ? 1 : 2);

    fixture.detectChanges();
    expect(pure.transform).toHaveBeenCalledTimes(1);
    expect(impure.transform).toHaveBeenCalledTimes(isA21Plus ? 2 : 4);

    fixture.detectChanges();
    expect(pure.transform).toHaveBeenCalledTimes(1);
    expect(impure.transform).toHaveBeenCalledTimes(isA21Plus ? 3 : 6);
  });
});
