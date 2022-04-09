import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockModule,
  MockPipe,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  public transform(): string {
    return 'target';
  }
}

@Pipe({
  name: 'target',
})
class FakePipe implements PipeTransform {
  public transform(): string {
    return 'fake';
  }
}

@NgModule({
  declarations: [TargetPipe],
  exports: [TargetPipe],
})
class TargetModule {}

ngMocks.globalReplace(TargetPipe, FakePipe);

describe('ng-mocks-global-replace:pipe', () => {
  ngMocks.throwOnConsole();

  describe('MockPipe', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [MockPipe(TargetPipe)],
      }),
    );

    it('works as usual', () => {
      const fixture = MockRender("{{ 'test' | target }}");
      expect(fixture.nativeElement.innerHTML).toEqual('');
    });
  });

  describe('MockModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }),
    );

    it('replaces out of the box', () => {
      const fixture = MockRender("{{ 'test' | target }}");
      expect(fixture.nativeElement.innerHTML).toEqual('fake');
    });
  });

  describe('ngMocks.guts:default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, TargetModule),
      ).compileComponents(),
    );

    it('replaces out of the box', () => {
      const fixture = MockRender("{{ 'test' | target }}");
      expect(fixture.nativeElement.innerHTML).toEqual('fake');
    });
  });

  describe('ngMocks.guts:exclude', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, TargetModule, TargetPipe),
      ).compileComponents(),
    );

    it('switches to exclude', () => {
      expect(() => MockRender("{{ 'test' | target }}")).toThrow();
    });
  });

  describe('ngMocks.guts:mock', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, [TargetModule, TargetPipe]),
      ).compileComponents(),
    );

    it('switches to mock', () => {
      const fixture = MockRender("{{ 'test' | target }}");
      expect(fixture.nativeElement.innerHTML).toEqual('');
    });
  });

  describe('ngMocks.guts:keep', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(TargetPipe, TargetModule),
      ).compileComponents(),
    );

    it('switches to keep', () => {
      const fixture = MockRender("{{ 'test' | target }}");
      expect(fixture.nativeElement.innerHTML).toEqual('target');
    });
  });

  describe('MockBuilder:default', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('replaces out of the box', () => {
      const fixture = MockRender("{{ 'test' | target }}");
      expect(fixture.nativeElement.innerHTML).toEqual('fake');
    });
  });

  describe('MockBuilder:exclude', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).exclude(TargetPipe),
    );

    it('switches to exclude', () => {
      expect(() => MockRender("{{ 'test' | target }}")).toThrow();
    });
  });

  describe('MockBuilder:mock', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).mock(TargetPipe),
    );

    it('switches to mock', () => {
      const fixture = MockRender("{{ 'test' | target }}");
      expect(fixture.nativeElement.innerHTML).toEqual('');
    });
  });

  describe('MockBuilder:keep', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).keep(TargetPipe),
    );

    it('switches to keep', () => {
      const fixture = MockRender("{{ 'test' | target }}");
      expect(fixture.nativeElement.innerHTML).toEqual('target');
    });
  });
});
