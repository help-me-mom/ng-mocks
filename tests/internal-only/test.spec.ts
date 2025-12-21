import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'internal-only',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'internal',
})
class InternalComponent {}

@NgModule({
  declarations: [InternalComponent],
  imports: [CommonModule],
})
class TargetModule {}

describe('InternalOnly:real', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    try {
      MockRender(InternalComponent);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `'internal-only' is not a known element`,
      );
    }
  });
});

describe('InternalOnly:mock', () => {
  beforeEach(() =>
    MockBuilder()
      .mock(TargetModule)
      .mock(InternalComponent, { export: true }),
  );

  // The expectation is to see that InternalComponent was exported and can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual('<internal-only></internal-only>');
  });
});
