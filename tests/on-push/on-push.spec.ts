import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'item-list',
  template: '{{items.length}}',
})
class ItemListComponent {
  @Input() public items: string[] = [];
}

describe('ChangeDetectionStrategy.OnPush:real', () => {
  beforeEach(() => MockBuilder(ItemListComponent));

  it('should show 0 if no items', () => {
    const fixture = MockRender(ItemListComponent, {
      items: [],
    });
    expect(fixture.point.nativeElement.innerHTML).toEqual('0');
  });

  it('should show 0 if items pushed to array but not changed reference', () => {
    const parameters: { items: string[] } = {
      items: [],
    };
    const fixture = MockRender(ItemListComponent, parameters);
    fixture.componentInstance.items.push('demo');
    fixture.detectChanges();

    expect(fixture.point.nativeElement.innerHTML).toEqual('0');
  });

  it('should show 1 if items array changed reference', () => {
    const parameters: { items: string[] } = {
      items: [],
    };
    const fixture = MockRender(ItemListComponent, parameters);
    fixture.componentInstance.items = ['demo'];
    fixture.detectChanges();

    expect(fixture.point.nativeElement.innerHTML).toEqual('1');
  });
});

describe('ChangeDetectionStrategy.OnPush:mock', () => {
  beforeEach(() => MockBuilder(ItemListComponent));

  it('should show 0 if no items', () => {
    const fixture = MockRender(ItemListComponent, {
      items: [],
    });
    expect(fixture.point.nativeElement.innerHTML).toEqual('0');
  });

  it('should show 0 if items pushed to array but not changed reference', () => {
    const parameters: { items: string[] } = {
      items: [],
    };
    const fixture = MockRender(ItemListComponent, parameters);
    fixture.componentInstance.items.push('demo');
    fixture.detectChanges();

    expect(fixture.point.nativeElement.innerHTML).toEqual('0');
  });

  it('should show 1 if items array changed reference', () => {
    const parameters: { items: string[] } = {
      items: [],
    };
    const fixture = MockRender(ItemListComponent, parameters);
    fixture.componentInstance.items = ['demo'];
    fixture.detectChanges();

    expect(fixture.point.nativeElement.innerHTML).toEqual('1');
  });
});
