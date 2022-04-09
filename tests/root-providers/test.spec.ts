import { VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

import {
  ModuleComponent,
  TargetComponent,
  TargetModule,
  TargetService,
  TOKEN,
} from './fixtures';

describe('root-providers', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('finds tokens', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toContain(
        '"service:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"fake:fake"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:provided"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"token:token"',
      );
    });

    it('fails', () => {
      expect(() =>
        TestBed.createComponent(ModuleComponent),
      ).toThrowError(/-> ModuleService/);
    });
  });

  describe('mock', () => {
    ngMocks.faster();

    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(
        ModuleComponent,
      ),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });

    it('fails', () => {
      expect(() => MockRender(ModuleComponent)).toThrowError(
        /-> ModuleService/,
      );
    });
  });

  describe('mock as dependency', () => {
    ngMocks.faster();

    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(
        TargetService,
        TargetService,
        {
          dependency: true,
        },
      ),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });

  describe('keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(TargetService),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain(
        '"service:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });

  describe('keep via component module, but mocks root providers', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).mock(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:provided"',
      ); // It is in the module.
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });

  describe('keep via component module, and keeps root providers', () => {
    beforeEach(() =>
      MockBuilder(TargetModule)
        .mock(NG_MOCKS_ROOT_PROVIDERS)
        .keep(TargetService)
        .keep(TOKEN),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain(
        '"service:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:provided"',
      ); // It is in the module.
      expect(fixture.nativeElement.innerHTML).toContain(
        '"token:token"',
      );
    });
  });

  describe('keep as dependency', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(TargetService, {
        dependency: true,
      }),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain(
        '"service:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });
});
