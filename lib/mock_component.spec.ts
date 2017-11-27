import { Component, EventEmitter, Input, Output } from '@angular/core';
import 'reflect-metadata';
import { MockComponent } from './mock_component';

/* tslint:disable:max-classes-per-file */
@Component({
  selector: 'example-component',
  template: 'some template'
})
export class ExampleComponent {
  @Input() someInput: string;
  @Output() someOutput: EventEmitter<boolean>;
}

@Component({
  selector: 'empty-component',
  template: 'some template'
})
export class EmptyComponent {}
/* tslint:enable:max-classes-per-file */

describe('MockComponent', () => {
  let exampleComponent: any;

  beforeEach(() => {
    exampleComponent = {
      decorators: [
        {
          args: [{
            selector: 'example-component',
            template: 'some template',

          }],
          type: Component
        }
      ],
      propDecorators: {
        someInput: [{ type: Input }],
        someOutput: [{ type: Output }]
      }
    };
  });

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

  // make pass when testbed is brought in
  xit('each instance of a mocked component should have its own event emitter', () => {
    const mockedComponent1 = MockComponent(ExampleComponent);
    const mockedComponent2 = MockComponent(ExampleComponent);
    expect((mockedComponent1 as any).someOutput).not.toEqual((mockedComponent2 as any).someOutput);
  });

  describe('sometimes components are built like this, not sure why', () => {
    it('the mock should have the same selector as the passed in component', () => {
      const mockedComponent = MockComponent(exampleComponent);
      const annotations = Reflect.getMetadata('annotations', mockedComponent)[0];
      expect(annotations.selector).toEqual('example-component');
    });

    it('the mock should have the same inputs and outputs as the passed in component', () => {
      const mockedComponent = MockComponent(exampleComponent);
      const annotations = Reflect.getMetadata('annotations', mockedComponent)[0];
      expect(annotations.inputs).toEqual(['someInput']);
      expect(annotations.outputs).toEqual(['someOutput']);
    });

    it('the mock should have an ng-content body', () => {
      const mockedComponent = MockComponent(exampleComponent);
      const annotations = Reflect.getMetadata('annotations', mockedComponent)[0];
      expect(annotations.template).toEqual('<ng-content></ng-content>');
    });
  });

  it('should work with a component w/o inputs or outputs', () => {
    const mockedComponent = MockComponent(EmptyComponent);
    const annotations = Reflect.getMetadata('annotations', mockedComponent)[0];
    expect(annotations.inputs).toEqual([]);
    expect(annotations.outputs).toEqual([]);
  });
});
