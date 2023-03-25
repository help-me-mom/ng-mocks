import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'internal-only-nested',
  template: 'internal',
})
export class InternalComponent {}

@NgModule({
  declarations: [InternalComponent],
  imports: [CommonModule],
})
export class Nested1Module {}

@NgModule({
  imports: [Nested1Module],
})
export class Nested2Module {}

@NgModule({
  imports: [Nested1Module],
})
export class Nested3Module {}

@NgModule({
  imports: [Nested2Module, Nested3Module],
})
export class TargetModule {}

describe('InternalOnlyNested:real', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    expect(() => MockRender(InternalComponent)).toThrowError(
      /'internal-only-nested' is not a known element/,
    );
  });
});

describe('InternalOnlyNested:mock', () => {
  beforeEach(() =>
    MockBuilder()
      .mock(TargetModule)
      .mock(InternalComponent, { export: true }),
  );

  // The expectation is to see that InternalComponent was exported to the level of the MyModule
  // and can be accessed in the test even it was deeply nested.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual(
      '<internal-only-nested></internal-only-nested>',
    );
  });
});
