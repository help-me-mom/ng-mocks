import { Directive, HostBinding, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockDirective,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive({
  selector: 'target-ng-mocks-global-replace-directive',
})
class TargetDirective {
  @HostBinding('attr.name')
  public readonly name = 'target';
}

@Directive({
  selector: 'target-ng-mocks-global-replace-directive',
})
class FakeDirective {
  @HostBinding('attr.name')
  public readonly name = 'fake';
}

@NgModule({
  declarations: [TargetDirective],
  exports: [TargetDirective],
})
class TargetModule {}

ngMocks.globalReplace(TargetDirective, FakeDirective);

describe('ng-mocks-global-replace:directive', () => {
  ngMocks.throwOnConsole();

  describe('MockDirective', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [MockDirective(TargetDirective)],
      }),
    );

    it('works as usual', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
    });
  });

  describe('MockModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }),
    );

    it('replaces out of the box', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-directive name="fake"></target-ng-mocks-global-replace-directive>',
      );
    });
  });

  describe('ngMocks.guts:default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, TargetModule),
      ).compileComponents(),
    );

    it('replaces out of the box', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-directive name="fake"></target-ng-mocks-global-replace-directive>',
      );
    });
  });

  describe('ngMocks.guts:exclude', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, TargetModule, TargetDirective),
      ).compileComponents(),
    );

    it('switches to exclude', () => {
      expect(() =>
        MockRender(
          '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
        ),
      ).toThrow();
    });
  });

  describe('ngMocks.guts:mock', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, [TargetModule, TargetDirective]),
      ).compileComponents(),
    );

    it('switches to mock', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
    });
  });

  describe('ngMocks.guts:keep', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(TargetDirective, TargetModule),
      ).compileComponents(),
    );

    it('switches to keep', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-directive name="target"></target-ng-mocks-global-replace-directive>',
      );
    });
  });

  describe('MockBuilder:default', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('replaces out of the box', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-directive name="fake"></target-ng-mocks-global-replace-directive>',
      );
    });
  });

  describe('MockBuilder:exclude', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).exclude(TargetDirective),
    );

    it('switches to exclude', () => {
      expect(() =>
        MockRender(
          '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
        ),
      ).toThrow();
    });
  });

  describe('MockBuilder:mock', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).mock(TargetDirective),
    );

    it('switches to mock', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
    });
  });

  describe('MockBuilder:keep', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).keep(TargetDirective),
    );

    it('switches to keep', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-directive></target-ng-mocks-global-replace-directive>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-directive name="target"></target-ng-mocks-global-replace-directive>',
      );
    });
  });
});
