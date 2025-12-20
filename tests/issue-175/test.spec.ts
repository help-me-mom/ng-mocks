import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import {
  Target1Component,
  Target1Directive,
  Target1Pipe,
  Target1Service,
  Target2Component,
  Target2Directive,
  Target2Module,
  Target2Service,
  TargetModule,
} from './fixtures';

// @see https://github.com/help-me-mom/ng-mocks/issues/175
describe('issue-175', () => {
  ngMocks.throwOnConsole();

  describe('module', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target2Module),
    );

    it('fails', () => {
      try {
        MockRender(Target2Component);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `'com-2' is not a known element`,
        );
      }
    });
  });

  describe('module:component', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target1Component),
    );

    it('fails', () => {
      try {
        MockRender(Target1Component);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `'com-1' is not a known element`,
        );
      }
    });
  });

  describe('module:component:service', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target1Service),
    );

    it('fails', () => {
      try {
        MockRender(Target1Component);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `No provider for ${Target1Service.name}`,
        );
      }
    });
  });

  describe('module:directive', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target2Directive),
    );

    it('fails', () => {
      try {
        MockRender('<dir-2></dir-2>');
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `'dir-2' is not a known element`,
        );
      }
    });
  });

  describe('module:directive:service', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target1Service),
    );

    it('fails', () => {
      try {
        MockRender('<dir-1></dir-1>');
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `No provider for ${Target1Service.name}`,
        );
      }
    });
  });

  describe('module:pipe', () => {
    beforeEach(() => MockBuilder(TargetModule).exclude(Target1Pipe));

    it('fails', () => {
      try {
        MockRender("{{ 'test' | pip1 }}");
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `The pipe 'pip1' could not be found`,
        );
      }
    });
  });

  describe('module:service', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target2Service),
    );

    it('fails', () => {
      try {
        MockRender(Target2Component);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `No provider for ${Target2Service.name}`,
        );
      }
    });
  });

  describe('component:service', () => {
    beforeEach(() =>
      MockBuilder(Target1Component).exclude(Target1Service),
    );

    it('fails', () => {
      try {
        MockRender(Target1Component);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `No provider for ${Target1Service.name}`,
        );
      }
    });
  });

  describe('directive:service', () => {
    beforeEach(() =>
      MockBuilder(Target1Directive).exclude(Target1Service),
    );

    it('fails', () => {
      try {
        MockRender('<dir-1></dir-1>');
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `No provider for ${Target1Service.name}`,
        );
      }
    });
  });

  describe('beforeAll:component via createComponent', () => {
    let ngModule: NgModule;
    beforeAll(
      () =>
        (ngModule = MockBuilder(Target1Component)
          .exclude(Target1Service)
          .build()),
    );
    beforeEach(() => {
      TestBed.configureTestingModule(ngModule);
    });

    it('fails first time via TestBed.createComponent', () => {
      try {
        TestBed.createComponent(Target1Component);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `No provider for ${Target1Service.name}`,
        );
      }
    });

    it('fails second time via TestBed.createComponent', () => {
      try {
        TestBed.createComponent(Target1Component);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `No provider for ${Target1Service.name}`,
        );
      }
    });
  });

  describe('beforeAll:component via compileComponents', () => {
    let ngModule: NgModule;

    describe('exclude', () => {
      beforeAll(
        () =>
          (ngModule = MockBuilder(Target1Component)
            .exclude(Target1Service)
            .build()),
      );
      beforeEach(() =>
        TestBed.configureTestingModule(ngModule).compileComponents(),
      );

      it('fails first time via TestBed.createComponent', () => {
        try {
          TestBed.createComponent(Target1Component);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain(
            `No provider for ${Target1Service.name}`,
          );
        }
      });

      it('fails second time via TestBed.createComponent', () => {
        try {
          TestBed.createComponent(Target1Component);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain(
            `No provider for ${Target1Service.name}`,
          );
        }
      });
    });

    describe('normal', () => {
      beforeAll(() => (ngModule = MockBuilder(TargetModule).build()));
      beforeEach(() =>
        TestBed.configureTestingModule(ngModule).compileComponents(),
      );

      it('should not fail anymore via TestBed.createComponent', () => {
        // No provider for Target1Service
        expect(() =>
          TestBed.createComponent(Target1Component),
        ).not.toThrow();
      });
    });
  });

  describe('beforeAll:directive', () => {
    let ngModule: NgModule;
    beforeAll(
      () =>
        (ngModule = MockBuilder(Target1Directive)
          .exclude(Target1Service)
          .build()),
    );
    beforeEach(() =>
      TestBed.configureTestingModule(ngModule).compileComponents(),
    );

    it('fails first time via MockRender', () => {
      try {
        MockRender('<dir-1></dir-1>');
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `No provider for ${Target1Service.name}`,
        );
      }
    });

    it('fails second time via MockRender', () => {
      try {
        MockRender('<dir-1></dir-1>');
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `No provider for ${Target1Service.name}`,
        );
      }
    });
  });
});
