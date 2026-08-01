import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { ChildComponent } from './child.component';

@Component({
  standalone: true,
  selector: 'target',
  template: '',
})
class TargetComponent implements OnInit {
  public readonly childLoaded = new Promise<void>(resolve => {
    this.resolveChildLoaded = resolve;
  });

  private resolveChildLoaded!: () => void;

  constructor(public readonly containerRef: ViewContainerRef) {}

  async ngOnInit() {
    const { ChildComponent } = await import('./child.component');
    this.containerRef.createComponent(ChildComponent);
    this.resolveChildLoaded();
  }
  public targetComponent4693() {}
}

describe('issue-4693', () => {
  describe('real', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('loads lazy component', async () => {
      const fixture = MockRender(TargetComponent);
      fixture.detectChanges();
      await fixture.componentInstance.childLoaded;
      fixture.detectChanges();
      // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
      const el = ngMocks.find(ChildComponent);
      expect(ngMocks.formatText(el)).toEqual('child');
      expect(isMockOf(el.componentInstance, ChildComponent)).toEqual(
        false,
      );
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent, ChildComponent));

    it('loads lazy component as a mock', async () => {
      const fixture = MockRender(TargetComponent);
      fixture.detectChanges();
      await fixture.componentInstance.childLoaded;
      fixture.detectChanges();
      // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
      const el = ngMocks.find(ChildComponent);
      expect(ngMocks.formatText(el)).toEqual('');
      expect(isMockOf(el.componentInstance, ChildComponent)).toEqual(
        true,
      );
    });
  });
});
