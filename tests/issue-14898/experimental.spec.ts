import {
  ChangeDetectionStrategy,
  Component,
  Input,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRender, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'experimental-14898',
  standalone: false,
  template: '{{ value }}',
})
class TargetComponent {
  @Input() public value = 'default';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14898
describe('issue-14898:experimental', () => {
  // The Angular 19 runner loads Zone.js, so explicit zoneless setup emits NG0914.
  ngMocks.ignoreOnConsole('warn');

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
  });

  // Settle before mutation: pending initial rendering can hide a missing notification.
  it('schedules class-based wrapper writes and subsequent params writes', async () => {
    const params = { value: 'initial' };
    const fixture = MockRender(TargetComponent, params);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    fixture.componentInstance.value = 'first';
    expect(params.value).toEqual('first');
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    params.value = 'second';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('second');
    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('schedules class-based wrapper writes without params', async () => {
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toBeNull();
    expect(ngMocks.formatText(fixture)).toEqual('');

    fixture.componentInstance.value = 'first';
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.value = 'second';
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('schedules custom-template params and wrapper writes with MockRender', async () => {
    const params = { value: 'initial' };
    const fixture = MockRender<TargetComponent, { value: string }>(
      '<experimental-14898 [value]="value"></experimental-14898>',
      params,
    );
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    params.value = 'first';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('first');
    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.value = 'second';
    expect(params.value).toEqual('second');
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('schedules custom-template params and wrapper writes with MockRenderFactory', async () => {
    const factory = MockRenderFactory<TargetComponent, 'value'>(
      '<experimental-14898 [value]="value"></experimental-14898>',
      ['value'],
    );
    factory.configureTestBed();
    const params = { value: 'initial' };
    const fixture = factory(params);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    params.value = 'first';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('first');
    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.value = 'second';
    expect(params.value).toEqual('second');
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });
});
