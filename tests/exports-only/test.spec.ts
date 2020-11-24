import { MockBuilder, MockRender } from 'ng-mocks';

import { InternalComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('ExportsOnly:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('<internal-component>internal</internal-component>');
  });
});

describe('ExportsOnly:mock1', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  // The expectation is to see that InternalModule was exported and it can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<internal-component></internal-component>');
  });
});

describe('ExportsOnly:mock2', () => {
  beforeEach(() => MockBuilder().mock(TargetModule).mock(InternalComponent));

  // The expectation is to see that InternalModule was exported and it can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<internal-component></internal-component>');
  });
});

describe('ExportsOnly:mock3', () => {
  beforeEach(() => MockBuilder().keep(TargetModule));

  // The expectation is to see that InternalModule was exported and it can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('<internal-component>internal</internal-component>');
  });
});
