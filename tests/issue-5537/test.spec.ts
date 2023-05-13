import {
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const TOKEN = new InjectionToken<string>('TOKEN');

@Injectable()
class TargetService {
  constructor(@Inject(TOKEN) public tokens: Array<string>) {}
}

@NgModule({
  providers: [
    TargetService,
    {
      provide: TOKEN,
      multi: true,
      useValue: '1',
    },
    {
      provide: TOKEN,
      multi: true,
      useValue: '2',
    },
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/discussions/5537
describe('issue-5537', () => {
  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('creates multi token', () => {
      const service = ngMocks.get(TargetService);
      expect(service.tokens).toEqual(['1', '2']);
    });
  });

  describe('mock', () => {
    MockInstance.scope();

    beforeEach(() => MockBuilder(TargetService, TargetModule));

    it('creates multi token', () => {
      MockInstance(TOKEN, () => ['3', '4']);

      const service =
        MockRender(TargetService).point.componentInstance;
      expect(service.tokens).toEqual(['3', '4']);
    });
  });
});
