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
  selector: 'target',
  template: '{{ name }}',
})
class TargetComponent {
  public readonly name = 'target';
}

@Component({
  selector: 'target',
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

ngMocks.globalExclude(TargetComponent);

describe('ng-mocks-global-exclude', () => {
  ngMocks.throwOnConsole();

  describe('MockComponent', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [MockComponent(TargetComponent)],
      }),
    );

    it('works as usual', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target></target>',
      );
    });
  });

  describe('MockModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }),
    );

    it('excludes out of the box', () => {
      expect(() => MockRender('<target></target>')).toThrow();
    });
  });

  describe('ngMocks.guts:default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, TargetModule),
      ),
    );

    it('excludes out of the box', () => {
      expect(() => MockRender('<target></target>')).toThrow();
    });
  });

  describe('ngMocks.guts:keep', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(TargetComponent, TargetModule),
      ),
    );

    it('switches to keep', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>target</target>',
      );
    });
  });

  describe('ngMocks.guts:mock', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, [TargetModule, TargetComponent]),
      ),
    );

    it('switches to mock', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target></target>',
      );
    });
  });

  describe('MockBuilder:default', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('excludes out of the box', () => {
      expect(() => MockRender('<target></target>')).toThrow();
    });
  });

  describe('MockBuilder:keep', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).keep(TargetComponent),
    );

    it('switches to keep', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>target</target>',
      );
    });
  });

  describe('MockBuilder:mock', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).mock(TargetComponent),
    );

    it('switches to mock', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target></target>',
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
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>fake</target>',
      );
    });
  });
});
