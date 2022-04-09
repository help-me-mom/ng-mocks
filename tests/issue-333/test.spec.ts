import { CommonModule } from '@angular/common';
import * as core from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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

@core.NgModule({
  declarations: [MockComponent, DepComponent],
  entryComponents: [MockComponent],
  exports: [MockComponent],
  imports: [CommonModule],
})
class MockModule {}

// @see https://github.com/ike18t/ng-mocks/issues/333
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
        '<dynamic-overlay></dynamic-overlay>',
      );
    });

    it('should project content', () => {
      const fixture = MockRender(DynamicOverlayComponent);
      fixture.point.componentInstance.attachComponent(MockComponent);
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual('Dependency');
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
        '<dynamic-overlay></dynamic-overlay>',
      );
    });

    it('projects content', () => {
      const fixture = MockRender(DynamicOverlayComponent);
      fixture.point.componentInstance.attachComponent(MockComponent);
      fixture.detectChanges();

      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<dynamic-overlay><mock-component></mock-component></dynamic-overlay>',
      );
      const instance = ngMocks.findInstance(MockComponent);
      expect(isMockOf(instance, MockComponent)).toEqual(true);
    });

    if (!(core as any).ɵivyEnabled) {
      it('fails on unknown', () => {
        const fixture = MockRender(DynamicOverlayComponent);
        fixture.point.componentInstance.attachComponent(DepComponent);
        expect(() => fixture.detectChanges()).toThrowError(
          /DepComponent/,
        );
      });
    }
  });

  describe('3:mock', () => {
    // Because of junit issue we need to return before beforeEach
    // https://github.com/karma-runner/karma-junit-reporter/issues/186
    if ((core as any).ɵivyEnabled) {
      it('ivy fails differently', () => {
        // pending('ivy fails differently');
        expect(true).toBeTruthy();
      });

      return;
    }

    // this should work with and without ivy
    beforeEach(() =>
      MockBuilder(DynamicOverlayComponent, OverlayModule),
    );

    it('fails on unknown', () => {
      const fixture = MockRender(DynamicOverlayComponent);
      fixture.point.componentInstance.attachComponent(MockComponent);
      expect(() => fixture.detectChanges()).toThrowError(
        /MockComponent/,
      );
    });
  });

  // Ensuring that everything has been reset properly
  describe('real', () => {
    beforeEach(async () =>
      TestBed.configureTestingModule({
        imports: [MockModule, OverlayModule],
      }).compileComponents(),
    );

    it('renders all components', () => {
      const fixture = MockRender(DynamicOverlayComponent);
      expect(ngMocks.formatText(fixture)).toEqual('');

      fixture.point.componentInstance.attachComponent(MockComponent);
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('Dependency');
    });
  });
});
