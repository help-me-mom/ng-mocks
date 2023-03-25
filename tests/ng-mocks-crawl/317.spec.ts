import { Component, EventEmitter, Output } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-crawl-317',
  template: `<a (click)="update.emit()" data-role="link">
    <span>test</span>
  </a>`,
})
class TargetComponent {
  @Output() public readonly update = new EventEmitter<void>();
}

describe('ng-mocks-crawl:317', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds by css selector', () => {
    MockRender(TargetComponent);
    const result: any[] = [];
    ngMocks.crawl('a', node => {
      result.push(node);
    });
    expect(result.length).toEqual(2);
    expect(result[0].name).toEqual('a');
    expect(result[1].name).toEqual('span');
  });

  it('finds by attribute selector', () => {
    MockRender(TargetComponent);
    const result: any[] = [];
    ngMocks.crawl(['data-role', 'link'], node => {
      result.push(node);
    });
    expect(result.length).toEqual(2);
    expect(result[0].name).toEqual('a');
    expect(result[1].name).toEqual('span');
  });
});
