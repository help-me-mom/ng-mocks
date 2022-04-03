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

// @see https://github.com/ike18t/ng-mocks/issues/175
describe('issue-175', () => {
  ngMocks.throwOnConsole();

  describe('module', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target2Module),
    );

    it('fails', () => {
      expect(() => MockRender(Target2Component)).toThrowError(
        /'com-2' is not a known element/,
      );
    });
  });

  describe('module:component', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target1Component),
    );

    it('fails', () => {
      expect(() => MockRender(Target1Component)).toThrowError(
        /'com-1' is not a known element/,
      );
    });
  });

  describe('module:component:service', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target1Service),
    );

    it('fails', () => {
      expect(() => MockRender(Target1Component)).toThrowError(
        /No provider for Target1Service/,
      );
    });
  });

  describe('module:directive', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target2Directive),
    );

    it('fails', () => {
      expect(() => MockRender(`<dir-2></dir-2>`)).toThrowError(
        /'dir-2' is not a known element/,
      );
    });
  });

  describe('module:directive:service', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target1Service),
    );

    it('fails', () => {
      expect(() => MockRender(`<dir-1></dir-1>`)).toThrowError(
        /No provider for Target1Service/,
      );
    });
  });

  describe('module:pipe', () => {
    beforeEach(() => MockBuilder(TargetModule).exclude(Target1Pipe));

    it('fails', () => {
      expect(() => MockRender(`{{ 'test' | pip1 }}`)).toThrowError(
        /The pipe 'pip1' could not be found/,
      );
    });
  });

  describe('module:service', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).exclude(Target2Service),
    );

    it('fails', () => {
      expect(() => MockRender(Target2Component)).toThrowError(
        /No provider for Target2Service/,
      );
    });
  });

  describe('component:service', () => {
    beforeEach(() =>
      MockBuilder(Target1Component).exclude(Target1Service),
    );

    it('fails', () => {
      expect(() => MockRender(Target1Component)).toThrowError(
        /No provider for Target1Service/,
      );
    });
  });

  describe('directive:service', () => {
    beforeEach(() =>
      MockBuilder(Target1Directive).exclude(Target1Service),
    );

    it('fails', () => {
      expect(() => MockRender(`<dir-1></dir-1>`)).toThrowError(
        /No provider for Target1Service/,
      );
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
      expect(() =>
        TestBed.createComponent(Target1Component),
      ).toThrowError(/No provider for Target1Service/);
    });

    it('fails second time via TestBed.createComponent', () => {
      expect(() =>
        TestBed.createComponent(Target1Component),
      ).toThrowError(/No provider for Target1Service/);
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
        expect(() =>
          TestBed.createComponent(Target1Component),
        ).toThrowError(/No provider for Target1Service/);
      });

      it('fails second time via TestBed.createComponent', () => {
        expect(() =>
          TestBed.createComponent(Target1Component),
        ).toThrowError(/No provider for Target1Service/);
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
      expect(() => MockRender(`<dir-1></dir-1>`)).toThrowError(
        /No provider for Target1Service/,
      );
    });

    it('fails second time via MockRender', () => {
      expect(() => MockRender(`<dir-1></dir-1>`)).toThrowError(
        /No provider for Target1Service/,
      );
    });
  });
});
