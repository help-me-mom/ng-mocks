import { ngMocks } from 'ng-mocks';

import { TargetComponent } from './fixtures';

describe('ng-mocks-search-with-no-fixture:no-fixture', () => {
  it('.find type', () => {
    expect(() => ngMocks.find(TargetComponent)).toThrowError(
      /Cannot find an element via ngMocks.find\(TargetComponent\)/,
    );
    expect(ngMocks.find(TargetComponent, undefined)).toBeUndefined();
  });

  it('.find css selector', () => {
    expect(() =>
      ngMocks.find('target-ng-mocks-search-with-no-fixture'),
    ).toThrowError(
      /Cannot find an element via ngMocks.find\(target-ng-mocks-search-with-no-fixture\)/,
    );
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
    expect(() => ngMocks.findInstance(TargetComponent)).toThrowError(
      /Cannot find an instance via ngMocks.findInstance\(TargetComponent\)/,
    );
    expect(
      ngMocks.findInstance(TargetComponent, undefined),
    ).toBeUndefined();
  });

  it('.findInstances', () => {
    const componentInstances = ngMocks.findInstances(TargetComponent);
    expect(componentInstances.length).toEqual(0);
  });
});
