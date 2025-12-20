import { ngMocks } from 'ng-mocks';

import { TargetComponent } from './fixtures';

describe('ng-mocks-search-with-no-fixture:no-fixture', () => {
  it('.find type', () => {
    try {
      ngMocks.find(TargetComponent);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `Cannot find an element via ngMocks.find(${TargetComponent.name})`,
      );
    }
    expect(ngMocks.find(TargetComponent, undefined)).toBeUndefined();
  });

  it('.find css selector', () => {
    try {
      ngMocks.find('target-ng-mocks-search-with-no-fixture');
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `Cannot find an element via ngMocks.find(target-ng-mocks-search-with-no-fixture)`,
      );
    }
    expect(
      ngMocks.find(
        'target-ng-mocks-search-with-no-fixture',
        undefined,
      ),
    ).toBeUndefined();
  });

  it('.findAll type', () => {
    const elements = ngMocks.findAll(TargetComponent);
    expect(elements.length).toEqual(0);
  });

  it('.findAll css selector', () => {
    const elements = ngMocks.findAll(
      'target-ng-mocks-search-with-no-fixture',
    );
    expect(elements.length).toEqual(0);
  });

  it('.findInstance', () => {
    try {
      ngMocks.findInstance(TargetComponent);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `Cannot find an instance via ngMocks.findInstance(${TargetComponent.name})`,
      );
    }
    expect(
      ngMocks.findInstance(TargetComponent, undefined),
    ).toBeUndefined();
  });

  it('.findInstances', () => {
    const componentInstances = ngMocks.findInstances(TargetComponent);
    expect(componentInstances.length).toEqual(0);
  });
});
