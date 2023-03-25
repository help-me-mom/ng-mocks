import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-mock-render-param-ref',
  template: '="{{ input }}"=',
})
class TargetComponent {
  @Input() public input: string | null = null;
  @Output() public readonly output = new EventEmitter<string>();
  @Output() public readonly outputThis = new EventEmitter<this>();

  public emit(): void {
    this.output.emit(`${this.input}`);
  }

  public emitThis(): void {
    this.outputThis.emit(this);
  }
}

describe('mock-render-param-ref', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  // The idea is that we can control the render component
  // via the passed params object.
  it('keeps refs w/ params', () => {
    const params = {
      input: 'v1',
      output:
        typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn(),
    };

    // By default params are set to the render component.
    const fixture = MockRender(TargetComponent, params);
    expect(fixture.nativeElement.innerHTML).toContain('="v1"=');
    fixture.point.componentInstance.emit();
    expect(params.output).toHaveBeenCalledWith('v1');

    // Let's assert that if we change params then
    // the render component respects it.
    params.input = 'v2';
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('="v2"=');
    expect(fixture.componentInstance.input).toEqual('v2');
    fixture.point.componentInstance.emit();
    expect(params.output).toHaveBeenCalledWith('v2');

    // Let's assert that if we change the render
    // component, the params are updated too.
    fixture.componentInstance.input = 'v3';
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('="v3"=');
    expect(params.input).toEqual('v3');

    // Let's assert that spies have the same behavior.
    const currentSpy = params.output;
    const newSpy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    params.output = newSpy;
    fixture.point.componentInstance.emit();
    expect(currentSpy).not.toHaveBeenCalledWith('v3');
    expect(newSpy).toHaveBeenCalledWith('v3');
  });

  // If we do not pass params then only non inputs / outputs
  // should be handles by proxy.
  it('keeps refs w/o params', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).not.toBe(
      fixture.componentInstance,
    );

    const spyOutput =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    fixture.componentInstance.output.subscribe(spyOutput);
    fixture.componentInstance.input = 'v1';
    fixture.detectChanges();
    fixture.componentInstance.emit();
    expect(spyOutput).toHaveBeenCalledWith('v1');

    const spyThis =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    fixture.componentInstance.outputThis.subscribe(spyThis);
    fixture.componentInstance.emitThis();
    expect(spyThis).toHaveBeenCalledWith(
      fixture.point.componentInstance,
    );
  });
});
