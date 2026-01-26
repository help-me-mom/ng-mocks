import {
  Component,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender } from 'ng-mocks';

// This test verifies the fix for NG0203 errors when using MockModule with
// modules that have providers using inject() internally (like Angular Material).
// @see https://github.com/help-me-mom/ng-mocks/pull/12594#issuecomment-3789906867

// Token that simulates an internal dependency (like _Injector in Angular Material)
const INTERNAL_CONFIG = new InjectionToken<{ value: string }>(
  'INTERNAL_CONFIG',
);

// Service that uses inject() - simulates Angular Material's internal services
@Injectable()
class InternalService {
  // This uses inject() which requires an injection context
  private readonly injector = inject(Injector);
  private readonly config = inject(INTERNAL_CONFIG, {
    optional: true,
  });

  public getValue(): string {
    return this.config?.value ?? 'default';
  }

  public getInjector(): Injector {
    return this.injector;
  }
}

// Module that provides services using inject() - simulates MatButtonModule
@NgModule({
  providers: [
    {
      provide: INTERNAL_CONFIG,
      useValue: { value: 'configured' },
    },
    InternalService,
  ],
})
class ModuleWithInjectProviders {}

// Component that uses the module
@Component({
  selector: 'target',
  template: '<button>Click me</button>',
  standalone: true,
  imports: [ModuleWithInjectProviders],
})
class TargetComponent {}

describe('issue-ng0203-injection-context', () => {
  // Skip test for Angular versions before 16 (inject() in providers was added in 14,
  // but runInInjectionContext was added in 16)
  if (Number.parseInt(VERSION.major, 10) < 16) {
    it('needs Angular 16+ for this test', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('MockModule with providers using inject()', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          TargetComponent,
          MockModule(ModuleWithInjectProviders),
        ],
      }).compileComponents();
    });

    it('should not throw NG0203 when mocking a module with inject() providers', () => {
      // This should not throw NG0203: inject() must be called from an injection context
      expect(() => MockRender(TargetComponent)).not.toThrow();
    });

    it('should create component successfully', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.point.componentInstance).toBeDefined();
    });
  });

  describe('MockModule with factory providers using inject()', () => {
    // Module with useFactory that uses inject()
    @NgModule({
      providers: [
        {
          provide: INTERNAL_CONFIG,
          useFactory: () => {
            // This uses inject() in a factory - common in Angular Material
            const injector = inject(Injector);
            return {
              value: injector ? 'from-injector' : 'no-injector',
            };
          },
        },
      ],
    })
    class ModuleWithFactoryInject {}

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MockModule(ModuleWithFactoryInject)],
      }).compileComponents();
    });

    it('should not throw NG0203 when mocking module with factory using inject()', () => {
      // The mock module should be created without NG0203 errors
      expect(TestBed).toBeDefined();
    });
  });
});
