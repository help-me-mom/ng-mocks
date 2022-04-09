import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender } from 'ng-mocks';

import { AppModule, TargetComponent } from './fixtures';

// @see https://github.com/ike18t/ng-mocks/issues/241
describe('issue-241:classic', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [MockModule(AppModule)],
    }).compileComponents(),
  );

  it('it exports pipe', () => {
    const fixture = MockRender(TargetComponent);

    // A mock pipe returns nothing.
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target></target>',
    );
  });
});
