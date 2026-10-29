import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, ngMocks } from 'ng-mocks';

@Component({
  selector: 'cached-standalone-child',
  standalone: true,
  template: 'original',
})
class ChildComponent {}

@Component({
  selector: 'cached-standalone-child',
  standalone: true,
  host: { 'data-cached-standalone': '' },
  template: 'replacement',
})
class ReplacementComponent {}

@Component({
  selector: 'cached-standalone-parent',
  standalone: true,
  imports: [ChildComponent],
  template: '',
})
class ParentComponent {}

@Component({
  selector: 'cached-standalone-host',
  standalone: true,
  imports: [ParentComponent],
  template: '<cached-standalone-parent></cached-standalone-parent>',
})
class HostComponent {}

describe('MockComponent:cached native overrides', () => {
  afterEach(() => ngMocks.globalWipe(ChildComponent));

  it('removes a cached standalone import without a mixed bridge', async () => {
    const parent = MockComponent(ParentComponent);
    const child = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({ imports: [parent] })
      .overrideComponent(parent, {
        set: {
          template:
            '<cached-standalone-child></cached-standalone-child>',
        },
      })
      .overrideComponent(parent, {
        remove: { imports: [child] },
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(parent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });

  it('removes the current kept import when native removal addresses its cached mock', async () => {
    const parent = MockComponent(ParentComponent);
    const child = MockComponent(ChildComponent);
    ngMocks.globalKeep(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [HostComponent, parent],
    })
      .overrideComponent(parent, {
        set: {
          template:
            '<cached-standalone-child></cached-standalone-child>',
        },
      })
      .overrideComponent(parent, {
        remove: { imports: [child] },
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });
});
