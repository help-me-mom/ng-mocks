import {
  Component,
  Directive,
  Injectable,
  InjectionToken,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import {
  MockComponent,
  MockDirective,
  MockModule,
  MockPipe,
} from 'ng-mocks';

class TargetClass {}

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  public transform(value: number): string {
    return `${value}`;
  }
}

@Directive({
  selector: 'target-1168',
})
class TargetDirective {}

@Component({
  selector: 'target-1168',
  template: 'target',
})
class TargetComponent {}

@Injectable()
class TargetService {}

const TOKEN = new InjectionToken('TOKEN');

@NgModule({
  declarations: [TargetPipe, TargetDirective, TargetComponent],
  providers: [
    TargetService,
    {
      provide: TOKEN,
      useValue: 'TOKEN',
    },
  ],
})
class TargetModule {}

// We should try to detect a wrong declaration.
// @see https://github.com/help-me-mom/ng-mocks/issues/354#issuecomment-927694500
// @see https://github.com/help-me-mom/ng-mocks/issues/1168
describe('issue-1168', () => {
  describe('MockPipe', () => {
    it('fails on TargetClass', () => {
      expect(() => MockPipe(TargetClass as any)).toThrowError(
        /ng-mocks is imported in production code/,
      );
    });

    it('passes on TargetPipe', () => {
      expect(() => MockPipe(TargetPipe as any)).not.toThrow();
    });

    it('fails on TargetDirective', () => {
      expect(() => MockPipe(TargetDirective as any)).toThrowError(
        'MockPipe accepts pipes, whereas TargetDirective is a directive.',
      );
    });

    it('fails on TargetComponent', () => {
      expect(() => MockPipe(TargetComponent as any)).toThrowError(
        'MockPipe accepts pipes, whereas TargetComponent is a component.',
      );
    });

    it('fails on TargetService', () => {
      expect(() => MockPipe(TargetService as any)).toThrowError(
        'MockPipe accepts pipes, whereas TargetService is a service.',
      );
    });

    it('fails on TOKEN', () => {
      expect(() => MockPipe(TOKEN as any)).toThrowError(
        'MockPipe accepts pipes, whereas TOKEN is a token.',
      );
    });

    it('fails on TargetModule', () => {
      expect(() => MockPipe(TargetModule as any)).toThrowError(
        'MockPipe accepts pipes, whereas TargetModule is a module.',
      );
    });
  });

  describe('MockDirective', () => {
    it('fails on TargetClass', () => {
      expect(() => MockDirective(TargetClass as any)).toThrowError(
        /ng-mocks is imported in production code/,
      );
    });

    it('fails on TargetPipe', () => {
      expect(() => MockDirective(TargetPipe as any)).toThrowError(
        'MockDirective accepts directives, whereas TargetPipe is a pipe.',
      );
    });

    it('passes on TargetDirective', () => {
      expect(() =>
        MockDirective(TargetDirective as any),
      ).not.toThrow();
    });

    it('fails on TargetComponent', () => {
      expect(() =>
        MockDirective(TargetComponent as any),
      ).toThrowError(
        'MockDirective accepts directives, whereas TargetComponent is a component.',
      );
    });

    it('fails on TargetService', () => {
      expect(() => MockDirective(TargetService as any)).toThrowError(
        'MockDirective accepts directives, whereas TargetService is a service.',
      );
    });

    it('fails on TOKEN', () => {
      expect(() => MockDirective(TOKEN as any)).toThrowError(
        'MockDirective accepts directives, whereas TOKEN is a token.',
      );
    });

    it('fails on TargetModule', () => {
      expect(() => MockDirective(TargetModule as any)).toThrowError(
        'MockDirective accepts directives, whereas TargetModule is a module.',
      );
    });
  });

  describe('MockComponent', () => {
    it('fails on TargetClass', () => {
      expect(() => MockComponent(TargetClass as any)).toThrowError(
        /ng-mocks is imported in production code/,
      );
    });

    it('fails on TargetPipe', () => {
      expect(() => MockComponent(TargetPipe as any)).toThrowError(
        'MockComponent accepts components, whereas TargetPipe is a pipe.',
      );
    });

    it('fails on TargetDirective', () => {
      expect(() =>
        MockComponent(TargetDirective as any),
      ).toThrowError(
        'MockComponent accepts components, whereas TargetDirective is a directive.',
      );
    });

    it('passes on TargetComponent', () => {
      expect(() =>
        MockComponent(TargetComponent as any),
      ).not.toThrow();
    });

    it('fails on TargetService', () => {
      expect(() => MockComponent(TargetService as any)).toThrowError(
        'MockComponent accepts components, whereas TargetService is a service.',
      );
    });

    it('fails on TOKEN', () => {
      expect(() => MockComponent(TOKEN as any)).toThrowError(
        'MockComponent accepts components, whereas TOKEN is a token.',
      );
    });

    it('fails on TargetModule', () => {
      expect(() => MockComponent(TargetModule as any)).toThrowError(
        'MockComponent accepts components, whereas TargetModule is a module.',
      );
    });
  });

  describe('MockModule', () => {
    it('fails on TargetClass', () => {
      expect(() => MockModule(TargetClass as any)).toThrowError(
        /ng-mocks is imported in production code/,
      );
    });

    it('fails on TargetPipe', () => {
      expect(() => MockModule(TargetPipe as any)).toThrowError(
        'MockModule accepts modules, whereas TargetPipe is a pipe.',
      );
    });

    it('fails on TargetDirective', () => {
      expect(() => MockModule(TargetDirective as any)).toThrowError(
        'MockModule accepts modules, whereas TargetDirective is a directive.',
      );
    });

    it('fails on TargetComponent', () => {
      expect(() => MockModule(TargetComponent as any)).toThrowError(
        'MockModule accepts modules, whereas TargetComponent is a component.',
      );
    });

    it('fails on TargetService', () => {
      expect(() => MockModule(TargetService as any)).toThrowError(
        'MockModule accepts modules, whereas TargetService is a service.',
      );
    });

    it('fails on TOKEN', () => {
      expect(() => MockModule(TOKEN as any)).toThrowError(
        'MockModule accepts modules, whereas TOKEN is a token.',
      );
    });

    it('passes on TargetModule', () => {
      expect(() => MockModule(TargetModule as any)).not.toThrow();
    });
  });
});
