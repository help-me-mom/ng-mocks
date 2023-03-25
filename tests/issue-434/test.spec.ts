import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-434',
  template: '{{ prop1 }}:{{ prop2 }}',
})
class TargetComponent {
  public echo1Called = false;
  public echo2Called = false;

  @Input() public readonly prop1 = 'default1';
  @Input() public readonly prop2 = 'default2';
  @Output() public readonly update = new EventEmitter<void>();

  public echo1() {
    this.echo1Called = true;
  }

  public readonly echo2 = () => {
    this.echo2Called = true;
  };
}

// @see https://github.com/help-me-mom/ng-mocks/issues/434
describe('issue-434', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('keeps the default prop value on no props', () => {
    const fixture = MockRender(TargetComponent, {});
    expect(ngMocks.formatText(fixture)).toEqual('default1:default2');
  });

  it('keeps the default prop value on empty props', () => {
    const fixture = MockRender(TargetComponent, { prop2: undefined });
    expect(ngMocks.formatText(fixture)).toEqual('default1:');
  });

  it('sets the prop to a value', () => {
    const fixture = MockRender(TargetComponent, {
      prop1: 'mock',
      update:
        typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn(),
    });
    expect(ngMocks.formatText(fixture)).toEqual('mock:default2');
  });

  it('respects ref between wrapper and pointer', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.componentInstance.echo1Called).toEqual(false);
    expect(fixture.componentInstance.echo2Called).toEqual(false);
    expect(fixture.point.componentInstance.echo1Called).toEqual(
      false,
    );
    expect(fixture.point.componentInstance.echo2Called).toEqual(
      false,
    );

    // let's set cross spies
    fixture.componentInstance.echo1 =
      typeof jest === 'undefined'
        ? jasmine
            .createSpy()
            .and.callFake(fixture.componentInstance.echo1)
        : jest.fn(fixture.componentInstance.echo1);
    ngMocks.stubMember(
      fixture.point.componentInstance,
      'echo2',
      typeof jest === 'undefined'
        ? jasmine
            .createSpy()
            .and.callFake(fixture.point.componentInstance.echo2)
        : jest.fn(fixture.point.componentInstance.echo2),
    );

    // a call on the pointer should be reflected in the wrapper
    fixture.point.componentInstance.echo1();
    expect(fixture.componentInstance.echo1).toHaveBeenCalled();
    expect(fixture.componentInstance.echo1Called).toEqual(true);
    expect(fixture.point.componentInstance.echo1Called).toEqual(true);

    // a call on the wrapper should be reflected in the pointer
    fixture.componentInstance.echo2();
    expect(fixture.point.componentInstance.echo2).toHaveBeenCalled();
    expect(fixture.componentInstance.echo2Called).toEqual(true);
    expect(fixture.point.componentInstance.echo2Called).toEqual(true);
  });
});
