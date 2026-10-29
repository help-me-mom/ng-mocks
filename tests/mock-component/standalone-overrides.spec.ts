import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, ngMocks } from 'ng-mocks';

@Component({
  selector: 'native-override-child',
  standalone: true,
  template: 'original',
})
class ChildComponent {}

@Component({
  selector: 'native-override-child',
  standalone: true,
  host: { 'data-native': '' },
  template: 'replacement',
})
class ReplacementComponent {}

@Component({
  selector: 'native-override-child',
  standalone: true,
  host: { 'data-global': '' },
  template: 'global replacement',
})
class GlobalReplacementComponent {}

@Component({
  selector: 'native-unrelated',
  standalone: true,
  template: '',
})
class UnrelatedComponent {}

@Component({
  selector: 'native-override-host',
  standalone: true,
  imports: [ChildComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '<native-override-child></native-override-child>',
})
class HostComponent {}

describe('MockComponent:native override composition', () => {
  afterEach(() => ngMocks.globalWipe(ChildComponent));

  it('removes a global replacement before adding a distinct native replacement', async () => {
    ngMocks.globalReplace(ChildComponent, GlobalReplacementComponent);
    await TestBed.configureTestingModule({
      imports: [HostComponent, MockComponent(UnrelatedComponent)],
    })
      .overrideComponent(HostComponent, {
        remove: { imports: [ChildComponent] },
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
    expect(
      ngMocks.find(fixture, GlobalReplacementComponent, null),
    ).toBeNull();
    expect(ngMocks.find(fixture, ReplacementComponent)).toBeDefined();
  });

  it('preserves a native schema override when automatic imports are rewritten', async () => {
    const mock = MockComponent(ChildComponent);
    TestBed.overrideComponent(HostComponent, {
      set: {
        schemas: [NO_ERRORS_SCHEMA],
        template: '<div [nativeProperty]="true">native schema</div>',
      },
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
      errorOnUnknownProperties: true,
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('native schema');
  });

  it('preserves a native template that automatic dependency overrides do not rewrite', async () => {
    const mock = MockComponent(ChildComponent);
    TestBed.overrideComponent(HostComponent, {
      set: {
        template:
          'native<native-override-child></native-override-child>',
      },
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('native');
    expect(
      ngMocks.find(fixture, ChildComponent).providerTokens,
    ).toContain(mock);
  });

  it('preserves the order of native dependency changes made before configuration', async () => {
    const mock = MockComponent(ChildComponent);
    TestBed.overrideComponent(HostComponent, {
      set: { imports: [mock] },
    });
    TestBed.overrideComponent(HostComponent, {
      set: { imports: [ReplacementComponent] },
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
    expect(ngMocks.find(fixture, ReplacementComponent)).toBeDefined();
  });
});
