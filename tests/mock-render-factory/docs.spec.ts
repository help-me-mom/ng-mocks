import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-render-factory-docs',
  template: '',
})
class TargetComponent {
  @Input() public input1 = 0;
  @Input() public input2 = 0;
  @Output() public output1 = new EventEmitter<void>();
  @Output() public output2 = new EventEmitter<void>();
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

describe('Maximum performance', () => {
  ngMocks.faster();

  beforeAll(() => MockBuilder(TargetComponent, TargetModule));

  let factory: MockRenderFactory<
    TargetComponent,
    'input1' | 'input2'
  >;
  beforeAll(() => {
    factory = MockRenderFactory(TargetComponent, [
      'input1',
      'input2',
    ]);
  });

  it('covers one case', () => {
    const fixture = factory({ input1: 1 });
    expect(fixture.point.componentInstance.input1).toEqual(1);
  });

  it('covers another case', () => {
    const fixture = factory({ input2: 2 });
    expect(fixture.point.componentInstance.input2).toEqual(2);
  });
});
