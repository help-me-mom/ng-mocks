import {
  VERSION,
  Component,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

// Thanks A5.
const TOKEN = new (InjectionToken as any)('TOKEN', {
  factory: () => 'token',
});

@Injectable()
class ModuleService {
  public readonly name = 'module';
}

// @TODO remove with A5 support
const injectableTargetServiceArgs = [
  {
    providedIn: 'root',
  } as never,
];

@Injectable(...injectableTargetServiceArgs)
class TargetService {
  public readonly name = 'service';
}

// @TODO remove with A5 support
const injectableFakeServiceArgs = [
  {
    providedIn: 'root',
  } as never,
];

@Injectable(...injectableFakeServiceArgs)
class FakeService {
  public readonly name = 'fake';
}

const injectableProvidedServiceArgs = [
  {
    providedIn: 'any',
  } as never,
];

@Injectable(...injectableProvidedServiceArgs)
class ProvidedService {
  public readonly name = 'provided';
}

@Component({
  selector: 'target-root-providers',
  template: `
    "service:{{ service.name }}" "fake:{{ fake.name }}" "injected:{{
      injected.name
    }}" "provided:{{ provided.name }}" "token:{{ token }}"
  `,
})
class TargetComponent {
  public readonly injected: TargetService;

  public constructor(
    @Inject(FakeService) public readonly fake: TargetService,
    @Optional()
    @Inject(TOKEN)
    @SkipSelf()
    public readonly token: string,
    @Optional() @SkipSelf() public readonly service: TargetService,
    @Inject(TOKEN)
    @Optional()
    @SkipSelf()
    public readonly token2: string,
    public readonly provided: ProvidedService,
    injector: Injector,
  ) {
    this.injected = injector.get(TargetService);
  }
}

@Component({
  selector: 'module',
  template: '{{ moduleService.name }}',
})
class ModuleComponent {
  public constructor(public readonly moduleService: ModuleService) {}
}

@NgModule({
  declarations: [TargetComponent, ModuleComponent],
  exports: [TargetComponent],
  imports: [BrowserModule, BrowserAnimationsModule],
  providers: [ProvidedService],
})
class TargetModule {}

describe('root-providers', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('finds tokens', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toContain(
        '"service:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"fake:fake"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:provided"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"token:token"',
      );
    });

    it('fails', () => {
      expect(() =>
        TestBed.createComponent(ModuleComponent),
      ).toThrowError(/-> ModuleService/);
    });
  });

  describe('mock', () => {
    ngMocks.faster();

    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(
        ModuleComponent,
      ),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });

    it('fails', () => {
      expect(() => MockRender(ModuleComponent)).toThrowError(
        /-> ModuleService/,
      );
    });
  });

  describe('mock as dependency', () => {
    ngMocks.faster();

    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(
        TargetService,
        TargetService,
        {
          dependency: false,
        },
      ),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });

  describe('keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).exclude(
        TargetService,
      ),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain(
        '"service:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });

  describe('keep via component module, but mocks root providers', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).mock(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:provided"',
      ); // It is in the module.
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });

  describe('keep via component module, and keeps root providers', () => {
    beforeEach(() =>
      MockBuilder(TargetModule)
        .mock(NG_MOCKS_ROOT_PROVIDERS)
        .keep(TargetService)
        .keep(TOKEN),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain(
        '"service:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:provided"',
      ); // It is in the module.
      expect(fixture.nativeElement.innerHTML).toContain(
        '"token:token"',
      );
    });
  });

  describe('keep as dependency', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).exclude(
        TargetService,
      ),
    );

    it('uses mock providers', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain(
        '"service:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"fake:"');
      expect(fixture.nativeElement.innerHTML).toContain(
        '"injected:service"',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '"provided:"',
      );
      expect(fixture.nativeElement.innerHTML).toContain('"token:"');
    });
  });
});
