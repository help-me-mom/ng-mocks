import 'reflect-metadata';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MockComponent } from './mock_component';

@Component({
  selector: 'some-selector',
  template: ''
})
class ExampleComponent {
  @Input() someInput: string;
  @Output() someOutput: EventEmitter<string>;
}

describe('MockComponent', () => {
  it('should mock the component', () => {
    MockComponent(ExampleComponent);
    expect(false).toBeTruthy();
  });
});
