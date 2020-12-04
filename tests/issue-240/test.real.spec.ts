import { TestBed } from '@angular/core/testing';
import { MockRender, ngMocks } from 'ng-mocks';

import { ImpurePipe, PurePipe } from './fixtures';

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
