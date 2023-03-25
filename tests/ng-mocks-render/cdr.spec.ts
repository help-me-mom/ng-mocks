import { Component, OnInit } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-render-cdr',
  template: '{{ value }}',
})
class TargetComponent implements OnInit {
  public value = '';

  public ngOnInit(): void {
    this.value = 'rendered';
  }
}

describe('ng-mocks-render:cdr', () => {
  ngMocks.faster();
  beforeAll(() => MockBuilder(TargetComponent));

  it('detects instantly w/o params and options', () => {
    const fixture = MockRender(TargetComponent);
    expect(ngMocks.formatText(fixture)).toEqual('rendered');
  });

  it('detects instantly w/ params and w/o options', () => {
    const fixture = MockRender(TargetComponent, {});
    expect(ngMocks.formatText(fixture)).toEqual('rendered');
  });

  it('detects instantly w/ params and w/ options', () => {
    const fixture = MockRender(TargetComponent, {}, {});
    expect(ngMocks.formatText(fixture)).toEqual('rendered');
  });

  it('detects instantly w/ params and w/ flag', () => {
    const fixture = MockRender(
      TargetComponent,
      {},
      {
        detectChanges: true,
      },
    );
    expect(ngMocks.formatText(fixture)).toEqual('rendered');
  });

  it('does not detect as a flag', () => {
    const fixture = MockRender(TargetComponent, undefined, false);
    expect(ngMocks.formatText(fixture)).toEqual('');

    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('rendered');
  });

  it('does not detect as options', () => {
    const fixture = MockRender(TargetComponent, undefined, {
      detectChanges: false,
    });
    expect(ngMocks.formatText(fixture)).toEqual('');

    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('rendered');
  });
});
