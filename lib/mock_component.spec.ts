import { Component, EventEmitter, Input, Output } from '@angular/core';
import 'reflect-metadata';
import { MockComponent } from './mock_component';

@Component({
  selector: 'example-component',
  template: 'some template'
})
export class ExampleComponent {
  @Input() someInput: string;
  @Output() someOutput: EventEmitter<boolean>;
}

describe('MockComponent', () => {
  it('the mock should have the same selector as the passed in component', () => {
    const mockedComponent = MockComponent(ExampleComponent);
    const annotations = Reflect.getMetadata('annotations', mockedComponent)[0];
    expect(annotations.selector).toEqual('example-component');
  });

  it('the mock should have the same inputs and outputs as the passed in component', () => {
    const mockedComponent = MockComponent(ExampleComponent);
    const annotations = Reflect.getMetadata('annotations', mockedComponent)[0];
    expect(annotations.inputs).toEqual(['someInput']);
    expect(annotations.outputs).toEqual(['someOutput']);
  });

  it('the mock should have an ng-content body', () => {
    const mockedComponent = MockComponent(ExampleComponent);
    const annotations = Reflect.getMetadata('annotations', mockedComponent)[0];
    expect(annotations.template).toEqual('<ng-content></ng-content>');
  });
});
