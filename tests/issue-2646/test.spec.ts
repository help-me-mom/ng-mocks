import {
  Component,
  Directive,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// Angular 5-13 still rely on TestBed.get typings, while newer targets expose TestBed.inject.
const testBedInject = <T>(token: any): T => {
  const testBed: any = TestBed;

  return (testBed.inject || testBed.get).call(testBed, token);
};

// Seed an explicit spy so the regression does not depend on runner-specific auto-spy behavior.
const createSpy = (name: string, value: string): any =>
  typeof jest === 'undefined'
    ? jasmine.createSpy(name).and.returnValue(value)
    : jest.fn().mockReturnValue(value);

@Injectable()
class TargetService {
  echo() {
    return `TargetService`;
  }
}

@Directive({
  selector: 'target-2646',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {
  echo() {
    return `TargetDirective`;
  }
}

@Component({
  selector: 'target-2646',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ echo() | target }}',
})
class TargetComponent {
  echo() {
    return `TargetComponent`;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/2646
// MockBuilder should build a module correctly based on all providers,
// even if declarations derive from services
describe('issue-2646', () => {
  describe('directive', () => {
    @Directive({
      selector: 'target-2646',
      ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
    })
    class ServiceToDirective extends TargetService {
      echo() {
        return `ServiceToDirective`;
      }
    }

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [ServiceToDirective],
          providers: [ServiceToDirective],
        }).compileComponents(),
      );

      it('covers behavior', () => {
        const fixture = MockRender(ServiceToDirective);
        expect(fixture.point.componentInstance.constructor).toBe(
          ServiceToDirective,
        );

        expect(() =>
          fixture.debugElement.injector.get(ServiceToDirective),
        ).not.toThrow();
        try {
          fixture.debugElement.injector.get(TargetService);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain('No provider');
        }
      });
    });

    describe('mock', () => {
      beforeEach(() => MockBuilder().mock(ServiceToDirective));

      it('covers behavior', () => {
        const fixture = MockRender(ServiceToDirective);
        expect(
          isMockOf(
            fixture.point.componentInstance,
            ServiceToDirective,
          ),
        ).toEqual(true);

        expect(() =>
          fixture.debugElement.injector.get(ServiceToDirective),
        ).not.toThrow();
        try {
          fixture.debugElement.injector.get(TargetService);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain('No provider');
        }
      });
    });

    describe('mock inject', () => {
      @Directive({
        selector: 'target-2646[consumer]',
        ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
      })
      class DirectiveConsumer {
        public constructor(
          public readonly target: ServiceToDirective,
        ) {}
      }

      @Component({
        selector: 'host-2646-directive',
        ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
        template: '<target-2646 consumer></target-2646>',
      })
      class DirectiveHostComponent {}

      beforeEach(() =>
        MockBuilder(DirectiveHostComponent)
          .keep(DirectiveConsumer)
          .mock(ServiceToDirective),
      );

      it('reuses TestBed.inject overrides', () => {
        // Mocked declarations that double as providers are created locally by Angular. The fix makes
        // the constructor-injected local instance inherit the overrides that were seeded through
        // TestBed.inject before rendering.
        const directive = testBedInject<ServiceToDirective>(
          ServiceToDirective,
        );
        const echo = createSpy('directiveEcho', 'mock directive');
        ngMocks.stub(directive, { echo });

        const fixture = TestBed.createComponent(
          DirectiveHostComponent,
        );
        fixture.detectChanges();

        const consumer = fixture.debugElement
          .query(By.directive(DirectiveConsumer))
          .injector.get(DirectiveConsumer);

        expect(consumer.target).not.toBe(directive);
        expect(consumer.target.echo).toBe(directive.echo);
        expect(consumer.target.echo()).toEqual('mock directive');
        expect(echo).toHaveBeenCalledTimes(1);
        expect(testBedInject(ServiceToDirective)).toBe(
          consumer.target,
        );
      });
    });
  });

  describe('component', () => {
    @Component({
      selector: 'target-2646',
      ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
      template: 'target',
    })
    class ServiceToComponent extends TargetService {
      echo() {
        return `ServiceToComponent`;
      }
    }

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [ServiceToComponent],
          providers: [ServiceToComponent],
        }).compileComponents(),
      );

      it('covers behavior', () => {
        const fixture = MockRender(ServiceToComponent);
        expect(fixture.point.componentInstance.constructor).toBe(
          ServiceToComponent,
        );

        expect(() =>
          fixture.debugElement.injector.get(ServiceToComponent),
        ).not.toThrow();
        try {
          fixture.debugElement.injector.get(TargetService);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain('No provider');
        }
      });
    });

    describe('mock', () => {
      beforeEach(() => MockBuilder().mock(ServiceToComponent));

      it('covers behavior', () => {
        const fixture = MockRender(ServiceToComponent);
        expect(
          isMockOf(
            fixture.point.componentInstance,
            ServiceToComponent,
          ),
        ).toEqual(true);

        expect(() =>
          fixture.debugElement.injector.get(ServiceToComponent),
        ).not.toThrow();
        try {
          fixture.debugElement.injector.get(TargetService);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain('No provider');
        }
      });
    });

    describe('mock inject', () => {
      @Directive({
        selector: 'target-2646[consumer]',
        ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
      })
      class ComponentConsumer {
        public constructor(
          public readonly target: ServiceToComponent,
        ) {}
      }

      @Component({
        selector: 'host-2646-component',
        ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
        template: '<target-2646 consumer></target-2646>',
      })
      class ComponentHostComponent {}

      beforeEach(() =>
        MockBuilder(ComponentHostComponent)
          .keep(ComponentConsumer)
          .mock(ServiceToComponent),
      );

      it('reuses TestBed.inject overrides', () => {
        // The same replay behavior should work for mocked components used as providers, not only for
        // the pipe regression from #7937.
        const component = testBedInject<ServiceToComponent>(
          ServiceToComponent,
        );
        const echo = createSpy('componentEcho', 'mock component');
        ngMocks.stub(component, { echo });

        const fixture = TestBed.createComponent(
          ComponentHostComponent,
        );
        fixture.detectChanges();

        const consumer = fixture.debugElement
          .query(By.directive(ComponentConsumer))
          .injector.get(ComponentConsumer);

        expect(consumer.target).not.toBe(component);
        expect(consumer.target.echo).toBe(component.echo);
        expect(consumer.target.echo()).toEqual('mock component');
        expect(echo).toHaveBeenCalledTimes(1);
        expect(testBedInject(ServiceToComponent)).toBe(
          consumer.target,
        );
      });
    });
  });

  describe('pipe', () => {
    @Pipe({
      name: 'target',
      ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
    })
    class PipeFromService
      extends TargetService
      implements PipeTransform
    {
      transform(): string {
        return 'PipeFromService';
      }
    }

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [PipeFromService, TargetComponent],
          providers: [PipeFromService],
        }).compileComponents(),
      );

      it('covers behavior', () => {
        const fixture = MockRender(TargetComponent);
        expect(fixture.point.componentInstance.constructor).toBe(
          TargetComponent,
        );
        expect(ngMocks.formatText(fixture)).toEqual(
          'PipeFromService',
        );

        expect(() =>
          fixture.debugElement.injector.get(PipeFromService),
        ).not.toThrow();
        try {
          fixture.debugElement.injector.get(TargetService);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain('No provider');
        }
      });
    });

    describe('mock', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent).mock(PipeFromService),
      );

      it('covers behavior', () => {
        const fixture = MockRender(TargetComponent);
        expect(fixture.point.componentInstance.constructor).toBe(
          TargetComponent,
        );
        expect(ngMocks.formatText(fixture)).toEqual('');

        expect(() =>
          fixture.debugElement.injector.get(PipeFromService),
        ).not.toThrow();
        try {
          fixture.debugElement.injector.get(TargetService);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain('No provider');
        }
      });
    });
  });

  describe('module', () => {
    @NgModule({
      declarations: [TargetDirective],
      exports: [TargetDirective],
    })
    class ModuleFromService extends TargetService {
      echo() {
        return 'ModuleFromService';
      }
    }

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          imports: [ModuleFromService],
          providers: [ModuleFromService],
        }).compileComponents(),
      );

      it('covers behavior', () => {
        const fixture = MockRender(TargetDirective);
        expect(fixture.point.componentInstance.constructor).toBe(
          TargetDirective,
        );

        expect(() =>
          fixture.debugElement.injector.get(ModuleFromService),
        ).not.toThrow();
        try {
          fixture.debugElement.injector.get(TargetService);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain('No provider');
        }
      });
    });

    describe('mock', () => {
      beforeEach(() => MockBuilder().mock(ModuleFromService));

      it('covers behavior', () => {
        const fixture = MockRender(TargetDirective);
        expect(
          isMockOf(fixture.point.componentInstance, TargetDirective),
        ).toEqual(true);

        expect(() =>
          fixture.debugElement.injector.get(ModuleFromService),
        ).not.toThrow();
        try {
          fixture.debugElement.injector.get(TargetService);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain('No provider');
        }
      });
    });
  });
});
