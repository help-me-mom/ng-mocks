import { Component, Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

interface Item {
  name: string;
}

@Injectable()
class ItemService {
  getItems() {
    return new BehaviorSubject([]);
  }
}

@Component({
  selector: 'app-item-container',
  template: 'ItemContainerComponent',
})
class ItemContainerComponent implements OnInit {
  items$?: Observable<Item[]>;
  constructor(protected itemService: ItemService) {}

  ngOnInit(): void {
    this.items$ = this.itemService.getItems();
  }
}

@Component({
  selector: 'app-cake-item-container',
  template: 'CakeItemContainerComponent',
})
class CakeItemContainerComponent
  extends ItemContainerComponent
  implements OnInit
{
  public title = '';

  constructor(itemService: ItemService) {
    super(itemService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.title = 'Some title';
  }
}

// no issue here
// @see https://github.com/help-me-mom/ng-mocks/issues/2302
describe('issue-2302', () => {
  describe('ItemContainerComponent', () => {
    beforeEach(() =>
      MockBuilder(ItemContainerComponent, ItemService),
    );

    it('creates ItemContainerComponent', () => {
      const fixture = MockRender(ItemContainerComponent);
      expect(ngMocks.formatText(fixture)).toEqual(
        'ItemContainerComponent',
      );
    });
  });

  describe('CakeItemContainerComponent', () => {
    beforeEach(() =>
      MockBuilder(CakeItemContainerComponent, ItemService),
    );

    it('creates CakeItemContainerComponent', () => {
      const fixture = MockRender(CakeItemContainerComponent);
      expect(ngMocks.formatText(fixture)).toEqual(
        'CakeItemContainerComponent',
      );
    });
  });

  describe('keep', () => {
    beforeEach(() =>
      MockBuilder(
        [CakeItemContainerComponent, ItemContainerComponent],
        ItemService,
      ),
    );

    it('creates ItemContainerComponent', () => {
      const fixture = MockRender(ItemContainerComponent);
      expect(ngMocks.formatText(fixture)).toEqual(
        'ItemContainerComponent',
      );
    });

    it('creates CakeItemContainerComponent', () => {
      const fixture = MockRender(CakeItemContainerComponent);
      expect(ngMocks.formatText(fixture)).toEqual(
        'CakeItemContainerComponent',
      );
    });
  });

  describe('mock:ItemContainerComponent', () => {
    beforeEach(() =>
      MockBuilder(CakeItemContainerComponent, [
        ItemService,
        ItemContainerComponent,
      ]),
    );

    it('creates ItemContainerComponent', () => {
      const fixture = MockRender(ItemContainerComponent);
      expect(ngMocks.formatText(fixture)).toEqual('');
    });

    it('creates CakeItemContainerComponent', () => {
      const fixture = MockRender(CakeItemContainerComponent);
      expect(ngMocks.formatText(fixture)).toEqual(
        'CakeItemContainerComponent',
      );
    });
  });

  describe('mock:CakeItemContainerComponent', () => {
    beforeEach(() =>
      MockBuilder(ItemContainerComponent, [
        ItemService,
        CakeItemContainerComponent,
      ]),
    );

    it('creates ItemContainerComponent', () => {
      const fixture = MockRender(ItemContainerComponent);
      expect(ngMocks.formatText(fixture)).toEqual(
        'ItemContainerComponent',
      );
    });

    it('creates CakeItemContainerComponent', () => {
      const fixture = MockRender(CakeItemContainerComponent);
      expect(ngMocks.formatText(fixture)).toEqual('');
    });
  });
});
