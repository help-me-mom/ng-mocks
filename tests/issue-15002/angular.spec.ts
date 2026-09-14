import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockComponent, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/15002
describe('issue-15002:angular', () => {
  const calls: string[] = [];
  const original = () => {
    calls.push('callback');

    return 'real';
  };
  let current = original;

  class Parent {
    public constructor() {
      calls.push('constructor');
    }

    public read(): string {
      calls.push('parent method');

      return 'parent';
    }
  }

  @Component({
    selector: 'accessor-15002',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
    template: '{{ label }}',
  })
  class TargetComponent extends Parent {
    @Input() public label = '';

    public read(): string {
      calls.push('child method');

      return 'child';
    }
  }

  @Component({
    changeDetection: ChangeDetectionStrategy.Default,
    selector: 'host-accessor-15002',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
    template: '<accessor-15002 [label]="label"></accessor-15002>',
  })
  class HostComponent {
    public label = 'initial';
  }

  // A method decorator can install an accessor over an inherited method.
  // Keep that descriptor stable before Angular or ng-mocks reflects the class.
  const getter = ngMocks.stubMember(
    TargetComponent.prototype,
    'read',
    () => {
      calls.push('getter');

      return current;
    },
    'get',
  );
  const setter = ngMocks.stubMember(
    TargetComponent.prototype,
    'read',
    (value: () => string) => {
      calls.push('setter');
      current = value;
    },
    'set',
  );
  const parentDescriptor = Object.getOwnPropertyDescriptor(
    Parent.prototype,
    'read',
  );

  beforeEach(() => {
    calls.length = 0;
    current = original;
  });

  it('uses the child accessor in a real Angular component', async () => {
    await TestBed.configureTestingModule({
      declarations: [HostComponent, TargetComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const component = ngMocks.get(
      ngMocks.find(fixture, TargetComponent),
      TargetComponent,
    );

    expect(isMockOf(component, TargetComponent)).toBe(false);
    expect(component.label).toBe('initial');
    expect(ngMocks.formatText(fixture)).toBe('initial');
    const callback = component.read;
    expect(callback).toBe(original);
    expect(callback()).toBe('real');

    const assigned = () => 'native assignment';
    component.read = assigned;
    expect(component.read).toBe(assigned);
    expect(current).toBe(assigned);
    expect(calls).toEqual([
      'constructor',
      'getter',
      'callback',
      'setter',
      'getter',
    ]);
  });

  it('mocks the child accessor instead of the inherited method', async () => {
    await TestBed.configureTestingModule({
      declarations: [HostComponent, MockComponent(TargetComponent)],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = ngMocks.find(fixture, TargetComponent);
    const component = ngMocks.get(element, TargetComponent);
    const descriptor = Object.getOwnPropertyDescriptor(
      component,
      'read',
    )!;

    expect(isMockOf(component, TargetComponent)).toBe(true);
    expect(typeof descriptor.get).toBe('function');
    expect(typeof descriptor.set).toBe('function');
    expect('value' in descriptor).toBe(false);
    expect(component.read).toBeUndefined();
    expect(component.label).toBe('initial');
    expect(calls).toEqual([]);

    const assigned = () => 'mock assignment';
    component.read = assigned;
    expect(component.read).toBe(assigned);
    expect(component.read()).toBe('mock assignment');
    expect(
      Object.getOwnPropertyDescriptor(component, 'read')!.get,
    ).toBe(descriptor.get);

    const customized = () => 'customized';
    const customGetter = ngMocks.stubMember(
      component,
      'read',
      () => customized,
      'get',
    );
    expect(component.read).toBe(customized);
    expect(component.read()).toBe('customized');
    expect(
      Object.getOwnPropertyDescriptor(component, 'read')!.get,
    ).toBe(customGetter);

    fixture.componentInstance.label = 'updated';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(component.label).toBe('updated');
    expect(ngMocks.get(element, TargetComponent)).toBe(component);
    expect(current).toBe(original);
    expect(calls).toEqual([]);
    const sourceDescriptor = Object.getOwnPropertyDescriptor(
      TargetComponent.prototype,
      'read',
    )!;
    expect(sourceDescriptor.get).toBe(getter);
    expect(sourceDescriptor.set).toBe(setter);
    expect(
      Object.getOwnPropertyDescriptor(Parent.prototype, 'read'),
    ).toEqual(parentDescriptor);
  });
});
