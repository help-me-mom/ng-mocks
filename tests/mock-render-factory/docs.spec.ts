import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  selector: 'my',
  template: '',
})
class MyComponent {
  @Input() public input1 = 0;
  @Input() public input2 = 0;
  @Output() public output1 = new EventEmitter<void>();
  @Output() public output2 = new EventEmitter<void>();
}

@NgModule({
  declarations: [MyComponent],
})
class MyModule {}

describe('Maximum performance', () => {
  ngMocks.faster();

  beforeAll(() => MockBuilder(MyComponent, MyModule));

  let factory: MockRenderFactory<MyComponent, 'input1' | 'input2'>;
  beforeAll(() => {
    factory = MockRenderFactory(MyComponent, ['input1', 'input2']);
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
