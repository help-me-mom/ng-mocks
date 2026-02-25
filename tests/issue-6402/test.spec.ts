import { HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Injectable, NgModule, VERSION } from '@angular/core';

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
    beforeEach(() => {
      const builder = MockBuilder(TargetService, TargetModule);
      if (Number.parseInt(VERSION.major, 10) >= 21) {
        builder.keep(HttpClient);
      }

      return builder.replace(
        HttpClientModule,
        HttpClientTestingModule,
      );
    });

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
    beforeEach(() => {
      const builder = MockBuilder(TargetService, TargetModule);
      if (Number.parseInt(VERSION.major, 10) >= 21) {
        builder.keep(HttpClient);
      }

      return builder;
    });
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
