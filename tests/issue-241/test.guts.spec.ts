import { TestBed } from '@angular/core/testing';
import { MockRender, ngMocks } from 'ng-mocks';

import { AppModule, TargetComponent } from './fixtures';

describe('issue-241:guts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule(
      ngMocks.guts(TargetComponent, AppModule),
    ).compileComponents(),
  );

  it('it exports pipe', () => {
    const fixture = MockRender(TargetComponent);

    // A mock pipe returns nothing.
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target></target>',
    );
  });
});
