import { Component, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'internal-mock-builder-by-directive',
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

  it('should find mock', () => {
    const fixture = MockRender(InternalComponent);
    const element = ngMocks.find(
      fixture.debugElement,
      MockComponent(InternalComponent),
    );
    expect(element).toBeDefined();
  });

  it('should find original', () => {
    const fixture = MockRender(InternalComponent);
    const element = ngMocks.find(
      fixture.debugElement,
      InternalComponent,
    );
    expect(element).toBeDefined();
  });
});
