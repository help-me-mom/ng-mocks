import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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

// Issue #10347 reports the same HttpClientModule replacement path, so this
// regression keeps both local and global replacement behavior covered.
// @see https://github.com/help-me-mom/ng-mocks/issues/6402
// @see https://github.com/help-me-mom/ng-mocks/issues/10347
describe('issue-6402', () => {
  describe('MockBuilder:replace', () => {
    beforeEach(() =>
      MockBuilder(TargetService, TargetModule).replace(
        HttpClientModule,
        HttpClientTestingModule,
      ),
    );

    it('sends /api/config request', () => {
      // TargetModule is mocked via MockBuilder, so this request only works if
      // the local HttpClientTestingModule replacement keeps its real providers.
      MockRender(TargetService);

      const service = ngMocks.get(TargetService);
      // HttpTestingController exists only on the replacement module, which makes
      // it a good canary for replacement behavior across all Angular apps.
      const controller = ngMocks.get(HttpTestingController);

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
    beforeEach(() => MockBuilder(TargetService, TargetModule));
    afterAll(() => ngMocks.globalWipe(HttpClientModule));

    it('sends /api/config request', () => {
      // TargetModule is mocked via MockBuilder, so this request only works if
      // the global HttpClientTestingModule replacement keeps its real providers.
      MockRender(TargetService);

      const service = ngMocks.get(TargetService);
      // HttpTestingController exists only on the replacement module, which makes
      // it a good canary for replacement behavior across all Angular apps.
      const controller = ngMocks.get(HttpTestingController);

      service.getConfig().subscribe();

      const expectation = controller.expectOne('/api/config');
      expectation.flush([]);
      controller.verify();
      expect(expectation.request.method).toEqual('GET');
    });
  });
});
