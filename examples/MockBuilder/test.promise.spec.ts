import { MockBuilder, MockRender } from 'ng-mocks';

import {
  My1Component,
  My2Component,
} from './spec.components.fixtures';

describe('MockBuilder:promise', () => {
  beforeEach(() => {
    return (
      MockBuilder()
        .keep(My1Component)
        .keep(My2Component)

        // In case if you need extra customization of TestBed in promise way.
        .beforeCompileComponents(testBed => {
          testBed.overrideTemplate(
            My1Component,
            'If we need to tune testBed',
          );
        })
        .beforeCompileComponents(testBed => {
          testBed.overrideTemplate(My2Component, 'More callbacks');
        })
    );
  });

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender('<c-1></c-1><c-2></c-2>');
    expect(fixture).toBeDefined();
    expect(fixture.nativeElement.innerHTML).toContain(
      'If we need to tune testBed',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      'More callbacks',
    );
  });
});
