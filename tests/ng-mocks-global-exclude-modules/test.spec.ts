import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

import { Target1Module } from './fixtures';

ngMocks.globalExclude(Target1Module);

// The root module we pass into MockModule is not excluded despite the setting.
describe('ng-mocks-global-exclude-modules', () => {
  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [MockModule(Target1Module)],
    });
  });

  it('mocks Target1Component', () => {
    const fixture = MockRender('<target></target>');
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target></target>',
    );
  });
});
