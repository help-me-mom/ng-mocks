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
      expect(() => MockModule(TargetModule)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetModule.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockBuilder.keep', () => {
      expect(() => MockBuilder(TargetModule).build()).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetModule.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockBuilder.mock', () => {
      expect(() =>
        MockBuilder(null, TargetModule).build(),
      ).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetModule.name} which has been already mocked by jest.mock`,
        ),
      );
    });
  });

  describe('unknown component', () => {
    it('throws on MockComponent', () => {
      expect(() => MockComponent(TargetComponent)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockComponents', () => {
      expect(() => MockComponents(TargetComponent)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockDeclaration', () => {
      expect(() => MockDeclaration(TargetComponent)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockDeclarations', () => {
      expect(() => MockDeclarations(TargetComponent)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockBuilder.keep', () => {
      expect(() => MockBuilder(TargetComponent).build()).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockBuilder.mock', () => {
      expect(() =>
        MockBuilder(null, TargetComponent).build(),
      ).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetComponent.name} which has been already mocked by jest.mock`,
        ),
      );
    });
  });

  describe('unknown directive', () => {
    it('throws on TargetDirective', () => {
      expect(() => MockDirective(TargetDirective)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockDirectives', () => {
      expect(() => MockDirectives(TargetDirective)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockDeclaration', () => {
      expect(() => MockDeclaration(TargetDirective)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockDeclarations', () => {
      expect(() => MockDeclarations(TargetDirective)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockBuilder.keep', () => {
      expect(() => MockBuilder(TargetDirective).build()).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockBuilder.mock', () => {
      expect(() =>
        MockBuilder(null, TargetDirective).build(),
      ).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetDirective.name} which has been already mocked by jest.mock`,
        ),
      );
    });
  });

  describe('unknown pipe', () => {
    it('throws on MockPipe', () => {
      expect(() => MockPipe(TargetPipe)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockPipes', () => {
      expect(() => MockPipes(TargetPipe)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockDeclaration', () => {
      expect(() => MockDeclaration(TargetPipe)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockDeclarations', () => {
      expect(() => MockDeclarations(TargetPipe)).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockBuilder.keep', () => {
      expect(() => MockBuilder(TargetPipe).build()).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        ),
      );
    });

    it('throws on MockBuilder.mock', () => {
      expect(() =>
        MockBuilder(null, TargetPipe).build(),
      ).toThrowError(
        new RegExp(
          `ng-mocks got ${TargetPipe.name} which has been already mocked by jest.mock`,
        ),
      );
    });
  });
});
