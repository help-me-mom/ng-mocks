import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, ngMocks } from 'ng-mocks';

@Component({
  selector: 'optional-native-child',
  standalone: true,
  template: 'original',
})
class ChildComponent {}

@Component({
  selector: 'optional-native-child',
  standalone: true,
  host: { 'data-optional-native': '' },
  template: 'replacement',
})
class ReplacementComponent {}

@Component({
  selector: 'optional-native-host',
  standalone: true,
  imports: [ChildComponent],
  template: '<optional-native-child></optional-native-child>',
})
class HostComponent {}

describe('MockComponent:optional native metadata', () => {
  it('restores native imports after an explicit unset and optional operations', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] })
      .overrideComponent(HostComponent, {
        set: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        add: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        remove: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
  });

  it('restores tracked imports after an explicit unset and optional operations', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, MockComponent(ChildComponent)],
    })
      .overrideComponent(HostComponent, {
        set: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        add: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        remove: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
  });

  it('retains native handling of an optional entry added to a defined array', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] })
      .overrideComponent(HostComponent, { set: { imports: [] } })
      .overrideComponent(HostComponent, {
        add: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        remove: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
  });

  it('retains tracked handling of an optional entry added to a defined array', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, MockComponent(ChildComponent)],
    })
      .overrideComponent(HostComponent, { set: { imports: [] } })
      .overrideComponent(HostComponent, {
        add: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        remove: { imports: undefined },
      })
      .overrideComponent(HostComponent, {
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
  });
});
