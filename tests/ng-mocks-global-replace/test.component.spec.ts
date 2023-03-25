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
  selector: 'target-ng-mocks-global-replace-component',
  template: '{{ name }}',
})
class TargetComponent {
  public readonly name = 'target';
}

@Component({
  selector: 'target-ng-mocks-global-replace-component',
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

ngMocks.globalReplace(TargetComponent, FakeComponent);

describe('ng-mocks-global-replace:component', () => {
  ngMocks.throwOnConsole();

  describe('MockComponent', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [MockComponent(TargetComponent)],
      }),
    );

    it('works as usual', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
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
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-component>fake</target-ng-mocks-global-replace-component>',
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
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-component>fake</target-ng-mocks-global-replace-component>',
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
          '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
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
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
    });
  });

  describe('ngMocks.guts:keep', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(TargetComponent, TargetModule),
      ).compileComponents(),
    );

    it('switches to keep', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-component>target</target-ng-mocks-global-replace-component>',
      );
    });
  });

  describe('MockBuilder:default', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('replaces out of the box', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-component>fake</target-ng-mocks-global-replace-component>',
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
          '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
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
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
    });
  });

  describe('MockBuilder:keep', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).keep(TargetComponent),
    );

    it('switches to keep', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-replace-component></target-ng-mocks-global-replace-component>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-replace-component>target</target-ng-mocks-global-replace-component>',
      );
    });
  });
});
