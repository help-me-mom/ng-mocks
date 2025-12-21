import { NgForOf } from '@angular/common';
import { Component, NgModule, VERSION } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/5465
// TypeError: Class constructor CommonModule cannot be invoked without 'new'
describe('issue-5465', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // TODO pending('Need Angular 14+');
      expect(true).toBeTruthy();
    });

    return;
  }

  @Component({
    selector: 'app-ng-for',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
    template: `
      <span *ngFor="let letter of this.test">{{ letter }}</span>
    `,
  })
  class AppNgForComponent {
    test = ['a', 'b'];

    appNgFor5465() {}
  }

  @NgModule({
    imports: [
      NgForOf as never /* TODO: remove after upgrade to a14 */,
    ],
    declarations: [AppNgForComponent],
    exports: [AppNgForComponent],
  })
  class AppNgForModule {}

  @Component({
    selector: 'app-root',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
    template: ` <app-ng-for></app-ng-for> `,
  })
  class AppRootComponent {
    appRoot5465() {}
  }

  @NgModule({
    declarations: [AppRootComponent],
    imports: [AppNgForModule],
    providers: [],
    bootstrap: [AppRootComponent],
  })
  class AppModule {}

  beforeEach(() =>
    MockBuilder([AppRootComponent], [AppModule, NgForOf]),
  );

  it('renders AppRootComponent', () => {
    expect(() => MockRender(AppRootComponent)).not.toThrow();
  });
});
