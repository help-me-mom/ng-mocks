import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'internal-correct-module-exports',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'internal',
})
class InternalComponent {}

@Component({
  selector: 'external',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'external',
})
class ExternalComponent {}

@NgModule({
  declarations: [InternalComponent, ExternalComponent],
  exports: [ExternalComponent],
})
class TargetModule {}

describe('correct-module-exports-11:proper', () => {
  ngMocks.throwOnConsole();

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [MockModule(TargetModule)],
    }).compileComponents(),
  );

  it('fails on not exported module', () => {
    try {
      MockRender(InternalComponent);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `'internal-correct-module-exports' is not a known element`,
      );
    }
  });

  it('renders an exported module', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<external></external>',
    );
  });
});

describe('correct-module-exports-11:guts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule(
      ngMocks.guts(null, TargetModule),
    ).compileComponents(),
  );

  it('renders an internal module', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<internal-correct-module-exports></internal-correct-module-exports>',
    );
  });
});

describe('correct-module-exports-11:builder', () => {
  beforeEach(() => MockBuilder(null, TargetModule));

  it('renders an internal module', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<internal-correct-module-exports></internal-correct-module-exports>',
    );
  });
});
