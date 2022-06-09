import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';

import {
  MockBuilder,
  MockInstance,
  MockReset,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class Target1Interceptor implements HttpInterceptor {
  protected value = '1';

  public intercept(
    request: HttpRequest<void>,
    next: HttpHandler,
  ): Observable<HttpEvent<void>> {
    return next.handle(
      request.clone({
        setHeaders: {
          target1: this.value,
        },
      }),
    );
  }
}

@Injectable()
class Target2Interceptor implements HttpInterceptor {
  protected value = '2';

  public intercept(
    request: HttpRequest<void>,
    next: HttpHandler,
  ): Observable<HttpEvent<void>> {
    return next.handle(
      request.clone({
        setHeaders: {
          target2: this.value,
        },
      }),
    );
  }
}

@NgModule({
  imports: [HttpClientModule],
  providers: [
    Target1Interceptor,
    Target2Interceptor,
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useExisting: Target1Interceptor,
    },
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useExisting: Target2Interceptor,
    },
  ],
})
class TargetModule {}

// The idea is to check that a multi token does not break logic to
// much due to missed observables.
describe('interceptor-kept-mock', () => {
  beforeEach(() =>
    MockBuilder(Target1Interceptor, TargetModule)
      .keep(HTTP_INTERCEPTORS)
      .replace(HttpClientModule, HttpClientTestingModule),
  );

  beforeAll(() => {
    MockInstance(Target2Interceptor, {
      init: instance => {
        instance.intercept = (request, next) => next.handle(request);
      },
    });
  });
  afterAll(MockReset);

  it('triggers interceptor', () => {
    const client = ngMocks.findInstance(HttpClient);
    const httpMock = ngMocks.findInstance(HttpTestingController);

    // Let's do a simply request.
    client.get('/target').subscribe();

    // Now we can assert that a header has been added to the request.
    const req = httpMock.expectOne('/target');
    expect(req.request.headers.get('target1')).toEqual('1');
    expect(req.request.headers.get('target2')).toBeNull();
    req.flush('');
    httpMock.verify();
  });
});
