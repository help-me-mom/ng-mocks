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
