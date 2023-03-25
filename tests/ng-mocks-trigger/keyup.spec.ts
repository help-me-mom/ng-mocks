import { Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-trigger-keyup',
  template: `
    <input
      [formControl]="control"
      (keyup)="keyupTag = $event"
      (keyup.enter)="keyupTagEnter = control.value"
      (keydown.shift.control.z)="control.setValue(null)"
      #element
    />
  `,
})
class TargetComponent {
  public readonly control = new FormControl();
  public keyupTag: any;
  public keyupTagEnter: any;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('ng-mocks-trigger:keyup', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('is able to keyup for all subscribers via ngMocks.trigger with string', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const debugElement = ngMocks.find('input');

    expect(component.keyupTagEnter).toBeUndefined();

    ngMocks.change(debugElement, '1');
    expect(component.keyupTagEnter).toBeUndefined();

    ngMocks.change(debugElement, '2');
    expect(component.keyupTagEnter).toBeUndefined();

    ngMocks.trigger(debugElement, 'keyup.enter');
    expect(component.keyupTagEnter).toEqual('2');
    expect(component.control.value).toEqual('2');

    ngMocks.trigger(debugElement, 'keydown.shift.control.z');
    expect(component.control.value).toEqual(null);

    expect(() =>
      ngMocks.trigger(debugElement, 'keydown.shift.magic.control.z'),
    ).toThrowError('Unknown event part magic');
  });

  it('provides correct codes', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const debugElement = ngMocks.find('input');

    ngMocks.trigger(debugElement, 'keyup.A');
    expect(component.keyupTag).toEqual(
      assertion.objectContaining({
        code: 'KeyA',
        key: 'A',
      }),
    );

    ngMocks.trigger(debugElement, 'keyup.a');
    expect(component.keyupTag).toEqual(
      assertion.objectContaining({
        code: 'KeyA',
        key: 'a',
      }),
    );

    ngMocks.trigger(debugElement, 'keyup.5');
    expect(component.keyupTag).toEqual(
      assertion.objectContaining({
        code: 'Digit5',
        key: '5',
      }),
    );

    // TODO fix one day
    ngMocks.trigger(debugElement, 'keyup.$');
    expect(component.keyupTag).toEqual(
      assertion.objectContaining({
        code: 'Unknown',
        key: '$',
      }),
    );
  });
});
