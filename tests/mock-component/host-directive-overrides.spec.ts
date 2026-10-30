import { Component, Directive, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockDirective, ngMocks } from 'ng-mocks';

@Directive({ selector: '[nativeHostChild]', standalone: true })
class ChildDirective {
  @Input() public value = '';
}

const descriptor = {
  directive: ChildDirective,
  inputs: ['value: publicValue'],
};

@Component({
  selector: 'native-host-directive-override',
  standalone: true,
  hostDirectives: [descriptor],
  template: '',
})
class HostComponent {}

describe('MockComponent:native host directive overrides', () => {
  it('preserves a descriptor when only a different exposure is removed', async () => {
    const mock = MockDirective(ChildDirective);
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    })
      .overrideComponent(HostComponent, {
        remove: {
          hostDirectives: [
            {
              directive: ChildDirective,
              inputs: ['value: otherValue'],
            },
          ],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('publicValue', 'bound');
    fixture.detectChanges();

    expect(ngMocks.findInstance(fixture, ChildDirective).value).toBe(
      'bound',
    );
    expect(fixture.debugElement.providerTokens).toContain(mock);
  });
});
