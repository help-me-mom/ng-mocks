import { CommonModule } from '@angular/common';
import * as core from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@core.Component({
  selector: 'dynamic-overlay',
  template:
    '<ng-container *ngComponentOutlet="component"></ng-container>',
})
export class DynamicOverlayComponent {
  public component?: core.Type<any>;

  public attachComponent(component: core.Type<any>) {
    this.component = component;
  }
}

@core.NgModule({
  declarations: [DynamicOverlayComponent],
  exports: [DynamicOverlayComponent],
  imports: [CommonModule],
})
export class OverlayModule {}

@core.Component({
  selector: 'dep-component',
  template: 'Dependency',
})
class DepComponent {}

@core.Component({
  selector: 'mock-component',
  template: '<h1 *ngIf="flag"><dep-component></dep-component></h1>',
})
class MockComponent {
  public flag = true;
}

describe('issue-333', () => {
  describe('1:keep', () => {
    // this should work with and without ivy
    beforeEach(() =>
      MockBuilder(DynamicOverlayComponent, OverlayModule)
        .keep(MockComponent)
        .keep(DepComponent),
    );

    it('should render', () => {
      const fixture = MockRender(DynamicOverlayComponent);

      expect(ngMocks.formatHtml(fixture)).toEqual(
        `<dynamic-overlay></dynamic-overlay>`,
      );
    });

    it('should project content', () => {
      const fixture = MockRender(DynamicOverlayComponent);
      fixture.point.componentInstance.attachComponent(MockComponent);
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual(`Dependency`);
    });
  });

  describe('2:mock', () => {
    // this should work with and without ivy
    beforeEach(() =>
      MockBuilder(DynamicOverlayComponent, OverlayModule)
        .mock(MockComponent)
        .keep(CommonModule, { export: true }),
    );

    it('renders a mock component', () => {
      const fixture = MockRender(DynamicOverlayComponent);

      expect(ngMocks.formatHtml(fixture)).toEqual(
        `<dynamic-overlay></dynamic-overlay>`,
      );
    });

    it('projects content', () => {
      const fixture = MockRender(DynamicOverlayComponent);
      fixture.point.componentInstance.attachComponent(MockComponent);
      fixture.detectChanges();

      expect(ngMocks.formatHtml(fixture)).toEqual(
        `<dynamic-overlay><mock-component></mock-component></dynamic-overlay>`,
      );
    });

    it('fails on unknown', () => {
      if ((core as any).ɵivyEnabled) {
        pending('ivy fails differently');
      } else {
        const fixture = MockRender(DynamicOverlayComponent);
        fixture.point.componentInstance.attachComponent(DepComponent);
        expect(() => fixture.detectChanges()).toThrowError(
          /DepComponent/,
        );
      }
    });
  });

  describe('3:mock', () => {
    // this should work with and without ivy
    beforeEach(() =>
      MockBuilder(DynamicOverlayComponent, OverlayModule),
    );

    it('fails on unknown', () => {
      if ((core as any).ɵivyEnabled) {
        pending('ivy fails differently');
      } else {
        const fixture = MockRender(DynamicOverlayComponent);
        fixture.point.componentInstance.attachComponent(
          MockComponent,
        );
        expect(() => fixture.detectChanges()).toThrowError(
          /MockComponent/,
        );
      }
    });
  });
});
