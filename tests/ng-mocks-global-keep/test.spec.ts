import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockComponent,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-global-keep',
  template: '{{ name }}',
})
class TargetComponent {
  public readonly name = 'target';
}

@Component({
  selector: 'target-ng-mocks-global-keep',
  template: '{{ name }}',
})
class FakeComponent {
  public readonly name = 'fake';
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

ngMocks.globalKeep(TargetComponent);

describe('ng-mocks-global-keep', () => {
  ngMocks.throwOnConsole();

  describe('MockComponent', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [MockComponent(TargetComponent)],
      }),
    );

    it('works as usual', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
    });
  });

  describe('MockModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }),
    );

    it('keeps out of the box', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-keep>target</target-ng-mocks-global-keep>',
      );
    });
  });

  describe('ngMocks.guts:default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, TargetModule),
      ).compileComponents(),
    );

    it('keeps out of the box', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-keep>target</target-ng-mocks-global-keep>',
      );
    });
  });

  describe('ngMocks.guts:exclude', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, TargetModule, TargetComponent),
      ).compileComponents(),
    );

    it('switches to exclude', () => {
      expect(() =>
        MockRender(
          '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
        ),
      ).toThrow();
    });
  });

  describe('ngMocks.guts:mock', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, [TargetModule, TargetComponent]),
      ).compileComponents(),
    );

    it('switches to mock', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
    });
  });

  describe('MockBuilder:default', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('keeps out of the box', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-keep>target</target-ng-mocks-global-keep>',
      );
    });
  });

  describe('MockBuilder:exclude', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).exclude(TargetComponent),
    );

    it('switches to exclude', () => {
      expect(() =>
        MockRender(
          '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
        ),
      ).toThrow();
    });
  });

  describe('MockBuilder:mock', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).mock(TargetComponent),
    );

    it('switches to mock', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
    });
  });

  describe('MockBuilder:replace', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).replace(
        TargetComponent,
        FakeComponent,
      ),
    );

    it('switches to replace', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-keep></target-ng-mocks-global-keep>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-keep>fake</target-ng-mocks-global-keep>',
      );
    });
  });
});
