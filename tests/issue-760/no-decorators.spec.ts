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
      try {
        MockModule(TargetModule);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `${TargetModule.name} declaration has been passed into ng-mocks without Angular decorators`,
        );
      }
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
      try {
        MockComponent(TargetComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `${TargetComponent.name} declaration has been passed into ng-mocks without Angular decorators`,
        );
      }
    });

    it('throws on MockComponents', () => {
      try {
        MockComponents(TargetComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `${TargetComponent.name} declaration has been passed into ng-mocks without Angular decorators`,
        );
      }
    });

    it('throws on MockDeclaration', () => {
      try {
        MockDeclaration(TargetComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDeclaration does not know how to mock ${TargetComponent.name}`,
        );
      }
    });

    it('throws on MockDeclarations', () => {
      try {
        MockDeclarations(TargetComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDeclaration does not know how to mock ${TargetComponent.name}`,
        );
      }
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
      try {
        MockDirective(TargetDirective);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `${TargetDirective.name} declaration has been passed into ng-mocks without Angular decorators`,
        );
      }
    });

    it('throws on MockDirectives', () => {
      try {
        MockDirectives(TargetDirective);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `${TargetDirective.name} declaration has been passed into ng-mocks without Angular decorators`,
        );
      }
    });

    it('throws on MockDeclaration', () => {
      try {
        MockDeclaration(TargetDirective);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDeclaration does not know how to mock ${TargetDirective.name}`,
        );
      }
    });

    it('throws on MockDeclarations', () => {
      try {
        MockDeclarations(TargetDirective);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDeclaration does not know how to mock ${TargetDirective.name}`,
        );
      }
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
      try {
        MockPipe(TargetPipe);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `${TargetPipe.name} declaration has been passed into ng-mocks without Angular decorators`,
        );
      }
    });

    it('throws on MockPipes', () => {
      try {
        MockPipes(TargetPipe);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `${TargetPipe.name} declaration has been passed into ng-mocks without Angular decorators`,
        );
      }
    });

    it('throws on MockDeclaration', () => {
      try {
        MockDeclaration(TargetPipe);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDeclaration does not know how to mock ${TargetPipe.name}`,
        );
      }
    });

    it('throws on MockDeclarations', () => {
      try {
        MockDeclarations(TargetPipe);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDeclaration does not know how to mock ${TargetPipe.name}`,
        );
      }
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
