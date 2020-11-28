import { MockBuilder, MockRender } from 'ng-mocks';

import { MyComponent1, MyComponent2 } from './fixtures.components';

describe('MockBuilder:promise', () => {
  beforeEach(() => {
    return (
      MockBuilder()
        .keep(MyComponent1)
        .keep(MyComponent2)

        // In case if you need extra customization of TestBed in promise way.
        .beforeCompileComponents(testBed => {
          testBed.overrideTemplate(
            MyComponent1,
            'If we need to tune testBed',
          );
        })
        .beforeCompileComponents(testBed => {
          testBed.overrideTemplate(MyComponent2, 'More callbacks');
        })
    );
  });

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender(
      '<component-1></component-1><component-2></component-2>',
    );
    expect(fixture).toBeDefined();
    expect(fixture.nativeElement.innerHTML).toContain(
      'If we need to tune testBed',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      'More callbacks',
    );
  });
});
