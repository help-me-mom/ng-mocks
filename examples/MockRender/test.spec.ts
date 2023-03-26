import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  NgModule,
  Output,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'child',
  template: 'dependency',
})
class ChildComponent {
  @ContentChild('something', {} as any)
  public injectedSomething?: TemplateRef<any>;
  @Input() public someInput = '';
  @Output() public readonly someOutput = new EventEmitter();

  public childMockRender() {}
}

@NgModule({
  declarations: [ChildComponent],
  imports: [CommonModule],
})
class ChildModule {}

@Component({
  selector: 'target',
  template: `
    <child
      [someInput]="value1"
      (someOutput)="trigger.emit($event)"
    ></child>
  `,
})
class TargetComponent {
  @Output() public readonly trigger = new EventEmitter();
  @Input() public value1 = 'default1';
  @Input() public value2 = 'default2';

  public targetMockRender() {}
}

describe('MockRender', () => {
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetComponent, ChildModule));

  it('renders template', () => {
    const spy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    // in case of jest
    // const spy = jest.fn();

    const fixture = MockRender(
      `
        <target
          (trigger)="myListener1($event)"
          [value1]="myParam1"
          value2="check"
        >
          <ng-template #header>
            something as ng-template
          </ng-template>
          something as ng-content
        </target>
      `,
      {
        myListener1: spy,
        myParam1: 'something1',
      },
    );

    // ngMocks.input helps to get the current value of an input on
    // a related debugElement without knowing its owner.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something1',
    );
    expect(ngMocks.input(fixture.point, 'value2')).toEqual('check');

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo1');
    expect(spy).toHaveBeenCalledWith('foo1');
  });

  it('renders inputs and outputs automatically', () => {
    const spy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    // in case of jest
    // const logoClickSpy = jest.fn();

    // Generates a template like:
    // <target [value1]="value1" [value2]="value2"
    // (trigger)="trigger"></target>.
    const fixture = MockRender(TargetComponent, {
      trigger: spy,
      value1: 'something2',
    });

    // Checking the inputs.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something2',
    );
    expect(ngMocks.input(fixture.point, 'value2')).toEqual(
      'default2',
    );

    // Checking the outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo2');
    expect(spy).toHaveBeenCalledWith('foo2');

    // checking that an updated value has been passed into
    // the testing component.
    fixture.componentInstance.value1 = 'updated';
    fixture.detectChanges();
    expect(ngMocks.input(fixture.point, 'value1')).toEqual('updated');
  });
});
