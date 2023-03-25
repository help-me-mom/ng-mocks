import { TestBed } from '@angular/core/testing';

import { MockRender } from 'ng-mocks';

import { AppModule, TargetComponent } from './fixtures';

// @see https://github.com/help-me-mom/ng-mocks/issues/241
describe('issue-241:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents(),
  );

  it('it exports pipe', () => {
    const fixture = MockRender(TargetComponent);

    // A real pipe returns the string's length.
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target-241>6</target-241>',
    );
  });
});
