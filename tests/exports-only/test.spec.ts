import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'internal-exports-only',
  template: 'internal',
})
class InternalComponent {}

@NgModule({
  declarations: [InternalComponent],
  exports: [InternalComponent],
  imports: [CommonModule],
})
class InternalModule {}

@NgModule({
  exports: [InternalModule],
})
class TargetModule {}

describe('ExportsOnly:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<internal-exports-only>internal</internal-exports-only>',
    );
  });
});

describe('ExportsOnly:mock1', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  // The expectation is to see that InternalModule was exported and it can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual(
      '<internal-exports-only></internal-exports-only>',
    );
  });
});

describe('ExportsOnly:mock2', () => {
  beforeEach(() =>
    MockBuilder().mock(TargetModule).mock(InternalComponent),
  );

  // The expectation is to see that InternalModule was exported and it can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual(
      '<internal-exports-only></internal-exports-only>',
    );
  });
});

describe('ExportsOnly:mock3', () => {
  beforeEach(() => MockBuilder().keep(TargetModule));

  // The expectation is to see that InternalModule was exported and it can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<internal-exports-only>internal</internal-exports-only>',
    );
  });
});
