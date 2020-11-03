// tslint:disable:ban-ts-ignore

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
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';

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
  public readonly fake: TargetService;
  public readonly injected: TargetService;
  public readonly provided: ProvidedService;
  public readonly service: TargetService;
  public readonly token: string;

  constructor(
    @Inject(FakeService) fake: TargetService,
    @Optional() @Inject(TOKEN) @SkipSelf() token: string,
    @Optional() @SkipSelf() service: TargetService,
    @Inject(TOKEN) @Optional() @SkipSelf() token2: string,
    provided: ProvidedService,
    injector: Injector
  ) {
    this.fake = fake;
    this.service = service;
    this.injected = injector.get(TargetService);
    this.provided = provided;
    this.token = token;
  }
}

@Component({
  selector: 'module',
  template: `{{ module.name }}`,
})
class ModuleComponent {
  public readonly module: ModuleService;

  constructor(module: ModuleService) {
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
      }).compileComponents()
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

    it('mocks providers', () => {
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
      })
    );

    it('mocks providers', () => {
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

    it('mocks providers', () => {
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

    it('mocks providers', () => {
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

    it('mocks providers', () => {
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
      })
    );

    it('mocks providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain('"injected:service"');
      expect(fixture.nativeElement.innerHTML).toContain('"provided:"');
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });
});
