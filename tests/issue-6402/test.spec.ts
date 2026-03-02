import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// Setup a simplified module structure for testing the behavior
// without relying on Angular's HttpClient and its testing utilities,
// which are being deprecated from Angular 18.
type LocalRequest = { method: string; url: string };

@Injectable()
class LocalHttpClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public get(url: string): LocalRequest {
    throw new Error(
      'test failure: LocalHttpClient.get should not be called',
    );
  }
}

@Injectable()
class LocalHttpTestingClient extends LocalHttpClient {
  public lastRequest?: LocalRequest;

  public get(url: string): LocalRequest {
    const request = { method: 'GET', url };
    this.lastRequest = request;
    return request;
  }
}

@Injectable()
class TargetService {
  public constructor(private http: LocalHttpClient) {}

  public getConfig(): LocalRequest {
    return this.http.get('/api/config');
  }
}

@NgModule({
  providers: [LocalHttpClient],
})
class LocalHttpModule {}

@NgModule({
  imports: [LocalHttpModule],
  providers: [
    LocalHttpTestingClient,
    { provide: LocalHttpClient, useExisting: LocalHttpTestingClient },
  ],
})
class LocalHttpTestingModule {}

@NgModule({
  imports: [LocalHttpModule],
  providers: [TargetService],
})
class TargetModule {}

// The issue was that MockBuilder didn't apply global rules to mocked declarations.
// @see https://github.com/help-me-mom/ng-mocks/issues/6402
describe('issue-6402', () => {
  describe('MockBuilder:replace', () => {
    beforeEach(() =>
      MockBuilder(TargetService, TargetModule).replace(
        LocalHttpModule,
        LocalHttpTestingModule,
      ),
    );

    it('sends /api/config request', () => {
      MockRender(TargetService);
      const service = ngMocks.get(TargetService);
      const client = ngMocks.get(LocalHttpTestingClient);

      const request = service.getConfig();

      expect(request).toEqual({ method: 'GET', url: '/api/config' });
      expect(client.lastRequest).toEqual(request);
    });
  });

  describe('ngMocks.globalReplace', () => {
    beforeAll(() =>
      ngMocks.globalReplace(LocalHttpModule, LocalHttpTestingModule),
    );
    beforeEach(() => MockBuilder(TargetService, TargetModule));
    afterAll(() => ngMocks.globalWipe(LocalHttpModule));

    it('sends /api/config request', () => {
      MockRender(TargetService);
      const service = ngMocks.get(TargetService);
      const client = ngMocks.get(LocalHttpTestingClient);

      const request = service.getConfig();

      expect(request).toEqual({ method: 'GET', url: '/api/config' });
      expect(client.lastRequest).toEqual(request);
    });
  });
});
