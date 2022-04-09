import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

import {
  Target1Module,
  Target2Module,
  Target3Module,
} from './fixtures';

ngMocks.globalReplace(Target1Module, Target2Module);

describe('ng-mocks-global-replace-modules', () => {
  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [MockModule(Target3Module)],
    });
  });

  it('replaces Target1Module with Target2Module', () => {
    const fixture = MockRender('<target></target>');
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target>target2</target>',
    );
  });
});
