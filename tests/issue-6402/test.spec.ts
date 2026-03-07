import {
  HttpClient,
  HttpClientModule,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  constructor(private http: HttpClient) {}

  getConfig() {
    return this.http.get('/api/config');
  }
}

@NgModule({
  imports: [HttpClientModule],
  providers: [TargetService],
})
class TargetModule {}

// The issue was that MockBuilder didn't apply global rules to mocked declarations.
// @see https://github.com/help-me-mom/ng-mocks/issues/6402
describe('issue-6402', () => {
  describe('MockBuilder:replace', () => {
    beforeEach(() =>
      MockBuilder(TargetService, TargetModule)
        .replace(HttpClientModule, HttpClientTestingModule)
        .provide(provideHttpClient())
        .provide(provideHttpClientTesting()),
    );

    it('sends /api/config request', () => {
      const service = TestBed.inject(TargetService);
      const controller = TestBed.inject(HttpTestingController);

      service.getConfig().subscribe();

      const expectation = controller.expectOne('/api/config');
      expectation.flush([]);
      controller.verify();
      expect(expectation.request.method).toEqual('GET');
    });
  });

  describe('ngMocks.globalReplace', () => {
    beforeAll(() =>
      ngMocks.globalReplace(
        HttpClientModule,
        HttpClientTestingModule,
      ),
    );
    beforeEach(() =>
      MockBuilder(TargetService, TargetModule)
        .provide(provideHttpClient())
        .provide(provideHttpClientTesting()),
    );
    afterAll(() => ngMocks.globalWipe(HttpClientModule));

    it('sends /api/config request', () => {
      const service = TestBed.inject(TargetService);
      const controller = TestBed.inject(HttpTestingController);

      service.getConfig().subscribe();

      const expectation = controller.expectOne('/api/config');
      expectation.flush([]);
      controller.verify();
      expect(expectation.request.method).toEqual('GET');
    });
  });
});
