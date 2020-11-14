import { getTestBed, TestBed } from '@angular/core/testing';

import ngMocksUniverse from '../common/ng-mocks-universe';

import flushTestBed from './mock-helper.flushTestBed';

export default () => {
  beforeAll(() => {
    if (ngMocksUniverse.global.has('bullet:customized')) {
      TestBed.resetTestingModule();
    }
    ngMocksUniverse.global.set('bullet', true);
  });

  afterEach(() => {
    flushTestBed();
    for (const fixture of (getTestBed() as any)._activeFixtures || /* istanbul ignore next */ []) {
      fixture.destroy();
    }
  });

  afterAll(() => {
    ngMocksUniverse.global.delete('bullet');
    if (ngMocksUniverse.global.has('bullet:reset')) {
      TestBed.resetTestingModule();
    }
  });
};
