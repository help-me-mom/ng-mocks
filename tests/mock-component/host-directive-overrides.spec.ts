import { Component, Directive, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockDirective, ngMocks } from 'ng-mocks';

@Directive({ selector: '[nativeHostChild]', standalone: true })
class ChildDirective {
  @Input() public value = '';
}

@Directive({ selector: '[nativeHostReplacement]', standalone: true })
class ReplacementDirective {
  @Input() public value = '';
}

const descriptor = {
  directive: ChildDirective,
  inputs: ['value: publicValue'],
};
const replacement = {
  directive: ReplacementDirective,
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
  it('removes a host descriptor without mocks', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] })
      .overrideComponent(HostComponent, {
        remove: { hostDirectives: [descriptor] },
        add: { hostDirectives: [replacement] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('publicValue', 'bound');
    fixture.detectChanges();

    expect(
      ngMocks.findInstance(fixture, ChildDirective, null),
    ).toBeNull();
    expect(
      ngMocks.findInstance(fixture, ReplacementDirective).value,
    ).toBe('bound');
  });

  it('removes the rewritten host descriptor after mixed configuration', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, MockDirective(ChildDirective)],
    })
      .overrideComponent(HostComponent, {
        remove: { hostDirectives: [descriptor] },
        add: { hostDirectives: [replacement] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('publicValue', 'bound');
    fixture.detectChanges();

    expect(
      ngMocks.findInstance(fixture, ChildDirective, null),
    ).toBeNull();
    expect(
      ngMocks.findInstance(fixture, ReplacementDirective).value,
    ).toBe('bound');
  });

  it('removes an equivalent host descriptor before mixed configuration', async () => {
    const mock = MockDirective(ChildDirective);
    TestBed.overrideComponent(HostComponent, {
      remove: {
        hostDirectives: [
          {
            directive: ChildDirective,
            inputs: ['value: publicValue'],
          },
        ],
      },
      add: { hostDirectives: [replacement] },
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('publicValue', 'bound');
    fixture.detectChanges();

    expect(
      ngMocks.findInstance(fixture, ChildDirective, null),
    ).toBeNull();
    expect(
      ngMocks.findInstance(fixture, ReplacementDirective).value,
    ).toBe('bound');
  });

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
    expect(
      ngMocks.findInstance(fixture, ReplacementDirective, null),
    ).toBeNull();
  });
});
