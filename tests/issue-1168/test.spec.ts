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
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
})
class TargetPipe implements PipeTransform {
  public transform(value: number): string {
    return `${value}`;
  }
}

@Directive({
  selector: 'target-1168',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
})
class TargetDirective {}

@Component({
  selector: 'target-1168',
  template: 'target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
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
      try {
        MockPipe(TargetClass as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'ng-mocks is imported in production code',
        );
      }
    });

    it('passes on TargetPipe', () => {
      expect(() => MockPipe(TargetPipe as any)).not.toThrow();
    });

    it('fails on TargetDirective', () => {
      try {
        MockPipe(TargetDirective as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockPipe accepts pipes, whereas ${TargetDirective.name} is a directive.`,
        );
      }
    });

    it('fails on TargetComponent', () => {
      try {
        MockPipe(TargetComponent as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockPipe accepts pipes, whereas ${TargetComponent.name} is a component.`,
        );
      }
    });

    it('fails on TargetService', () => {
      try {
        MockPipe(TargetService as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockPipe accepts pipes, whereas ${TargetService.name} is a service.`,
        );
      }
    });

    it('fails on TOKEN', () => {
      try {
        MockPipe(TOKEN as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'MockPipe accepts pipes, whereas TOKEN is a token.',
        );
      }
    });

    it('fails on TargetModule', () => {
      try {
        MockPipe(TargetModule as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockPipe accepts pipes, whereas ${TargetModule.name} is a module.`,
        );
      }
    });
  });

  describe('MockDirective', () => {
    it('fails on TargetClass', () => {
      try {
        MockDirective(TargetClass as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'ng-mocks is imported in production code',
        );
      }
    });

    it('fails on TargetPipe', () => {
      try {
        MockDirective(TargetPipe as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDirective accepts directives, whereas ${TargetPipe.name} is a pipe.`,
        );
      }
    });

    it('passes on TargetDirective', () => {
      expect(() =>
        MockDirective(TargetDirective as any),
      ).not.toThrow();
    });

    it('fails on TargetComponent', () => {
      try {
        MockDirective(TargetComponent as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDirective accepts directives, whereas ${TargetComponent.name} is a component.`,
        );
      }
    });

    it('fails on TargetService', () => {
      try {
        MockDirective(TargetService as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDirective accepts directives, whereas ${TargetService.name} is a service.`,
        );
      }
    });

    it('fails on TOKEN', () => {
      try {
        MockDirective(TOKEN as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'MockDirective accepts directives, whereas TOKEN is a token.',
        );
      }
    });

    it('fails on TargetModule', () => {
      try {
        MockDirective(TargetModule as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockDirective accepts directives, whereas ${TargetModule.name} is a module.`,
        );
      }
    });
  });

  describe('MockComponent', () => {
    it('fails on TargetClass', () => {
      try {
        MockComponent(TargetClass as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'ng-mocks is imported in production code',
        );
      }
    });

    it('fails on TargetPipe', () => {
      try {
        MockComponent(TargetPipe as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockComponent accepts components, whereas ${TargetPipe.name} is a pipe.`,
        );
      }
    });

    it('fails on TargetDirective', () => {
      try {
        MockComponent(TargetDirective as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockComponent accepts components, whereas ${TargetDirective.name} is a directive.`,
        );
      }
    });

    it('passes on TargetComponent', () => {
      expect(() =>
        MockComponent(TargetComponent as any),
      ).not.toThrow();
    });

    it('fails on TargetService', () => {
      try {
        MockComponent(TargetService as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockComponent accepts components, whereas ${TargetService.name} is a service.`,
        );
      }
    });

    it('fails on TOKEN', () => {
      try {
        MockComponent(TOKEN as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'MockComponent accepts components, whereas TOKEN is a token.',
        );
      }
    });

    it('fails on TargetModule', () => {
      try {
        MockComponent(TargetModule as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockComponent accepts components, whereas ${TargetModule.name} is a module.`,
        );
      }
    });
  });

  describe('MockModule', () => {
    it('fails on TargetClass', () => {
      try {
        MockModule(TargetClass as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'ng-mocks is imported in production code',
        );
      }
    });

    it('fails on TargetPipe', () => {
      try {
        MockModule(TargetPipe as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockModule accepts modules, whereas ${TargetPipe.name} is a pipe.`,
        );
      }
    });

    it('fails on TargetDirective', () => {
      try {
        MockModule(TargetDirective as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockModule accepts modules, whereas ${TargetDirective.name} is a directive.`,
        );
      }
    });

    it('fails on TargetComponent', () => {
      try {
        MockModule(TargetComponent as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockModule accepts modules, whereas ${TargetComponent.name} is a component.`,
        );
      }
    });

    it('fails on TargetService', () => {
      try {
        MockModule(TargetService as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `MockModule accepts modules, whereas ${TargetService.name} is a service.`,
        );
      }
    });

    it('fails on TOKEN', () => {
      try {
        MockModule(TOKEN as any);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'MockModule accepts modules, whereas TOKEN is a token.',
        );
      }
    });

    it('passes on TargetModule', () => {
      expect(() => MockModule(TargetModule as any)).not.toThrow();
    });
  });
});
