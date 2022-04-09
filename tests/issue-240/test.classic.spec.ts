import { TestBed } from '@angular/core/testing';

import { MockPipe, MockRender, ngMocks } from 'ng-mocks';

import { ImpurePipe, PurePipe } from './fixtures';

// @see https://github.com/ike18t/ng-mocks/issues/240
describe('issue-240:classic', () => {
  let countPure = 0;
  let countImpure = 0;

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [
        MockPipe(PurePipe, () => {
          countPure += 1;

          return 'pure';
        }),
        MockPipe(ImpurePipe, () => {
          countImpure += 1;

          return 'impure';
        }),
      ],
    }).compileComponents(),
  );

  it('mocks impure pipes correctly', () => {
    const fixture = MockRender(
      `
        "pure:{{ "str" | pure }}"
        "impure:{{ "str" | impure }}"
      `,
    );

    // asserting default Behavior.
    expect(fixture.nativeElement.innerHTML).toContain('"pure:pure"');
    expect(fixture.nativeElement.innerHTML).toContain(
      '"impure:impure"',
    );
    expect(countPure).toEqual(1);
    expect(countImpure).toEqual(2);

    const pure = ngMocks.get(fixture.point, PurePipe);
    const impure = ngMocks.findInstance(ImpurePipe);

    // We do not have auto-spies, because we provided callbacks.
    // Now we need to install spies.
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

    // No changes because of spies.
    expect(countPure).toEqual(1);
    expect(countImpure).toEqual(2);
  });
});
