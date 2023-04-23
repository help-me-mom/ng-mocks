import { Component, NgModule, VERSION } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/5520
describe('issue-5520', () => {
  if (Number.parseInt(VERSION.major, 10) < 15) {
    it('needs a15', () => {
      // pending('Need Angular 15+');
      expect(true).toBeTruthy();
    });

    return;
  }

  @Component({
    selector: 'dependency',
    template: '',
  })
  class DependencyComponent {
    dependency5520() {}
  }

  @NgModule({
    declarations: [DependencyComponent],
    exports: [DependencyComponent],
  })
  class DependencyModule {}

  @Component(
    {
      selector: 'standalone',
      standalone: true,
      template: '<dependency></dependency>',
      imports: [DependencyModule],
    } as never /* TODO: remove after upgrade to a15 */,
  )
  class StandaloneComponent {
    standalone5520() {}
  }

  beforeEach(() =>
    MockBuilder(StandaloneComponent, null)
      .keep(DependencyModule)
      .mock(DependencyComponent),
  );
  // Error: MockBuilder has found a missing dependency: DependencyModule. It means no module provides it.
  // Please, use the "export" flag if you want to add it explicitly. https://ng-mocks.sudo.eu/api/MockBuilder#export-flag

  it('creates StandaloneComponent', () => {
    expect(() => MockRender(StandaloneComponent)).not.toThrow();
  });
});
