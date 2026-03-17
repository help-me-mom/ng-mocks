import { TestBed } from '@angular/core/testing';

import { MockRender, ngMocks } from 'ng-mocks';

import { createMock } from '../mock-helpers';

import { ImpurePipe, PurePipe } from './fixtures';

// @see https://github.com/help-me-mom/ng-mocks/issues/240
describe('issue-240:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [PurePipe, ImpurePipe],
    }).compileComponents(),
  );

  it('calls pipes differently', () => {
    const fixture = MockRender(
      `
        "pure:{{ "str" | pure }}"
        "impure:{{ "str" | impure }}"
      `,
    );

    const pure = ngMocks.findInstance(PurePipe);
    const impure = ngMocks.findInstance(ImpurePipe);

    ngMocks.stubMember(pure, 'transform', createMock());
    ngMocks.stubMember(impure, 'transform', createMock());

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
