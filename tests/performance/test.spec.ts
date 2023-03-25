/* eslint-disable no-console */

import { Component, Injectable, NgModule } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public count = 0;
  public constructor() {
    this.count += 1;
  }
}

@Component({
  selector: 'target-performance',
  template: '{{ service.count }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('performance:correct', () => {
  let backupWarn: typeof console.warn;

  beforeAll(() => {
    backupWarn = console.warn;
    console.warn =
      typeof jest === 'undefined'
        ? jasmine.createSpy().and.callFake(console.log)
        : jest.fn(console.log);
  });

  afterAll(() => {
    console.warn = backupWarn;
  });

  ngMocks.faster();

  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(TargetService),
  );

  it('creates a module on first call', () => {
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('reuses a module on second call', () => {
    expect(console.warn).not.toHaveBeenCalled();
  });
});

// This suite should be executed sequentially.
describe('performance:wrong', () => {
  let backupWarn: typeof console.warn;

  beforeAll(() => {
    backupWarn = console.warn;
    console.warn =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
  });

  afterAll(() => {
    console.warn = backupWarn;
  });

  ngMocks.faster();

  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).mock(TargetService, {
      count: 5,
    }),
  );

  it('creates a module on first call', () => {
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('reuses a module on second call', () => {
    expect(console.warn).toHaveBeenCalledWith(
      assertion.stringMatching(/ngMocks.faster/),
    );
  });
});
