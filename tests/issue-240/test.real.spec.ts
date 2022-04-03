import { TestBed } from '@angular/core/testing';
import { MockRender, ngMocks } from 'ng-mocks';

import { ImpurePipe, PurePipe } from './fixtures';

// @see https://github.com/ike18t/ng-mocks/issues/240
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

    ngMocks.stubMember(
      pure,
      'transform',
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn(),
    );
    ngMocks.stubMember(
      impure,
      'transform',
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn(),
    );

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
