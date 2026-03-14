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

// The issue was that MockBuilder didn't apply global rules to mocked declarations.
// @see https://github.com/help-me-mom/ng-mocks/issues/6402
describe('issue-6402', () => {
  describe('MockBuilder:replace', () => {
    beforeEach(() =>
      MockBuilder(TargetService, TargetModule).replace(
        HttpClientModule,
        HttpClientTestingModule,
      ),
    );

    it('sends /api/config request', () => {
      MockRender(TargetService);
      const service = ngMocks.get(TargetService);
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
      MockRender(TargetService);
      const service = ngMocks.get(TargetService);
      const controller = ngMocks.get(HttpTestingController);

      service.getConfig().subscribe();

      const expectation = controller.expectOne('/api/config');
      expectation.flush([]);
      controller.verify();
      expect(expectation.request.method).toEqual('GET');
    });
  });
});
