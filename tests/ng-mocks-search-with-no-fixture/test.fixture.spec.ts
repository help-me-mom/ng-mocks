import {
  isMockOf,
  MockBuilder,
  MockedComponentFixture,
  MockRender,
  ngMocks,
} from 'ng-mocks';

import {
  MissedComponent,
  TargetComponent,
  TargetModule,
  TestComponent,
} from './fixtures';

describe('ng-mocks-search-with-no-fixture:fixture', () => {
  ngMocks.faster();

  let fixture: MockedComponentFixture<TestComponent>;
  beforeEach(() => MockBuilder(TestComponent, TargetModule));
  beforeEach(() => (fixture = MockRender(TestComponent)));

  describe('empty', () => {
    it('.find type', () => {
      const element = ngMocks.find(TargetComponent);
      expect(
        isMockOf(element.componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(element.componentInstance.target).toEqual('1');

      expect(
        ngMocks.find(MissedComponent, undefined),
      ).toBeUndefined();
      expect(() => ngMocks.find(MissedComponent)).toThrowError(
        /Cannot find an element via ngMocks.find\(MissedComponent\)/,
      );
    });

    it('.find css selector', () => {
      const element = ngMocks.find<TargetComponent>(
        'target-ng-mocks-search-with-no-fixture',
      );
      expect(
        isMockOf(element.componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(element.componentInstance.target).toEqual('1');

      expect(
        ngMocks.find<MissedComponent>('missed', undefined),
      ).toBeUndefined();
      expect(() =>
        ngMocks.find<MissedComponent>('missed'),
      ).toThrowError(
        /Cannot find an element via ngMocks.find\(missed\)/,
      );
    });

    it('.findAll type', () => {
      const elements = ngMocks.findAll(TargetComponent);
      expect(
        isMockOf(elements[0].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[0].componentInstance.target).toEqual('1');
      expect(
        isMockOf(elements[1].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[1].componentInstance.target).toEqual('2');
    });

    it('.findAll css selector', () => {
      const elements = ngMocks.findAll<TargetComponent>(
        'target-ng-mocks-search-with-no-fixture',
      );
      expect(
        isMockOf(elements[0].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[0].componentInstance.target).toEqual('1');
      expect(
        isMockOf(elements[1].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[1].componentInstance.target).toEqual('2');
    });

    it('.findInstance', () => {
      const componentInstance = ngMocks.findInstance(TargetComponent);
      expect(
        isMockOf(componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(componentInstance.target).toEqual('1');

      expect(
        ngMocks.findInstance(MissedComponent, undefined),
      ).toBeUndefined();
      expect(() =>
        ngMocks.findInstance(MissedComponent),
      ).toThrowError(
        /Cannot find an instance via ngMocks.findInstance\(MissedComponent\)/,
      );
    });

    it('.findInstances', () => {
      const componentInstances =
        ngMocks.findInstances(TargetComponent);
      expect(
        isMockOf(componentInstances[0], TargetComponent),
      ).toBeTruthy();
      expect(componentInstances[0].target).toEqual('1');
      expect(
        isMockOf(componentInstances[1], TargetComponent),
      ).toBeTruthy();
      expect(componentInstances[1].target).toEqual('2');
    });
  });

  describe('fixture', () => {
    it('.find type', () => {
      const element = ngMocks.find(fixture, TargetComponent);
      expect(
        isMockOf(element.componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(element.componentInstance.target).toEqual('1');

      expect(
        ngMocks.find(fixture, MissedComponent, undefined),
      ).toBeUndefined();
      expect(() =>
        ngMocks.find(fixture, MissedComponent),
      ).toThrowError(
        /Cannot find an element via ngMocks.find\(MissedComponent\)/,
      );
    });

    it('.find css selector', () => {
      const element = ngMocks.find<TargetComponent>(
        fixture,
        'target-ng-mocks-search-with-no-fixture',
      );
      expect(
        isMockOf(element.componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(element.componentInstance.target).toEqual('1');

      expect(
        ngMocks.find<MissedComponent>(fixture, 'missed', undefined),
      ).toBeUndefined();
      expect(() =>
        ngMocks.find<MissedComponent>(fixture, 'missed'),
      ).toThrowError(
        /Cannot find an element via ngMocks.find\(missed\)/,
      );
    });

    it('.findAll type', () => {
      const elements = ngMocks.findAll(fixture, TargetComponent);
      expect(
        isMockOf(elements[0].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[0].componentInstance.target).toEqual('1');
      expect(
        isMockOf(elements[1].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[1].componentInstance.target).toEqual('2');
    });

    it('.findAll css selector', () => {
      const elements = ngMocks.findAll<TargetComponent>(
        fixture,
        'target-ng-mocks-search-with-no-fixture',
      );
      expect(
        isMockOf(elements[0].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[0].componentInstance.target).toEqual('1');
      expect(
        isMockOf(elements[1].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[1].componentInstance.target).toEqual('2');
    });

    it('.findInstance', () => {
      const componentInstance = ngMocks.findInstance(
        fixture,
        TargetComponent,
      );
      expect(
        isMockOf(componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(componentInstance.target).toEqual('1');

      expect(
        ngMocks.findInstance(fixture, MissedComponent, undefined),
      ).toBeUndefined();
      expect(() =>
        ngMocks.findInstance(fixture, MissedComponent),
      ).toThrowError(
        /Cannot find an instance via ngMocks.findInstance\(MissedComponent\)/,
      );
    });

    it('.findInstances', () => {
      const componentInstances = ngMocks.findInstances(
        fixture,
        TargetComponent,
      );
      expect(
        isMockOf(componentInstances[0], TargetComponent),
      ).toBeTruthy();
      expect(componentInstances[0].target).toEqual('1');
      expect(
        isMockOf(componentInstances[1], TargetComponent),
      ).toBeTruthy();
      expect(componentInstances[1].target).toEqual('2');
    });
  });

  describe('debugElement', () => {
    it('.find type', () => {
      const element = ngMocks.find(
        fixture.debugElement,
        TargetComponent,
      );
      expect(
        isMockOf(element.componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(element.componentInstance.target).toEqual('1');

      expect(
        ngMocks.find(
          fixture.debugElement,
          MissedComponent,
          undefined,
        ),
      ).toBeUndefined();
      expect(() =>
        ngMocks.find(fixture.debugElement, MissedComponent),
      ).toThrowError(
        /Cannot find an element via ngMocks.find\(MissedComponent\)/,
      );
    });

    it('.find css selector', () => {
      const element = ngMocks.find<TargetComponent>(
        fixture.debugElement,
        'target-ng-mocks-search-with-no-fixture',
      );
      expect(
        isMockOf(element.componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(element.componentInstance.target).toEqual('1');

      expect(
        ngMocks.find<MissedComponent>(
          fixture.debugElement,
          'missed',
          undefined,
        ),
      ).toBeUndefined();
      expect(() =>
        ngMocks.find<MissedComponent>(fixture.debugElement, 'missed'),
      ).toThrowError(
        /Cannot find an element via ngMocks.find\(missed\)/,
      );
    });

    it('.findAll type', () => {
      const elements = ngMocks.findAll(
        fixture.debugElement,
        TargetComponent,
      );
      expect(
        isMockOf(elements[0].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[0].componentInstance.target).toEqual('1');
      expect(
        isMockOf(elements[1].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[1].componentInstance.target).toEqual('2');
    });

    it('.findAll css selector', () => {
      const elements = ngMocks.findAll<TargetComponent>(
        fixture.debugElement,
        'target-ng-mocks-search-with-no-fixture',
      );
      expect(
        isMockOf(elements[0].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[0].componentInstance.target).toEqual('1');
      expect(
        isMockOf(elements[1].componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(elements[1].componentInstance.target).toEqual('2');
    });

    it('.findInstance', () => {
      const componentInstance = ngMocks.findInstance(
        fixture.debugElement,
        TargetComponent,
      );
      expect(
        isMockOf(componentInstance, TargetComponent),
      ).toBeTruthy();
      expect(componentInstance.target).toEqual('1');

      expect(
        ngMocks.findInstance(
          fixture.debugElement,
          MissedComponent,
          undefined,
        ),
      ).toBeUndefined();
      expect(() =>
        ngMocks.findInstance(fixture.debugElement, MissedComponent),
      ).toThrowError(
        /Cannot find an instance via ngMocks.findInstance\(MissedComponent\)/,
      );
    });

    it('.findInstances', () => {
      const componentInstances = ngMocks.findInstances(
        fixture.debugElement,
        TargetComponent,
      );
      expect(
        isMockOf(componentInstances[0], TargetComponent),
      ).toBeTruthy();
      expect(componentInstances[0].target).toEqual('1');
      expect(
        isMockOf(componentInstances[1], TargetComponent),
      ).toBeTruthy();
      expect(componentInstances[1].target).toEqual('2');
    });
  });
});
