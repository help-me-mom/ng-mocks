import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockComponent, ngMocks } from 'ng-mocks';

@Component({
  selector: 'mock-component-import-child',
  standalone: true,
  template: 'real:{{ value }}',
})
class ChildComponent {
  public static constructed = 0;

  @Input() public value = '';

  public constructor() {
    ChildComponent.constructed += 1;
  }
}

@Component({
  selector: 'mock-component-import-host',
  standalone: true,
  imports: [ChildComponent],
  template:
    '<mock-component-import-child [value]="value"></mock-component-import-child>',
})
class HostComponent {
  public value = 'bound';
}

@Component({
  selector: 'mock-component-import-child',
  standalone: true,
  host: { 'data-native-replacement': '' },
  template: 'replacement:{{ value }}',
})
class ReplacementComponent {
  @Input() public value = '';
}

describe('MockComponent:standalone imports', () => {
  it('removes both automatic and native occurrences when the installed mock is named explicitly', async () => {
    const mock = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    })
      .overrideComponent(HostComponent, { add: { imports: [mock] } })
      .overrideComponent(HostComponent, {
        remove: { imports: [mock] },
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement:bound');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });

  it('applies a later removal to the literal entries from a native set', async () => {
    const mock = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    })
      .overrideComponent(HostComponent, {
        set: { imports: [ReplacementComponent] },
      })
      .overrideComponent(HostComponent, {
        remove: { imports: [ReplacementComponent] },
        add: { imports: [mock] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      ngMocks.find(fixture, ChildComponent).providerTokens,
    ).toContain(mock);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
  it('preserves a native explicit mock set when the original import is subsequently removed', async () => {
    const mock = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({ imports: [HostComponent] })
      .overrideComponent(HostComponent, { set: { imports: [mock] } })
      .overrideComponent(HostComponent, {
        remove: { imports: [ChildComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      ngMocks.find(fixture, ChildComponent).providerTokens,
    ).toContain(mock);
  });

  it('discards automatic provenance after a native import set', async () => {
    const mock = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    })
      .overrideComponent(HostComponent, { set: { imports: [mock] } })
      .overrideComponent(HostComponent, {
        remove: { imports: [ChildComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      ngMocks.find(fixture, ChildComponent).providerTokens,
    ).toContain(mock);
  });
  beforeEach(() => {
    ChildComponent.constructed = 0;
  });

  it('retains the explicit mock class and restores the real import on reset', async () => {
    const mock = MockComponent(ChildComponent);
    expect(MockComponent(ChildComponent)).toBe(mock);

    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const child = ngMocks.find(fixture, ChildComponent);

    // Being a mock of the same source is insufficient: callers supplied this class.
    expect(isMockOf(child.componentInstance, ChildComponent)).toBe(
      true,
    );
    expect(child.providerTokens).toContain(mock);
    expect(child.injector.get(mock, null)).toBe(
      child.componentInstance,
    );
    expect(child.componentInstance.value).toBe('bound');
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(ChildComponent.constructed).toBe(0);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    const realFixture = TestBed.createComponent(HostComponent);
    realFixture.detectChanges();
    const real = ngMocks.find(realFixture, ChildComponent);

    expect(isMockOf(real.componentInstance, ChildComponent)).toBe(
      false,
    );
    expect(real.componentInstance instanceof ChildComponent).toBe(
      true,
    );
    expect(real.componentInstance.value).toBe('bound');
    expect(ngMocks.formatText(realFixture)).toBe('real:bound');
    expect(ChildComponent.constructed).toBe(1);
  });

  it('retains a native remove/add replacement without a top-level mock import', async () => {
    const mock = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    })
      .overrideComponent(HostComponent, {
        remove: { imports: [ChildComponent] },
        add: { imports: [mock] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const child = ngMocks.find(fixture, ChildComponent);

    expect(child.providerTokens).toContain(mock);
    expect(child.injector.get(mock)).toBe(child.componentInstance);
    expect(child.componentInstance.value).toBe('bound');
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(ChildComponent.constructed).toBe(0);
  });

  it('retains a native set replacement after automatic mocking', async () => {
    const mock = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    })
      .overrideComponent(HostComponent, {
        set: { imports: [mock] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const child = ngMocks.find(fixture, ChildComponent);

    expect(child.providerTokens).toContain(mock);
    expect(child.injector.get(mock)).toBe(child.componentInstance);
    expect(child.componentInstance.value).toBe('bound');
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(ChildComponent.constructed).toBe(0);
  });

  it('retains a native replacement made before automatic mocking', async () => {
    const mock = MockComponent(ChildComponent);
    TestBed.overrideComponent(HostComponent, {
      remove: { imports: [ChildComponent] },
      add: { imports: [mock] },
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const child = ngMocks.find(fixture, ChildComponent);

    expect(child.providerTokens).toContain(mock);
    expect(child.injector.get(mock, null)).toBe(
      child.componentInstance,
    );
    expect(child.componentInstance.value).toBe('bound');
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(ChildComponent.constructed).toBe(0);
  });

  it('allows Angular to reuse the same mock class in repeated native imports', async () => {
    const mock = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    })
      .overrideComponent(HostComponent, {
        set: { imports: [mock, mock] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const children = ngMocks.findAll(fixture, ChildComponent);

    expect(children.length).toBe(1);
    expect(children[0].providerTokens).toContain(mock);
    expect(children[0].componentInstance.value).toBe('bound');
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(ChildComponent.constructed).toBe(0);
  });

  it('honors a distinct native replacement after automatic mocking', async () => {
    const mock = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    })
      .overrideComponent(HostComponent, {
        remove: { imports: [ChildComponent] },
        add: { imports: [ReplacementComponent] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const replacement = ngMocks.find(fixture, ReplacementComponent);

    expect(
      replacement.componentInstance instanceof ReplacementComponent,
    ).toBe(true);
    expect(replacement.componentInstance.value).toBe('bound');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
    expect(ngMocks.formatText(fixture)).toBe('replacement:bound');
    expect(ChildComponent.constructed).toBe(0);
  });

  it('honors a distinct native replacement before automatic mocking', async () => {
    const mock = MockComponent(ChildComponent);
    TestBed.overrideComponent(HostComponent, {
      remove: { imports: [ChildComponent] },
      add: { imports: [ReplacementComponent] },
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const replacement = ngMocks.find(fixture, ReplacementComponent);

    expect(replacement.componentInstance.value).toBe('bound');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
    expect(ngMocks.formatText(fixture)).toBe('replacement:bound');
    expect(ChildComponent.constructed).toBe(0);
  });

  it('retains native removals without adding a replacement', async () => {
    const mock = MockComponent(ChildComponent);
    const consoleError = console.error;
    const messages: string[] = [];
    ngMocks.stubMember(console, 'error', (...args: unknown[]) => {
      messages.push(args.join(' '));
    });
    try {
      await TestBed.configureTestingModule({
        imports: [HostComponent, mock],
        errorOnUnknownElements: false,
      })
        .overrideComponent(HostComponent, {
          remove: { imports: [ChildComponent] },
        })
        .overrideComponent(HostComponent, {
          set: {
            template:
              '<mock-component-import-child></mock-component-import-child>',
          },
        })
        .compileComponents();
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
      expect(messages.length).toBe(1);
      expect(messages[0]).toContain('mock-component-import-child');
      expect(ChildComponent.constructed).toBe(0);
    } finally {
      ngMocks.stubMember(console, 'error', consoleError);
    }
  });

  it('retains explicit identity across repeated mixed configurations', async () => {
    const mock = MockComponent(ChildComponent);
    TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const child = ngMocks.find(fixture, ChildComponent);

    expect(child.providerTokens).toContain(mock);
    expect(child.injector.get(mock, null)).toBe(
      child.componentInstance,
    );
    expect(child.componentInstance.value).toBe('bound');
    expect(ngMocks.findAll(fixture, ChildComponent).length).toBe(1);
    expect(ChildComponent.constructed).toBe(0);
  });
});
