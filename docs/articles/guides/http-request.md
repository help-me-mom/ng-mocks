---
title: How to test a http request in Angular application
description: Covering an Angular http request with tests
sidebar_label: HTTP request
---

Testing a http request means that we want to cover a service or a declaration sending it. For that we need to keep the
thing as it is and to mock all its dependencies. The last important step is to replace `HttpClientModule`
with `HttpClientTestingModule` so we can use `HttpTestingController` for faking requests.

```ts
beforeEach(() =>
  MockBuilder(TargetService, TargetModule).replace(
    HttpClientModule,
    HttpClientTestingModule
  )
);
```

Let's pretend that `TargetService` sends a simple GET request to `/data` and returns its result. To test it we need to
subscribe to the service and to write an expectation of the request.

```ts
const service = TestBed.get(TargetService);
let actual: any;

service.fetch().subscribe(value => (actual = value));
```

```ts
const httpMock = TestBed.get(HttpTestingController);

const req = httpMock.expectOne('/data');
expect(req.request.method).toEqual('GET');
req.flush([false, true, false]);
httpMock.verify();
```

Now we can assert the result the service returns.

```ts
expect(actual).toEqual([false, true, false]);
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestHttpRequest/test.spec.ts&initialpath=%3Fspec%3DTestHttpRequest)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestHttpRequest/test.spec.ts&initialpath=%3Fspec%3DTestHttpRequest)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestHttpRequest/test.spec.ts"
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A service that does http requests.
@Injectable()
class TargetService {
  public constructor(protected http: HttpClient) {}

  public fetch(): Observable<boolean[]> {
    return this.http.get<boolean[]>('/data');
  }
}

// A module providing the service and http client.
@NgModule({
  imports: [HttpClientModule],
  providers: [TargetService],
})
class TargetModule {}

describe('TestHttpRequest', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its
  // initialization, we need to pass its module as the second
  // parameter. And, the last but not the least, we need to replace
  // HttpClientModule with HttpClientTestingModule.
  beforeEach(() => {
    return MockBuilder(TargetService, TargetModule).replace(
      HttpClientModule,
      HttpClientTestingModule,
    );
  });

  it('sends a request', () => {
    MockRender();

    // Let's extract the service and http controller for testing.
    const service = ngMocks.findInstance(TargetService);
    const httpMock = ngMocks.findInstance(HttpTestingController);

    // A simple subscription to check what the service returns.
    let actual: any;
    service.fetch().subscribe(value => (actual = value));

    // Simulating a request.
    const req = httpMock.expectOne('/data');
    expect(req.request.method).toEqual('GET');
    req.flush([false, true, false]);
    httpMock.verify();

    // Asserting the result.
    expect(actual).toEqual([false, true, false]);
  });
});
```
