import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'internal-internal-vs-external',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: 'internal',
})
class InternalComponent {}

@Component({
  selector: 'external-internal-vs-external',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template:
    'external <internal-internal-vs-external></internal-internal-vs-external>',
})
class ExternalComponent {}

@NgModule({
  declarations: [InternalComponent, ExternalComponent],
  exports: [ExternalComponent],
  imports: [CommonModule],
})
class TargetModule {}

describe('InternalVsExternal:real', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toContain(
      'external <internal-internal-vs-external>internal</internal-internal-vs-external>',
    );

    try {
      MockRender(InternalComponent, null, { reset: true });
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toMatch(
        /'(?:internal-){2}vs-external' is not a known element/,
      );
    }
  });
});

describe('InternalVsExternal:mock', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => MockBuilder().mock(TargetModule));

  // The expectation is to see that ExternalComponent was exported and InternalComponent was not.
  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual(
      '<external-internal-vs-external></external-internal-vs-external>',
    );

    try {
      MockRender(InternalComponent, null, { reset: true });
    } catch (error) {
      expect((error as Error).message).toMatch(
        /'(?:internal-){2}vs-external' is not a known element/,
      );
    }
  });
});

describe('InternalVsExternal:legacy', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual(
      '<external-internal-vs-external></external-internal-vs-external>',
    );

    // the code below will fail because the MockModule outside the MockBuilder exports everything.
    // try {
    //   MockRender(InternalComponent);
    //   fail('an error expected');
    // } catch (e) {
    //   expect(e).toEqual(jasmine.objectContaining({ngSyntaxError: true}));
    // }
  });
});
