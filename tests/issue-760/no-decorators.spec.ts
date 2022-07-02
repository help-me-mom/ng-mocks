import { PipeTransform } from '@angular/core';

import {
  MockBuilder,
  MockComponent,
  MockComponents,
  MockDeclaration,
  MockDeclarations,
  MockDirective,
  MockDirectives,
  MockModule,
  MockPipe,
  MockPipes,
} from 'ng-mocks';

class TargetModule {}

class TargetComponent {}

class TargetDirective {}

class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return value;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/760
describe('issue-760:no-decorators', () => {
  describe('unknown module', () => {
    it('throws on MockModule', () => {
      expect(() => MockModule(TargetModule)).toThrowError(
        /TargetModule declaration has been passed into ng-mocks without Angular decorators/,
      );
    });

    it('does nothing on MockBuilder.keep', () => {
      // maybe it is an undecorated service...
      expect(() => MockBuilder(TargetModule).build()).not.toThrow();
    });

    it('does nothing on MockBuilder.mock', () => {
      // maybe it is an undecorated service...
      expect(() =>
        MockBuilder(null, TargetModule).build(),
      ).not.toThrow();
    });
  });

  describe('unknown component', () => {
    it('throws on MockComponent', () => {
      expect(() => MockComponent(TargetComponent)).toThrowError(
        /TargetComponent declaration has been passed into ng-mocks without Angular decorators/,
      );
    });

    it('throws on MockComponents', () => {
      expect(() => MockComponents(TargetComponent)).toThrowError(
        /TargetComponent declaration has been passed into ng-mocks without Angular decorators/,
      );
    });

    it('throws on MockDeclaration', () => {
      expect(() => MockDeclaration(TargetComponent)).toThrowError(
        /MockDeclaration does not know how to mock TargetComponent/,
      );
    });

    it('throws on MockDeclarations', () => {
      expect(() => MockDeclarations(TargetComponent)).toThrowError(
        /MockDeclaration does not know how to mock TargetComponent/,
      );
    });

    it('throws on MockBuilder.keep', () => {
      // maybe it is an undecorated service...
      expect(() =>
        MockBuilder(TargetComponent).build(),
      ).not.toThrow();
    });

    it('does nothing on MockBuilder.mock', () => {
      // maybe it is an undecorated service...
      expect(() =>
        MockBuilder(null, TargetComponent).build(),
      ).not.toThrow();
    });
  });

  describe('unknown directive', () => {
    it('throws on TargetDirective', () => {
      expect(() => MockDirective(TargetDirective)).toThrowError(
        /TargetDirective declaration has been passed into ng-mocks without Angular decorators/,
      );
    });

    it('throws on MockDirectives', () => {
      expect(() => MockDirectives(TargetDirective)).toThrowError(
        /TargetDirective declaration has been passed into ng-mocks without Angular decorators/,
      );
    });

    it('throws on MockDeclaration', () => {
      expect(() => MockDeclaration(TargetDirective)).toThrowError(
        /MockDeclaration does not know how to mock TargetDirective/,
      );
    });

    it('throws on MockDeclarations', () => {
      expect(() => MockDeclarations(TargetDirective)).toThrowError(
        /MockDeclaration does not know how to mock TargetDirective/,
      );
    });

    it('throws on MockBuilder.keep', () => {
      // maybe it is an undecorated service...
      expect(() =>
        MockBuilder(TargetDirective).build(),
      ).not.toThrow();
    });

    it('does nothing on MockBuilder.mock', () => {
      // maybe it is an undecorated service...
      expect(() =>
        MockBuilder(null, TargetDirective).build(),
      ).not.toThrow();
    });
  });

  describe('unknown pipe', () => {
    it('throws on MockPipe', () => {
      expect(() => MockPipe(TargetPipe)).toThrowError(
        /TargetPipe declaration has been passed into ng-mocks without Angular decorators/,
      );
    });

    it('throws on MockPipes', () => {
      expect(() => MockPipes(TargetPipe)).toThrowError(
        /TargetPipe declaration has been passed into ng-mocks without Angular decorators/,
      );
    });

    it('throws on MockDeclaration', () => {
      expect(() => MockDeclaration(TargetPipe)).toThrowError(
        /MockDeclaration does not know how to mock TargetPipe/,
      );
    });

    it('throws on MockDeclarations', () => {
      expect(() => MockDeclarations(TargetPipe)).toThrowError(
        /MockDeclaration does not know how to mock TargetPipe/,
      );
    });

    it('throws on MockBuilder.keep', () => {
      // maybe it is an undecorated service...
      expect(() => MockBuilder(TargetPipe).build()).not.toThrow();
    });

    it('does nothing on MockBuilder.mock', () => {
      // maybe it is an undecorated service...
      expect(() =>
        MockBuilder(null, TargetPipe).build(),
      ).not.toThrow();
    });
  });
});
