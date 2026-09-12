import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-value-keys',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ label && label() }}',
})
class TargetComponent {
  @Input('labelFactory') public label?: () => string;
  @Output() public readonly selected = new EventEmitter<string>();
}

describe('MockRender:value-keys', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('preserves callable data and binds output callbacks to params', () => {
    const callable = () => 'callable value';
    let receiver: object | undefined;
    const params = {
      read: callable,
      selectedValue: '',
      onSelected(value: string) {
        receiver = this;
        this.selectedValue = value;
      },
    };
    const fixture = MockRender<TargetComponent, typeof params>(
      `
        <target-value-keys
          [labelFactory]="read"
          (selected)="onSelected($event)"
        ></target-value-keys>
      `,
      params,
      // Select the params key used by the input binding.
      { valueKeys: ['read'] },
    );

    expect(fixture.componentInstance.read).toBe(callable);
    expect(fixture.point.componentInstance.label).toBe(callable);
    expect(ngMocks.formatText(fixture)).toEqual('callable value');

    fixture.point.componentInstance.selected.emit('chosen');

    expect(receiver).toBe(params);
    expect(params.selectedValue).toEqual('chosen');
  });
});
