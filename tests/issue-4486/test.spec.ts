import { Component, NgModule, VERSION } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'real',
  template: 'real',
})
class RealComponent {}

@NgModule({
  declarations: [RealComponent],
  exports: [RealComponent],
})
class RealModule {}

@Component({
  selector: 'nested',
  template: '<real></real>',
})
class NestedComponent {}

@NgModule({
  imports: [RealModule],
  declarations: [NestedComponent],
  exports: [NestedComponent],
})
class NestedModule {}

@Component({
  selector: 'target',
  standalone: true,
  imports: [NestedModule],
  template: `<nested></nested>`,
} as never)
class StandaloneComponent {}

@Component({
  selector: 'real',
  template: 'test',
})
class RealTestingComponent {}

@NgModule({
  declarations: [RealTestingComponent],
  exports: [RealTestingComponent],
})
class RealTestingModule {}

@NgModule({
  declarations: [NestedComponent],
  exports: [NestedComponent],
  imports: [RealTestingModule],
})
class NestedTestingModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4486
describe('issue-4486', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('a14', () => {
      // pending('Need Angular >= 14');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder(StandaloneComponent).replace(
      NestedModule,
      NestedTestingModule,
    ),
  );

  it('renders RealTestingComponent', () => {
    const fixture = MockRender(StandaloneComponent);

    expect(ngMocks.formatText(fixture)).toEqual('test');
  });
});
