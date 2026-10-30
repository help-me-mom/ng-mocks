import {
  Component,
  Directive,
  reflectComponentType,
  ViewEncapsulation,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockComponent, ngMocks } from 'ng-mocks';

@Directive({ standalone: true })
class TargetDirective {
  public readonly value = 'real directive';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15395
describe('issue-15395:directive host', () => {
  let originalWarn: typeof console.warn;
  let messages: string[];

  beforeEach(() => {
    messages = [];
    originalWarn = console.warn;
    ngMocks.stubMember(console, 'warn', (...args: unknown[]) => {
      messages.push(args.join(' '));
    });
  });

  afterEach(() => {
    ngMocks.stubMember(console, 'warn', originalWarn);
  });

  it('preserves the native diagnostic when two original helpers collide', () => {
    class DirectiveHost {}
    class DirectiveTestHost {}

    // Apply decorators at runtime so every runner compiles these fresh originals
    // after test cleanup, without relying on Angular's private host or its ID map.
    Component({
      selector: 'native-directive-host-15395',
      standalone: true,
      template: '',
      encapsulation: ViewEncapsulation.None,
      hostDirectives: [TargetDirective],
    })(DirectiveHost);
    Component({
      selector: 'native-directive-host-15395',
      standalone: true,
      template: '',
      encapsulation: ViewEncapsulation.None,
      hostDirectives: [TargetDirective],
    })(DirectiveTestHost);

    reflectComponentType(DirectiveHost);
    reflectComponentType(DirectiveTestHost);

    expect(messages.length).toBe(1);
    expect(messages[0]).toContain('NG0912:');
    expect(messages[0]).toContain(
      "Components 'DirectiveHost' and 'DirectiveTestHost'",
    );
  });

  it('mocks a distinct helper without changing its original identity or native reuse', async () => {
    class DirectiveHost {}
    class DirectiveTestHost {}

    Component({
      selector: 'div[ng-directive-test-component]',
      standalone: true,
      template: '',
      encapsulation: ViewEncapsulation.None,
      hostDirectives: [TargetDirective],
    })(DirectiveHost);
    Component({
      selector: 'div[ng-directive-test-component]',
      standalone: true,
      template: '',
      encapsulation: ViewEncapsulation.None,
      host: { 'data-directive-host': 'issue-15395' },
      hostDirectives: [TargetDirective],
    })(DirectiveTestHost);

    // Seed an ordinary component with Angular's private host shape. The static
    // attribute distinguishes our helper before MockComponent first inspects it.
    reflectComponentType(DirectiveHost);
    const properties = Object.getOwnPropertyNames(
      DirectiveTestHost.prototype,
    );
    const descriptor = Object.getOwnPropertyDescriptor(
      DirectiveTestHost,
      'ɵcmp',
    );
    const mock = MockComponent(DirectiveTestHost);
    const definition = (
      DirectiveTestHost as typeof DirectiveTestHost & {
        ɵcmp: { id: string };
      }
    ).ɵcmp;
    const id = definition.id;

    await TestBed.configureTestingModule({
      imports: [mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(mock);
    fixture.detectChanges();

    expect(
      isMockOf(fixture.componentInstance, DirectiveTestHost),
    ).toBe(true);
    expect(MockComponent(DirectiveTestHost)).toBe(mock);
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(
      (mock as typeof mock & { ɵcmp: { id: string } }).ɵcmp.id,
    ).not.toBe(id);
    expect(
      Object.getOwnPropertyNames(DirectiveTestHost.prototype),
    ).toEqual(properties);
    expect(
      Object.getOwnPropertyDescriptor(DirectiveTestHost, 'ɵcmp'),
    ).toEqual(descriptor);
    expect(messages).toEqual([]);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DirectiveTestHost],
    }).compileComponents();
    const nativeFixture = TestBed.createComponent(DirectiveTestHost);
    nativeFixture.detectChanges();

    expect(
      nativeFixture.debugElement.injector.get(TargetDirective).value,
    ).toBe('real directive');
    expect(nativeFixture.nativeElement.dataset.directiveHost).toBe(
      'issue-15395',
    );
    expect(
      (
        DirectiveTestHost as typeof DirectiveTestHost & {
          ɵcmp: { id: string };
        }
      ).ɵcmp,
    ).toBe(definition);
    expect(definition.id).toBe(id);
    expect(
      Object.getOwnPropertyNames(DirectiveTestHost.prototype),
    ).toEqual(properties);
    expect(messages).toEqual([]);
  });
});
