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

class TargetModule {
  public static readonly __annotations__: undefined[] = [];
  public static readonly _isMockFunction = true;
  public static readonly mockName = () => TargetModule;
}

class TargetComponent {
  public static readonly __annotations__: undefined[] = [];
  public static readonly _isMockFunction = true;
  public static readonly mockName = () => TargetComponent;
}

class TargetDirective {
  public static readonly __annotations__: undefined[] = [];
  public static readonly _isMockFunction = true;
  public static readonly mockName = () => TargetDirective;
}

class TargetPipe implements PipeTransform {
  public static readonly __annotations__: undefined[] = [];
  public static readonly _isMockFunction = true;
  public static readonly mockName = () => TargetPipe;

  public transform(value: string): string {
    return value;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/760
describe('issue-760:jest', () => {
  describe('unknown module', () => {
    it('throws on MockModule', () => {
      try {
        MockModule(TargetModule);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetModule.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockBuilder.keep', () => {
      try {
        MockBuilder(TargetModule).build();
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetModule.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockBuilder.mock', () => {
      try {
        MockBuilder(null, TargetModule).build();
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetModule.name} which has been already mocked by jest.mock`,
        );
      }
    });
  });

  describe('unknown component', () => {
    it('throws on MockComponent', () => {
      try {
        MockComponent(TargetComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockComponents', () => {
      try {
        MockComponents(TargetComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockDeclaration', () => {
      try {
        MockDeclaration(TargetComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockDeclarations', () => {
      try {
        MockDeclarations(TargetComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockBuilder.keep', () => {
      try {
        MockBuilder(TargetComponent).build();
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockBuilder.mock', () => {
      try {
        MockBuilder(null, TargetComponent).build();
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        );
      }
    });
  });

  describe('unknown directive', () => {
    it('throws on TargetDirective', () => {
      try {
        MockDirective(TargetDirective);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockDirectives', () => {
      try {
        MockDirectives(TargetDirective);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockDeclaration', () => {
      try {
        MockDeclaration(TargetDirective);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockDeclarations', () => {
      try {
        MockDeclarations(TargetDirective);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockBuilder.keep', () => {
      try {
        MockBuilder(TargetDirective).build();
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockBuilder.mock', () => {
      try {
        MockBuilder(null, TargetDirective).build();
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        );
      }
    });
  });

  describe('unknown pipe', () => {
    it('throws on MockPipe', () => {
      try {
        MockPipe(TargetPipe);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockPipes', () => {
      try {
        MockPipes(TargetPipe);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockDeclaration', () => {
      try {
        MockDeclaration(TargetPipe);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockDeclarations', () => {
      try {
        MockDeclarations(TargetPipe);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockBuilder.keep', () => {
      try {
        MockBuilder(TargetPipe).build();
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        );
      }
    });

    it('throws on MockBuilder.mock', () => {
      try {
        MockBuilder(null, TargetPipe).build();
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        );
      }
    });
  });
});
