import { Component, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRender } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/11324
describe('issue-11324: test module options', () => {
  if (Number.parseInt(VERSION.major, 10) < 20) {
    it('needs a20+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  @Component({
    selector: 'issue-11324-module-options',
    template: '',
    ['standalone' as never]: true,
  })
  class TargetComponent {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      ['imports' as never]: [TargetComponent],
      ['inferTagName' as never]: true,
    });
  });

  it('preserves public TestBed options while installing the render wrapper', () => {
    const fixture = MockRender(TargetComponent);

    expect(fixture.nativeElement.nodeName).toBe('MOCK-RENDER');
  });

  it('forgets public TestBed options after a reset', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      ['imports' as never]: [TargetComponent],
    });

    const fixture = MockRender(TargetComponent);

    expect(fixture.nativeElement.nodeName).toBe('DIV');
  });
});
