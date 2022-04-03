import {
  Component,
  forwardRef,
  Inject,
  Injectable as InjectableSource,
  NgModule,
  Optional,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MockBuilder,
  MockRender,
  NgModuleWithProviders,
} from 'ng-mocks';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

@Injectable({
  providedIn: 'root',
})
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
  public static forRoot(): NgModuleWithProviders {
    return {
      ngModule: ServiceModule,
      providers: [ProvidedService],
    };
  }
}

@Injectable({
  providedIn: ServiceModule,
})
class ModuleService {
  public readonly name = 'ModuleService';
}

@Component({
  selector: 'target',
  template: `target`,
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
    public readonly module: ModuleService,
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
// @see https://github.com/ike18t/ng-mocks/issues/312
describe('issue-312', () => {
  if (parseInt(VERSION.major, 10) <= 5) {
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
      expect(component.module).toEqual(assertion.any(ModuleService));
      expect(component.module.name).toEqual('ModuleService');
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
      expect(component.module).toEqual(assertion.any(ModuleService));
      expect(component.module.name).toEqual('ModuleService');
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
      expect(component.module).toEqual(assertion.any(ModuleService));
      expect(component.module.name).toBeUndefined();
    });
  });
});
