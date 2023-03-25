import {
  Component,
  forwardRef,
  Inject,
  Injectable,
  NgModule,
  Optional,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

// @TODO remove with A5 support
const injectableRootServiceArgs = [
  {
    providedIn: 'root',
  } as never,
];

@Injectable(...injectableRootServiceArgs)
class RootService {
  public readonly name = 'RootService';
}

@Injectable()
class StandardService {
  public readonly name = 'StandardService';
}

@Injectable()
class ProvidedService {
  public readonly name = 'ProvidedService';
}

@NgModule()
class ServiceModule {
  public static forRoot() {
    return {
      ngModule: ServiceModule,
      providers: [ProvidedService],
    };
  }
}

const injectableModuleServiceArgs = [
  {
    providedIn: ServiceModule,
  } as never,
];

@Injectable(...injectableModuleServiceArgs)
class ModuleService {
  public readonly name = 'ModuleService';
}

@Component({
  selector: 'target-312',
  template: 'target',
})
class TargetComponent {
  public constructor(
    @Optional() public readonly root: RootService,
    @Optional()
    @Inject(StandardService)
    public readonly standard: StandardService | null,
    @Optional() public readonly provided: ProvidedService,
    @Optional()
    @Inject(forwardRef(() => ModuleService))
    public readonly moduleService: ModuleService,
  ) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [ServiceModule.forRoot()],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

// the idea is that all the services have been injected besides StandardService.
// @see https://github.com/help-me-mom/ng-mocks/issues/312
describe('issue-312', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('detects injected services', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component.root).toEqual(assertion.any(RootService));
      expect(component.root.name).toEqual('RootService');
      expect(component.standard).toEqual(null);
      expect(component.provided).toEqual(
        assertion.any(ProvidedService),
      );
      expect(component.provided.name).toEqual('ProvidedService');
      expect(component.moduleService).toEqual(
        assertion.any(ModuleService),
      );
      expect(component.moduleService.name).toEqual('ModuleService');
    });
  });

  describe('keep', () => {
    beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

    it('detects injected services', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component.root).toEqual(assertion.any(RootService));
      expect(component.root.name).toEqual('RootService');
      expect(component.standard).toEqual(null);
      expect(component.provided).toEqual(
        assertion.any(ProvidedService),
      );
      expect(component.provided.name).toEqual('ProvidedService');
      expect(component.moduleService).toEqual(
        assertion.any(ModuleService),
      );
      expect(component.moduleService.name).toEqual('ModuleService');
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent).mock(TargetModule));

    it('detects injected services', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component.root).toEqual(assertion.any(RootService));
      expect(component.root.name).toBeUndefined();
      expect(component.standard).toEqual(null);
      expect(component.provided).toEqual(
        assertion.any(ProvidedService),
      );
      expect(component.provided.name).toBeUndefined();
      expect(component.moduleService).toEqual(
        assertion.any(ModuleService),
      );
      expect(component.moduleService.name).toBeUndefined();
    });
  });
});
