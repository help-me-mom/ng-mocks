import {
  Component,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[metadataHost]',
  standalone: true,
})
class HostDirective {
  @HostBinding('attr.data-value')
  @Input()
  public value = 'default';

  @Output() public readonly changed = new EventEmitter<string>();

  @HostListener('click')
  public click(): void {
    this.changed.emit(this.value);
  }
}

@Component({
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['value: publicValue'],
      outputs: ['changed: publicChanged'],
    },
  ],
  selector: 'metadata-host[first], metadata-host[second]',
  standalone: true,
  template: '',
})
class TargetComponent {}

describe('mock-render-metadata:host-directives', () => {
  beforeEach(() => MockBuilder([TargetComponent, HostDirective]));

  it('registers inherited host directives once and preserves exposed bindings', () => {
    const changed =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    const fixture = MockRender(TargetComponent, {
      publicChanged: changed,
      publicValue: 'initial',
    });
    const directive = ngMocks.findInstance(HostDirective);

    expect(ngMocks.findInstances(HostDirective)).toEqual([directive]);
    expect(directive.value).toEqual('initial');
    expect(fixture.point.nativeElement.dataset.value).toEqual(
      'initial',
    );
    ngMocks.trigger(fixture.point, 'click');
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith('initial');

    fixture.componentInstance.publicValue = 'updated';
    fixture.detectChanges();
    expect(directive.value).toEqual('updated');
    expect(fixture.point.nativeElement.dataset.value).toEqual(
      'updated',
    );
    ngMocks.trigger(fixture.point, 'click');
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed).toHaveBeenCalledWith('updated');
  });
});
