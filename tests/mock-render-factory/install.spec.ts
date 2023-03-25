import { Component, Input, NgModule } from '@angular/core';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-render-factory-install',
  template: '{{ value }}',
})
class TargetComponent {
  @Input() public readonly value: number | null = null;
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

describe('mock-render-factory:install', () => {
  describe('explicit', () => {
    const factory = MockRenderFactory(TargetComponent, ['value']);

    ngMocks.faster();
    beforeAll(() => MockBuilder(TargetComponent, TargetModule));
    beforeAll(() => factory.configureTestBed());

    it('renders 1 value', () => {
      const fixture = factory({ value: 1 });
      expect(ngMocks.formatText(fixture)).toEqual('1');
    });

    it('renders 2 value', () => {
      const fixture = factory({ value: 2 });
      expect(ngMocks.formatText(fixture)).toEqual('2');
    });
  });

  describe('auto', () => {
    const factory = MockRenderFactory(TargetComponent, ['value']);

    ngMocks.faster();
    beforeAll(() => MockBuilder(TargetComponent, TargetModule));

    it('installs and renders 1 value', () => {
      const fixture = factory({ value: 1 });
      expect(ngMocks.formatText(fixture)).toEqual('1');
    });

    it('does not install and renders 2 value', () => {
      const fixture = factory({ value: 2 });
      expect(ngMocks.formatText(fixture)).toEqual('2');
    });
  });

  describe('each', () => {
    const factory = MockRenderFactory(TargetComponent, ['value']);

    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('installs and renders 1 value', () => {
      const fixture = factory({ value: 1 });
      expect(ngMocks.formatText(fixture)).toEqual('1');
    });

    it('installs and renders 2 value', () => {
      const fixture = factory({ value: 2 });
      expect(ngMocks.formatText(fixture)).toEqual('2');
    });
  });
});
