import { Component, NgModule } from '@angular/core';
import { render } from '@testing-library/angular';
import { MockBuilder, ngMocks } from 'ng-mocks';

@Component({
  selector: 'header',
  template: 'header',
})
class HeaderComponent {}

@Component({
  selector: 'target',
  template: '<header></header>',
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent, HeaderComponent],
})
class TargetModule {}

describe('testing-library:classic', () => {
  describe('TestBed', () => {
    it('keeps header', async () => {
      const context = await render(TargetComponent, {
        declarations: [HeaderComponent],
      });
      expect(ngMocks.formatHtml(context.fixture)).toEqual(
        '<header>header</header>',
      );
    });
  });

  describe('ngMocks.guts', () => {
    const dependencies = ngMocks.guts(TargetComponent, TargetModule);

    it('mocks header', async () => {
      const context = await render(TargetComponent, dependencies);
      expect(ngMocks.formatHtml(context.fixture)).toEqual(
        '<header></header>',
      );
    });
  });

  describe('MockBuilder', () => {
    const dependencies = MockBuilder(
      TargetComponent,
      TargetModule,
    ).build();

    it('mocks header', async () => {
      const context = await render(TargetComponent, dependencies);
      expect(ngMocks.formatHtml(context.fixture)).toEqual(
        '<header></header>',
      );
    });
  });
});
