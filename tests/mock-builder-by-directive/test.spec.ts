import { Component, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'internal-mock-builder-by-directive',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'internal',
})
class InternalComponent {}

@NgModule({
  declarations: [InternalComponent],
  exports: [InternalComponent],
})
class TargetModule {}

describe('MockBuilderByDirective:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    const element = ngMocks.find(
      fixture.debugElement,
      InternalComponent,
    );
    expect(element).toBeDefined();
  });
});

describe('MockBuilderByDirective:mock', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  it('finds the same element by its original or mock declaration', () => {
    const fixture = MockRender(InternalComponent);
    const mockElement = ngMocks.find(
      fixture.debugElement,
      MockComponent(InternalComponent),
    );
    const originalElement = ngMocks.find(
      fixture.debugElement,
      InternalComponent,
    );
    expect(mockElement).toBeDefined();
    expect(originalElement).toBeDefined();
    expect(originalElement).toBe(mockElement);
  });
});
