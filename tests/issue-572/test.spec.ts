import { Component, Injector } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-572',
  template: 'target',
})
class TargetComponent {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

// @see https://github.com/help-me-mom/ng-mocks/issues/572
describe('issue-572', () => {
  ngMocks.faster();
  let consoleWarn: typeof console.warn;

  beforeAll(() => ngMocks.config({ mockRenderCacheSize: 0 }));
  beforeAll(() => MockBuilder(TargetComponent));
  beforeAll(() => (consoleWarn = console.warn));

  beforeEach(() => {
    console.warn =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
  });

  afterAll(() => {
    console.warn = consoleWarn;
    ngMocks.config({
      mockRenderCacheSize: null,
      onTestBedFlushNeed: null,
    });
  });

  it('warns via console on TestBed change', () => {
    ngMocks.findInstance(Injector);
    expect(console.warn).not.toHaveBeenCalled();
    const fixture = MockRender(TargetComponent);
    expect(console.warn).toHaveBeenCalled();

    // renders properly
    expect(ngMocks.formatText(fixture)).toEqual('target');
  });

  it('keeps the config', () => {
    ngMocks.config({});

    ngMocks.findInstance(Injector);
    expect(console.warn).not.toHaveBeenCalled();
    MockRender(TargetComponent);
    expect(console.warn).toHaveBeenCalled();
  });

  it('throws on TestBed change', () => {
    ngMocks.config({ onTestBedFlushNeed: 'throw' });

    try {
      ngMocks.findInstance(Injector);
      MockRender(TargetComponent);
      fail('should throw');
    } catch (error) {
      expect(console.warn).not.toHaveBeenCalled();
      expect(error).not.toEqual(
        assertion.objectContaining({
          ngMocksConsoleCatch: assertion.anything(),
        }),
      );
    }
  });

  it('skips warnings on TestBed change', () => {
    ngMocks.config({ onTestBedFlushNeed: 'i-know-but-disable' });

    ngMocks.findInstance(Injector);
    expect(console.warn).not.toHaveBeenCalled();
    const fixture = MockRender(TargetComponent);
    expect(console.warn).not.toHaveBeenCalled();

    // renders properly
    expect(ngMocks.formatText(fixture)).toEqual('target');
  });
});
