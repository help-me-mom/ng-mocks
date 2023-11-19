import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { MockBuilder, ngMocks } from 'ng-mocks';

@Component({
  selector: 'header',
  template: 'header',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
})
class HeaderComponent {
  public headerComponentTestingLibraryStandalone() {}
}

@Component({
  selector: 'target',
  template: '<header></header>',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    HeaderComponent,
  ],
})
class TargetComponent {
  public targetComponentTestingLibraryStandalone() {}
}

describe('testing-library:standalone', () => {
  describe('TestBed', () => {
    it('keeps header', async () => {
      const context = await render(TargetComponent);
      expect(ngMocks.formatHtml(context.fixture)).toEqual(
        '<header>header</header>',
      );
    });
  });

  describe('MockBuilder', () => {
    const dependencies = MockBuilder(TargetComponent).build();

    it('mocks header', async () => {
      const context = await render(TargetComponent, dependencies);
      expect(ngMocks.formatHtml(context.fixture)).toEqual(
        '<header></header>',
      );
    });
  });
});
