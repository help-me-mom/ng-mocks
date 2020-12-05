import { MockBuilder, MockRender } from 'ng-mocks';

import { MyComponent } from './spec.components.fixtures';
import { MyModule } from './spec.modules.fixtures';

describe('MockBuilder:simple', () => {
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(MyComponent, MyModule));
  // The same as
  // beforeEach(() => TestBed.configureTestingModule({{
  //   imports: [MockModule(MyModule)],
  // }).compileComponents());
  // but MyComponent has not been replaced with a mock object for
  // the testing purposes.

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div>My Content</div>',
    );
  });
});
