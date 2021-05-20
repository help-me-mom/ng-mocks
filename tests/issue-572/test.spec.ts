// tslint:disable no-console

import { Component, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent {}

describe('issue-572', () => {
  ngMocks.faster();
  let consoleWarn: typeof console.warn;

  beforeAll(() => MockBuilder(TargetComponent));
  beforeAll(() => (consoleWarn = console.warn));

  beforeEach(() => {
    console.warn = jasmine.createSpy('console.warn');
  });

  afterAll(() => {
    console.warn = consoleWarn;
    ngMocks.config({ onTestBedFlushNeed: 'default' });
  });

  it('throws on TestBed change', () => {
    try {
      TestBed.get(Injector);
      MockRender(TargetComponent);
      fail('should throw');
    } catch (e) {
      expect(console.warn).not.toHaveBeenCalled();
      expect(e).not.toEqual(
        jasmine.objectContaining({
          ngMocksConsoleCatch: jasmine.anything(),
        }),
      );
    }
  });

  it('warns via console on TestBed change', () => {
    ngMocks.config({ onTestBedFlushNeed: 'warn' });

    TestBed.get(Injector);
    expect(console.warn).not.toHaveBeenCalled();
    const fixture = MockRender(TargetComponent);
    expect(console.warn).toHaveBeenCalled();

    // renders properly
    expect(ngMocks.formatText(fixture)).toEqual('target');
  });

  it('keeps the config', () => {
    ngMocks.config({});

    TestBed.get(Injector);
    expect(console.warn).not.toHaveBeenCalled();
    MockRender(TargetComponent);
    expect(console.warn).toHaveBeenCalled();
  });
});
