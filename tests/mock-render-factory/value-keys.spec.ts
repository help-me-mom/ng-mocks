import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'target-mock-render-factory-value-keys',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ value && value() }}',
})
class TargetComponent {
  @Input('publicValue') public value?: () => string;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14913
describe('mock-render-factory:value-keys', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('keeps value and callback policies separate for factories sharing a cached wrapper', () => {
    const valueOptions = {
      configureTestBed: false,
      valueKeys: ['value'],
    };
    const callbackOptions = {
      configureTestBed: false,
      valueKeys: [],
    };
    const valueFactory = MockRenderFactory(
      '{{ value() }}',
      ['label', 'value'],
      valueOptions,
    );
    const callbackFactory = MockRenderFactory(
      '{{ value() }}',
      ['label', 'value'],
      callbackOptions,
    );
    expect(callbackFactory.declaration).toBe(
      valueFactory.declaration,
    );
    valueFactory.configureTestBed();

    const value = () => 'value';
    const valueFixture = valueFactory({ label: 'value', value });
    let receiver: object | undefined;
    const callbackParams = {
      label: 'callback',
      value() {
        receiver = this;

        return this.label;
      },
    };
    const callbackFixture = callbackFactory(callbackParams);
    const callback = callbackFixture.componentInstance.value;

    expect(valueFixture.componentInstance.value).toBe(value);
    expect(ngMocks.formatText(valueFixture)).toEqual('value');
    expect(callback).not.toBe(callbackParams.value);
    expect(callbackFixture.componentInstance.value).toBe(callback);
    expect(receiver).toBe(callbackParams);
    expect(ngMocks.formatText(callbackFixture)).toEqual('callback');

    callbackFixture.componentInstance.value = function (this: {
      label: string;
    }) {
      receiver = this;

      return `updated:${this.label}`;
    };
    callbackFixture.detectChanges();
    const replacement = callbackFixture.componentInstance.value;

    expect(replacement).not.toBe(callback);
    expect(replacement).not.toBe(callbackParams.value);
    expect(callbackFixture.componentInstance.value).toBe(replacement);
    expect(receiver).toBe(callbackParams);
    expect(ngMocks.formatText(callbackFixture)).toEqual(
      'updated:callback',
    );
    expect(valueFixture.componentInstance.value).toBe(value);

    const nextValueFixture = valueFactory({ label: 'value', value });

    expect(nextValueFixture.componentInstance.value).toBe(value);
    expect(callbackFixture.componentInstance.value).toBe(replacement);
  });

  it('preserves a callable assigned later to an explicitly bound missing key', () => {
    const options = {
      configureTestBed: false,
      valueKeys: ['value'],
    };
    const factory = MockRenderFactory<TargetComponent>(
      '<target-mock-render-factory-value-keys [publicValue]="value"></target-mock-render-factory-value-keys>',
      ['value'],
      options,
    );
    factory.configureTestBed();
    const params: { value?: () => string } = {};
    const fixture = factory(params);

    expect(fixture.componentInstance.value).toBeUndefined();
    expect(fixture.point.componentInstance.value).toBeUndefined();
    expect(ngMocks.formatText(fixture)).toEqual('');

    const value = () => 'assigned later';
    params.value = value;
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe(value);
    expect(fixture.point.componentInstance.value).toBe(value);
    expect(ngMocks.formatText(fixture)).toEqual('assigned later');

    const replacement = () => 'wrapper assignment';
    fixture.componentInstance.value = replacement;
    fixture.detectChanges();

    expect(params.value).toBe(replacement);
    expect(fixture.point.componentInstance.value).toBe(replacement);
    expect(ngMocks.formatText(fixture)).toEqual('wrapper assignment');
  });

  it('preserves automatic component input aliases with an empty valueKeys list', () => {
    const options = {
      configureTestBed: false,
      valueKeys: [],
    };
    const factory = MockRenderFactory(
      TargetComponent,
      ['publicValue', 'extra'],
      options,
    );
    factory.configureTestBed();
    const value = () => 'automatic input';
    const extra = () => 'ordinary callback';
    const fixture = factory({ publicValue: value, extra });

    expect(fixture.componentInstance.publicValue).toBe(value);
    expect(fixture.point.componentInstance.value).toBe(value);
    expect(ngMocks.formatText(fixture)).toEqual('automatic input');
    expect(fixture.componentInstance.extra).not.toBe(extra);
    expect(fixture.componentInstance.extra()).toEqual(
      'ordinary callback',
    );
  });

  it('adds explicit value keys without replacing automatic component input aliases', () => {
    const options = {
      configureTestBed: false,
      valueKeys: ['extra'],
    };
    const factory = MockRenderFactory(
      TargetComponent,
      ['publicValue', 'extra'],
      options,
    );
    factory.configureTestBed();
    const value = () => 'automatic input';
    const extra = () => 'explicit value';
    const fixture = factory({ publicValue: value, extra });

    expect(fixture.componentInstance.publicValue).toBe(value);
    expect(fixture.point.componentInstance.value).toBe(value);
    expect(ngMocks.formatText(fixture)).toEqual('automatic input');
    expect(fixture.componentInstance.extra).toBe(extra);
    expect(fixture.componentInstance.extra()).toEqual(
      'explicit value',
    );
  });
});
