import {
  Component,
  EventEmitter,
  Input,
  input,
  isSignal,
  Output,
  reflectComponentType,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

let transformations = 0;

@Component({
  selector: 'target-14839[myInput]',
  standalone: true,
  template: '{{ myInput() }}:{{ quantity() }}:{{ label }}',
})
class TargetComponent {
  public readonly myInput = input.required<string>();
  public readonly quantity = input(0, {
    alias: 'publicQuantity',
    transform: (value: number | string) => {
      transformations += 1;

      return Number(value) + 1;
    },
  });
  @Input('publicLabel') public label = 'default-label';
  @Output() public readonly changed = new EventEmitter<string>();
}

@Component({
  standalone: true,
  template: '{{ myInput() }}',
})
class SelectorlessComponent {
  public readonly myInput = input('default-value');
}

@Component({
  selector: 'target-14839-first, target-14839-second',
  standalone: true,
  template: '{{ myInput() }}',
})
class MultipleSelectorsComponent {
  public readonly myInput = input.required<string>();
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14839
describe('issue-14839', () => {
  if (
    !reflectComponentType(TargetComponent)?.inputs.some(
      inputMetadata => inputMetadata.propName === 'myInput',
    )
  ) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder([
      TargetComponent,
      SelectorlessComponent,
      MultipleSelectorsComponent,
    ]),
  );

  // Recompiling a complex selector must retain signal input metadata;
  // otherwise Angular overwrites the signal function with the bound value.
  it('binds required signals, aliases and transforms through an attribute selector', () => {
    const changed =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    transformations = 0;
    const fixture = MockRender(TargetComponent, {
      changed,
      myInput: 'initial',
      publicLabel: 'bound-label',
      publicQuantity: '4',
    });
    const instance = fixture.point.componentInstance;
    const myInput = instance.myInput;
    const quantity = instance.quantity;

    expect(isSignal(myInput)).toBe(true);
    expect(isSignal(quantity)).toBe(true);
    expect(myInput()).toEqual('initial');
    expect(quantity()).toEqual(5);
    expect(instance.label).toEqual('bound-label');
    expect(fixture.nativeElement.textContent).toContain(
      'initial:5:bound-label',
    );
    expect(transformations).toEqual(1);

    instance.changed.emit('emitted');
    expect(changed).toHaveBeenCalledWith('emitted');

    fixture.componentRef.setInput('myInput', 'updated');
    fixture.componentRef.setInput('publicQuantity', '6');
    fixture.componentRef.setInput('publicLabel', 'updated-label');
    expect(transformations).toEqual(1);
    fixture.detectChanges();

    expect(instance.myInput).toBe(myInput);
    expect(instance.quantity).toBe(quantity);
    expect(myInput()).toEqual('updated');
    expect(quantity()).toEqual(7);
    expect(instance.label).toEqual('updated-label');
    expect(fixture.nativeElement.textContent).toContain(
      'updated:7:updated-label',
    );
    expect(transformations).toEqual(2);
  });

  it('preserves defaults and updates a selectorless signal input without params', () => {
    const fixture = MockRender(SelectorlessComponent);
    const myInput = fixture.point.componentInstance.myInput;

    expect(isSignal(myInput)).toBe(true);
    expect(myInput()).toEqual('default-value');
    expect(fixture.nativeElement.textContent).toContain(
      'default-value',
    );

    fixture.componentInstance.myInput = 'updated';
    fixture.detectChanges();

    expect(fixture.point.componentInstance.myInput).toBe(myInput);
    expect(myInput()).toEqual('updated');
    expect(fixture.nativeElement.textContent).toContain('updated');
  });

  it('preserves unbound signal inputs with empty params', () => {
    const fixture = MockRender(SelectorlessComponent, {});

    expect(isSignal(fixture.point.componentInstance.myInput)).toBe(
      true,
    );
    expect(fixture.point.componentInstance.myInput()).toEqual(
      'default-value',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'default-value',
    );
  });

  it('binds a required signal input through multiple selectors', () => {
    const fixture = MockRender(MultipleSelectorsComponent, {
      myInput: 'bound-value',
    });

    expect(isSignal(fixture.point.componentInstance.myInput)).toBe(
      true,
    );
    expect(fixture.point.componentInstance.myInput()).toEqual(
      'bound-value',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'bound-value',
    );
  });
});
