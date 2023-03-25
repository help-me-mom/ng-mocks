import { Component, Inject, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockProvider, MockRender, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@Component({
  selector: 'target-721-before-each',
  template: '{{ value }}',
})
class TargetComponent {
  public constructor(@Inject(TOKEN) public readonly value: number) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/721
describe('issue-721:before-each', () => {
  ngMocks.faster();

  let value = 0;
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [MockProvider(TOKEN, (value += 1))],
    }).compileComponents(),
  );

  it('works right value=1', () => {
    expect(ngMocks.formatText(MockRender(TargetComponent))).toEqual(
      '1',
    );
  });

  // Should it be a better reset? Or an error?
  it('works right value=2', () => {
    expect(ngMocks.formatText(MockRender(TargetComponent))).toEqual(
      '2',
    );
  });
});
