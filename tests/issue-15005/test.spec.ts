import { CommonModule as AngularCommonModule } from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import {
  Injectable,
  InjectionToken,
  NgModule,
  Sanitizer as AngularSanitizer,
  SecurityContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer as AngularDomSanitizer } from '@angular/platform-browser';

import {
  isMockOf,
  MockBuilder,
  MockModule,
  MockRender,
  MockService,
  NG_MOCKS_INTERCEPTORS,
  ngMocks,
} from 'ng-mocks';

let moduleConstructions = 0;
let serviceConstructions = 0;
let serviceCalls = 0;
let interceptorCalls = 0;
let interceptorFactories = 0;

@NgModule({})
class CommonModule {
  public constructor() {
    moduleConstructions += 1;
  }
}

@Injectable()
class EventManager {
  public constructor() {
    serviceConstructions += 1;
  }

  public read(): string {
    serviceCalls += 1;
    return 'application';
  }
}

const APPLICATION_HAMMER = new InjectionToken<string>(
  'HammerGestureConfig',
);
const ORDINARY_TOKEN = new InjectionToken<string>(
  'application-15005',
);
const APPLICATION_INTERCEPTORS = new InjectionToken<string>(
  'HTTP_INTERCEPTORS',
);

@NgModule({
  providers: [
    EventManager,
    { provide: APPLICATION_HAMMER, useValue: 'application' },
    { provide: ORDINARY_TOKEN, useValue: 'application' },
  ],
})
class ProviderModule {}

const interceptor = {
  intercept: (request: HttpRequest<never>, next: HttpHandler) => {
    interceptorCalls += 1;
    return next.handle(request);
  },
};

@NgModule({
  providers: [
    { provide: APPLICATION_INTERCEPTORS, useValue: 'application' },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useValue: interceptor,
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useFactory: () => {
        interceptorFactories += 1;
        return interceptor;
      },
    },
  ],
})
class InterceptorModule {}

class Sanitizer {
  public read(): string {
    return 'application sanitizer';
  }
}

class DomSanitizer {
  public read(): string {
    return 'application DOM sanitizer';
  }
}

abstract class ChildDomSanitizer extends AngularDomSanitizer {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15005
// Framework safeguards must use identity: names and token descriptions
// can also belong to unrelated application definitions.
describe('issue-15005', () => {
  beforeEach(() => {
    moduleConstructions = 0;
    serviceConstructions = 0;
    serviceCalls = 0;
    interceptorCalls = 0;
    interceptorFactories = 0;
  });

  it('mocks an application CommonModule through MockModule', async () => {
    const mock = MockModule(CommonModule);
    expect(mock).not.toBe(CommonModule);

    await TestBed.configureTestingModule({
      imports: [mock],
    }).compileComponents();
    const instance = ngMocks.get(mock);

    expect(isMockOf(instance, CommonModule, 'm')).toBe(true);
    expect(moduleConstructions).toBe(0);
  });

  it('honors an explicit mock decision for an application CommonModule', async () => {
    await MockBuilder().mock(CommonModule);

    MockRender();

    expect(moduleConstructions).toBe(0);
  });

  for (const keep of [false, true]) {
    it(
      'constructs the original application module with keep:' + keep,
      async () => {
        if (keep) {
          await MockBuilder().keep(CommonModule);
        } else {
          await TestBed.configureTestingModule({
            imports: [CommonModule],
          }).compileComponents();
        }
        const instance = ngMocks.get(CommonModule);

        expect(instance instanceof CommonModule).toBe(true);
        expect(isMockOf(instance, CommonModule, 'm')).toBe(false);
        expect(moduleConstructions).toBe(1);
      },
    );
  }

  it('preserves the actual Angular CommonModule', () => {
    expect(MockModule(AngularCommonModule)).toBe(AngularCommonModule);
  });

  it('automatically mocks an application EventManager provider', async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(ProviderModule)],
    }).compileComponents();
    const service = ngMocks.get(EventManager);

