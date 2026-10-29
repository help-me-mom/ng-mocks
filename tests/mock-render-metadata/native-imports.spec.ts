import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockComponent,
  MockRender,
  MockRenderFactory,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'native-middleware-child',
  standalone: true,
  template: 'original',
})
class ChildComponent {}

@Component({
  selector: 'native-middleware-child',
  standalone: true,
  host: { 'data-native-middleware': '' },
  template: 'replacement',
})
class ReplacementComponent {}

@Component({
  selector: 'native-middleware[first], native-middleware[second]',
  standalone: true,
  imports: [ChildComponent],
  template: '<native-middleware-child></native-middleware-child>',
})
class HostComponent {}

describe('mock-render-metadata:native imports', () => {
  it('replays native replacements into a complex-selector wrapper without mocks', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] })
      .overrideComponent(HostComponent, {
        remove: { imports: [ChildComponent] },
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = MockRender(HostComponent);

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });

  it('replays translated imports when middleware is created after a native override', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, MockComponent(ChildComponent)],
    })
      .overrideComponent(HostComponent, {
        remove: { imports: [ChildComponent] },
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = MockRender(HostComponent);

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });

  it('forwards translated imports to middleware already created by a factory', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, MockComponent(ChildComponent)],
    }).compileComponents();
    const factory = MockRenderFactory(HostComponent);
    factory.configureTestBed();
    TestBed.overrideComponent(HostComponent, {
      remove: { imports: [ChildComponent] },
      add: { imports: [ReplacementComponent] },
    });
    const fixture = factory();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });
});
