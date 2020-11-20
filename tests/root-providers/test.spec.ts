import {
  Component,
  Inject,
  Injectable as InjectableSource,
  InjectionToken,
  Injector,
  NgModule,
  Optional,
  SkipSelf,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockBuilder, MockRender, ngMocks, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

// Thanks A5.
const TOKEN = new (InjectionToken as any)('TOKEN', {
  factory: () => 'token',
});

@Injectable()
class ModuleService {
  public readonly name = 'module';
}

@Injectable({
  providedIn: 'root',
})
class TargetService {
  public readonly name = 'service';
}

@Injectable({
  providedIn: 'root',
})
class FakeService {
  public readonly name = 'fake';
}

@Injectable({
  providedIn: 'any',
})
class ProvidedService {
  public readonly name = 'provided';
}

@Component({
  selector: 'target',
  template: `
    "service:{{ service.name }}" "fake:{{ fake.name }}" "injected:{{ injected.name }}" "provided:{{ provided.name }}"
    "token:{{ token }}"
  `,
})
class TargetComponent {
  public readonly injected: TargetService;

  public constructor(
    @Inject(FakeService) public readonly fake: TargetService,
    @Optional() @Inject(TOKEN) @SkipSelf() public readonly token: string,
    @Optional() @SkipSelf() public readonly service: TargetService,
    @Inject(TOKEN) @Optional() @SkipSelf() public readonly token2: string,
    public readonly provided: ProvidedService,
    injector: Injector,
  ) {
    this.injected = injector.get(TargetService);
  }
}

@Component({
  selector: 'module',
  template: `{{ module.name }}`,
})
class ModuleComponent {
  public readonly module: ModuleService;

  public constructor(module: ModuleService) {
    this.module = module;
  }
}

@NgModule({
  declarations: [TargetComponent, ModuleComponent],
  exports: [TargetComponent],
  imports: [BrowserModule, BrowserAnimationsModule],
  providers: [ProvidedService],
})
class TargetModule {}

describe('root-providers', () => {
  beforeEach(() => {
    if (parseInt(VERSION.major, 10) <= 5) {
      pending('Need Angular > 5');
    }
  });

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('finds tokens', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toContain('"service:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:fake"');
      expect(fixture.nativeElement.innerHTML).toContain('"injected:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"provided:provided"');
      expect(fixture.nativeElement.innerHTML).toContain('"token:token"');
    });

    it('fails', () => {
      expect(() => TestBed.createComponent(ModuleComponent)).toThrowError(/-> ModuleService/);
    });
  });

  describe('mock', () => {
    ngMocks.faster();

    beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(ModuleComponent));

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain('"injected:"');
      expect(fixture.nativeElement.innerHTML).toContain('"provided:"');
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });

    it('fails', () => {
      expect(() => MockRender(ModuleComponent)).toThrowError(/-> ModuleService/);
    });
  });

  describe('mock as dependency', () => {
    ngMocks.faster();

    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(TargetService, TargetService, {
        dependency: true,
      }),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain('"injected:"');
      expect(fixture.nativeElement.innerHTML).toContain('"provided:"');
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });

  describe('keep', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(TargetService));

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain('"injected:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"provided:"');
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });

  describe('keep via component module, but mocks root providers', () => {
    beforeEach(() => MockBuilder(TargetModule).mock(NG_MOCKS_ROOT_PROVIDERS));

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain('"injected:"');
      expect(fixture.nativeElement.innerHTML).toContain('"provided:provided"'); // It is in the module.
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });

  describe('keep via component module, and keeps root providers', () => {
    beforeEach(() => MockBuilder(TargetModule).mock(NG_MOCKS_ROOT_PROVIDERS).keep(TargetService).keep(TOKEN));

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain('"injected:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"provided:provided"'); // It is in the module.
      expect(fixture.nativeElement.innerHTML).toContain('"token:token"');
    });
  });

  describe('keep as dependency', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(TargetService, {
        dependency: true,
      }),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain('"injected:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"provided:"');
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });
});
