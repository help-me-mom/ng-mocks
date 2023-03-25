import { Component, Input, NgModule } from '@angular/core';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-render-factory-tpl',
  template: '{{ i1 }}:{{ i2 }}:{{ i3 }}',
})
class TargetComponent {
  public readonly i0 = 0;
  @Input() public readonly i1: number | null = 1;
  @Input() public readonly i2: number | null = 2;
  @Input() public readonly i3: number | null = 3;
  public readonly i4 = 4;
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

describe('mock-render-factory:tpl', () => {
  describe('w/o bindings', () => {
    const factory = MockRenderFactory(TargetComponent);

    ngMocks.faster();

    beforeAll(() => MockBuilder(TargetComponent, TargetModule));
    beforeAll(() => factory.configureTestBed());

    it('binds all inputs', () => {
      const fixture = factory();
      expect(ngMocks.formatText(fixture)).toEqual('::');
    });
  });

  describe('w/ empty bindings', () => {
    const factory = MockRenderFactory(TargetComponent, []);

    ngMocks.faster();

    beforeAll(() => MockBuilder(TargetComponent, TargetModule));
    beforeAll(() => factory.configureTestBed());

    it('renders default values', () => {
      const fixture = factory();
      expect(ngMocks.formatText(fixture)).toEqual('1:2:3');
    });
  });

  describe('w/ bindings', () => {
    const factory = MockRenderFactory(
      '{{ i0 }}-<target-mock-render-factory-tpl [i1]="i1" [i2]="i2"></target-mock-render-factory-tpl>-{{ i4 }}',
      ['i0', 'i1', 'i2', 'i4'],
    );

    ngMocks.faster();

    beforeAll(() => MockBuilder(TargetComponent, TargetModule));
    beforeAll(() => factory.configureTestBed());

    it('renders undefined everywhere on empty params', () => {
      const fixture = factory();
      expect(ngMocks.formatText(fixture)).toEqual('-::3-');
    });

    it('renders provided params', () => {
      const fixture = factory({
        i0: 5,
        i1: 6,
        i2: 7,
        i4: 8,
      });
      expect(ngMocks.formatText(fixture)).toEqual('5-6:7:3-8');
    });
  });
});
