import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MockBuilder, MockRender } from 'ng-mocks';

// This directive is shared via a module.
// The module is kept in one module,
// and is replaced with a mock copy in another one.
@Component({
  selector: 'shared',
  template: 'shared',
})
class SharedComponent {}

@NgModule({
  declarations: [SharedComponent],
  exports: [SharedComponent],
})
class SharedModule {}

@NgModule({
  exports: [SharedModule],
  imports: [SharedModule],
})
class MockModule {}

@NgModule({
  exports: [SharedModule],
  imports: [SharedModule],
})
class KeepModule {}

@Component({
  selector: 'target-222-mock-keep-priorities',
  template: 'target',
})
class TargetComponent {}

@NgModule({
  bootstrap: [TargetComponent],
  declarations: [TargetComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    KeepModule,
    MockModule,
  ],
  providers: [],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/222
describe('issue-222:mock-keep-priorities', () => {
  describe('keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(KeepModule),
    );

    it('keeps all child imports', () => {
      const fixture = MockRender(SharedComponent);
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<shared>shared</shared>',
      );
    });
  });

  describe('mock', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule)
        .keep(KeepModule)
        .mock(SharedModule),
    );

    it('mocks the nested module of a kept module', () => {
      const fixture = MockRender(SharedComponent);
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<shared></shared>',
      );
    });
  });

  describe('reverse', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule)
        .mock(KeepModule)
        .keep(SharedModule),
    );

    it('keeps the nested module of a mock module', () => {
      const fixture = MockRender(SharedComponent);
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<shared>shared</shared>',
      );
    });
  });

  describe('mock keep priority', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule)
        .keep(KeepModule)
        .mock(MockModule),
    );

    it('keep wins', () => {
      const fixture = MockRender(SharedComponent);
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<shared>shared</shared>',
      );
    });
  });
});
