import { Injectable, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MockBuilder,
  MockProvider,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class Service1 {
  public readonly name = 'service1';
}

@Injectable()
abstract class Service2 {
  public readonly name = 'service2';
}

const TOKEN = new InjectionToken<{ name: string }>('TOKEN');

ngMocks.defaultMock<{ name: string }>(
  [Service1, Service2, TOKEN],
  () => ({
    name: 'mock',
  }),
);

// @see https://github.com/ike18t/ng-mocks/issues/568
describe('issue-568', () => {
  describe('MockBuilder', () => {
    ngMocks.faster();

    beforeAll(() =>
      MockBuilder().mock(Service1).mock(Service2).mock(TOKEN),
    );

    it('mocks service1', () => {
      expect(
        MockRender(Service1).point.componentInstance.name,
      ).toEqual('mock');
    });

    it('mocks service2', () => {
      expect(
        MockRender(Service2).point.componentInstance.name,
      ).toEqual('mock');
    });

    it('mocks token', () => {
      expect(MockRender(TOKEN).point.componentInstance.name).toEqual(
        'mock',
      );
    });
  });

  describe('TestBed', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        providers: [
          MockProvider(Service1),
          MockProvider(Service2),
          MockProvider(TOKEN),
        ],
      }).compileComponents(),
    );

    it('mocks service1', () => {
      expect(
        MockRender(Service1).point.componentInstance.name,
      ).toEqual('mock');
    });

    it('mocks service2', () => {
      expect(
        MockRender(Service2).point.componentInstance.name,
      ).toEqual('mock');
    });

    it('mocks token', () => {
      expect(MockRender(TOKEN).point.componentInstance.name).toEqual(
        'mock',
      );
    });
  });
});
