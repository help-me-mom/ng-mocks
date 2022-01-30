import { Component, NgModule } from '@angular/core';
import {
  DefaultValueAccessor,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInput, MatInputModule } from '@angular/material/input';
import {
  isMockControlValueAccessor,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'my',
  template: `
    <input
      data-testid="inputControl"
      matInput
      [formControl]="myControl"
      required
    />
  `,
})
class MyComponent {
  public readonly myControl = new FormControl();
}

@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent],
  imports: [ReactiveFormsModule, MatInputModule],
})
class MyModule {}

describe('issue-305', () => {
  beforeEach(() =>
    MockBuilder(MyComponent, MyModule)
      .keep(ReactiveFormsModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly mocks matInput', () => {
    MockRender(MyComponent);

    // MatInput does not implement ControlValueAccessor
    const matInput = ngMocks.get(
      ngMocks.find(['data-testid', 'inputControl']),
      MatInput,
    );
    expect(isMockControlValueAccessor(matInput)).toEqual(false);

    // DefaultValueAccessor does implement ControlValueAccessor
    const valueAccessor = ngMocks.get(
      ngMocks.find(['data-testid', 'inputControl']),
      DefaultValueAccessor,
    );
    expect(isMockControlValueAccessor(valueAccessor)).toEqual(true);
  });
});
