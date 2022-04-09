import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

import {
  Fake1Component,
  Target1Component,
  Target2Component,
  Target2Module,
  Target3Module,
} from './fixtures';

ngMocks.globalExclude(Target2Component);
ngMocks.globalKeep(Target2Module);
ngMocks.globalReplace(Target1Component, Fake1Component);

describe('ng-mocks-global-keep-modules', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [MockModule(Target3Module)],
    });
  });

  it('replaces Target1Component', () => {
    const fixture = MockRender('<target1></target1>');
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target1>fake1</target1>',
    );
  });

  it('excludes Target2Component', () => {
    expect(() => MockRender('<target2></target2>')).toThrow();
  });

  it('keeps Normal2Component', () => {
    const fixture = MockRender('<normal2></normal2>');
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<normal2>normal2</normal2>',
    );
  });
});
