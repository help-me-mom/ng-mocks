import { TestBed } from '@angular/core/testing';

import { MockRender, ngMocks } from 'ng-mocks';

import { ImpurePipe, PurePipe } from './fixtures';

// @see https://github.com/ike18t/ng-mocks/issues/240
describe('issue-240:guts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule(
      ngMocks.guts(null, [PurePipe, ImpurePipe]),
    ).compileComponents(),
  );

  it('mocks impure pipes correctly', () => {
    const fixture = MockRender(
      `
        "pure:{{ "str" | pure }}"
        "impure:{{ "str" | impure }}"
      `,
    );

    const pure = ngMocks.findInstance(fixture.point, PurePipe);
    const impure = ngMocks.findInstance(ImpurePipe);

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