    expect(ngMocks.get(EventManager)).toBe(service);
    expect(service.read()).toBeUndefined();
    expect(serviceConstructions).toBe(0);
    expect(serviceCalls).toBe(0);
  });

  it('keeps an application EventManager explicitly', async () => {
    await MockBuilder().mock(ProviderModule).keep(EventManager);
    const service = ngMocks.get(EventManager);

    expect(ngMocks.get(EventManager)).toBe(service);
    expect(service.read()).toBe('application');
    expect(serviceConstructions).toBe(1);
    expect(serviceCalls).toBe(1);
  });

  it('preserves an explicit application EventManager provider', async () => {
    class ProvidedService {
      public read(): string {
        return 'provided';
      }
    }
    // View Engine copies literal provider values; a class instance retains identity.
    const provided = new ProvidedService();
    await MockBuilder()
      .mock(ProviderModule)
      .provide({ provide: EventManager, useValue: provided });
    const service = ngMocks.get(EventManager);

    expect(service).toBe(provided);
    expect(ngMocks.get(EventManager)).toBe(provided);
    expect(service.read()).toBe('provided');
    expect(serviceConstructions).toBe(0);
    expect(serviceCalls).toBe(0);
  });

  it('mocks a non-multi application token with a framework description', async () => {
    await MockBuilder().mock(ProviderModule);

    expect(ngMocks.get(APPLICATION_HAMMER)).toBe('');
    expect(ngMocks.get(ORDINARY_TOKEN)).toBe('');
    expect(ngMocks.get(APPLICATION_HAMMER)).toBe('');
  });

  it('keeps the application token value when requested', async () => {
    await MockBuilder().mock(ProviderModule).keep(APPLICATION_HAMMER);

    expect(ngMocks.get(APPLICATION_HAMMER)).toBe('application');
    expect(ngMocks.get(ORDINARY_TOKEN)).toBe('');
  });

  it('excludes actual interceptors without dropping a same-description application token', async () => {
    await MockBuilder()
      .mock(InterceptorModule)
      .keep(APPLICATION_INTERCEPTORS)
      .keep(HTTP_INTERCEPTORS)
      .exclude(NG_MOCKS_INTERCEPTORS);

    expect(ngMocks.get(APPLICATION_INTERCEPTORS)).toBe('application');
    expect(ngMocks.findInstance(HTTP_INTERCEPTORS, [])).toEqual([]);
    expect(interceptorFactories).toBe(0);
    expect(interceptorCalls).toBe(0);
  });

  it('does not add Angular sanitizer methods to unrelated application classes', () => {
    for (const instance of [
      MockService(Sanitizer),
      MockService(DomSanitizer),
    ]) {
      expect(instance.read()).toBeUndefined();
      for (const name of [
        'sanitize',
        'bypassSecurityTrustHtml',
        'bypassSecurityTrustStyle',
        'bypassSecurityTrustScript',
        'bypassSecurityTrustUrl',
        'bypassSecurityTrustResourceUrl',
      ]) {
        expect(name in instance).toBe(false);
      }
    }
  });

  it('preserves mock methods for Angular abstract sanitizers and their subclasses', () => {
    const sanitizer = MockService(AngularSanitizer);
    expect(
      sanitizer.sanitize(SecurityContext.HTML, 'value'),
    ).toBeUndefined();

    for (const instance of [
      MockService(AngularDomSanitizer),
      MockService(ChildDomSanitizer),
    ]) {
      expect(
        instance.sanitize(SecurityContext.HTML, 'value'),
      ).toBeUndefined();
      expect(
        instance.bypassSecurityTrustHtml('value'),
      ).toBeUndefined();
      expect(
        instance.bypassSecurityTrustStyle('value'),
      ).toBeUndefined();
      expect(
        instance.bypassSecurityTrustScript('value'),
      ).toBeUndefined();
      expect(
        instance.bypassSecurityTrustUrl('value'),
      ).toBeUndefined();
      expect(
        instance.bypassSecurityTrustResourceUrl('value'),
      ).toBeUndefined();
    }
  });
});
