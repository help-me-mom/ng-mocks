import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Input,
} from '@angular/core';

import {
  MockBuilder,
  MockRender,
  MockRenderFactory,
  ngMocks,
} from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'target-14913',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ callable && callable() }}',
})
class TargetComponent {
  @Input('callableAlias') public callable?: () => string;
}

@Directive({
  selector: '[target14913]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {
  @Input() public callable?: () => string;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14913
describe('issue-14913', () => {
  beforeEach(() => MockBuilder([TargetComponent, TargetDirective]));

  it('preserves callable input values in custom component templates', () => {
    const callable = () => 'initial';
    const params = { value: callable };
    const options = { detectChanges: true, valueKeys: ['value'] };
    const fixture = MockRender<TargetComponent, typeof params>(
      '<target-14913 [callableAlias]="value"></target-14913>',
      params,
      options,
    );

    expect(fixture.componentInstance.value).toBe(callable);
    expect(fixture.point.componentInstance.callable).toBe(callable);
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    const replacement = () => 'replacement';
    params.value = replacement;
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe(replacement);
    expect(fixture.point.componentInstance.callable).toBe(
      replacement,
    );
    expect(ngMocks.formatText(fixture)).toEqual('replacement');

    fixture.componentInstance.value = callable;
    fixture.detectChanges();

    expect(params.value).toBe(callable);
    expect(fixture.point.componentInstance.callable).toBe(callable);
    expect(ngMocks.formatText(fixture)).toEqual('initial');
  });

  it('preserves callable directive inputs in custom factories', () => {
    const options = { configureTestBed: false, valueKeys: ['value'] };
    const factory = MockRenderFactory(
      '<div target14913 [callable]="value"></div>',
      ['value'],
      options,
    );
    factory.configureTestBed();
    const callable = () => 'initial';
    const params = { value: callable };
    const fixture = factory(params);
    const directive = ngMocks.get(fixture.point, TargetDirective);

    expect(fixture.componentInstance.value).toBe(callable);
    expect(directive.callable).toBe(callable);
    expect(directive.callable!()).toEqual('initial');

    const replacement = () => 'replacement';
    fixture.componentInstance.value = replacement;
    fixture.detectChanges();

    expect(params.value).toBe(replacement);
    expect(directive.callable).toBe(replacement);
    expect(directive.callable!()).toEqual('replacement');
  });

  it('retains callback receiver binding, caching and replacement', () => {
    let receiver: object | undefined;
    const params = {
      label: 'initial',
      callback() {
        receiver = this;

        return this.label;
      },
    };
    const fixture = MockRender('{{ callback() }}', params);
    const callback = fixture.componentInstance.callback;

    expect(callback).not.toBe(params.callback);
    expect(fixture.componentInstance.callback).toBe(callback);
    expect(receiver).toBe(params);
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    params.label = 'updated';
    fixture.detectChanges();

    expect(fixture.componentInstance.callback).toBe(callback);
    expect(receiver).toBe(params);
    expect(ngMocks.formatText(fixture)).toEqual('updated');

    fixture.componentInstance.callback = function (this: {
      label: string;
    }) {
      receiver = this;

      return `replacement:${this.label}`;
    };
    fixture.detectChanges();

    expect(fixture.componentInstance.callback).not.toBe(callback);
    expect(fixture.componentInstance.callback).not.toBe(
      params.callback,
    );
    expect(receiver).toBe(params);
    expect(ngMocks.formatText(fixture)).toEqual(
      'replacement:updated',
    );
  });
});
