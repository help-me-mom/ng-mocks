import { Inject, Injectable, InjectionToken, NgModule } from '@angular/core';

import { MockBuilder, MockProvider, MockRender } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

const TARGET = new InjectionToken('TARGET');

const MULTI = new InjectionToken('MULTI');

@Injectable()
class TargetService {
  constructor(@Inject(TOKEN) private name: string) {}

  echo() {
    return this.name;
  }
}

class MockService {
  constructor(private name: string) {}

  echo() {
    return `mock:${this.name}`;
  }
}

@NgModule({
  providers: [
    TargetService,
    {
      provide: TOKEN,
      useValue: 'token',
    },
    {
      provide: TARGET,
      useValue: 'target',
    },
  ],
})
class TargetModule {}

describe('MockProvider:599', () => {
  describe('useValue', () => {
    beforeEach(() => MockBuilder(TargetModule).provide(MockProvider(TOKEN, 'fake', 'useValue')));

    it('uses useValue', () => {
      const service = MockRender(TargetService).point.componentInstance;
      expect(service.echo()).toEqual('fake');
    });
  });

  describe('useExisting', () => {
    beforeEach(() => MockBuilder(TargetModule).provide(MockProvider(TOKEN, TARGET, 'useExisting')));

    it('uses useExisting', () => {
      const service = MockRender(TargetService).point.componentInstance;
      expect(service.echo()).toEqual('target');
    });
  });

  describe('useClass', () => {
    beforeEach(() => MockBuilder(TargetModule).provide(MockProvider(TargetService, MockService, 'useClass', [TARGET])));

    it('uses useClass', () => {
      const service = MockRender(TargetService).point.componentInstance;
      expect(service.echo()).toEqual('mock:target');
    });
  });

  describe('useFactory', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).provide(
        MockProvider(
          TargetService,
          (name: string) => ({
            echo: () => `fake:${name}`,
          }),
          'useFactory',
          [TARGET],
        ),
      ),
    );

    it('uses useFactory', () => {
      const service = MockRender(TargetService).point.componentInstance;
      expect(service.echo()).toEqual('fake:target');
    });
  });

  describe('multi', () => {
    beforeEach(() =>
      MockBuilder(TargetModule).provide([
        MockProvider(MULTI, () => 0, 'useFactory', true),
        MockProvider(MULTI, (name: string) => name.length, 'useFactory', {
          multi: true,
          deps: [TOKEN],
        }),
      ]),
    );

    it('uses useFactory', () => {
      const service = MockRender(MULTI).point.componentInstance;
      expect(service).toEqual([0, 5]);
    });
  });
});
