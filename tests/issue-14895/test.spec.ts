import {
  Component,
  Directive,
  EventEmitter,
  HostListener,
  Inject,
  InjectionToken,
  Input,
  NgModule,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockModule, ngMocks } from 'ng-mocks';

const PRIVATE_VALUE = new InjectionToken<object>(
  'PRIVATE_VALUE_14895',
);
const SHARED_VALUE = new InjectionToken<object>('SHARED_VALUE_14895');
const privateValue = { name: 'real-private-provider' };
const sharedValue = { name: 'real-shared-provider' };
let privateConstructors: string[] = [];
let privateFactoryCalls = 0;
let sharedFactoryCalls = 0;
let sharedConstructorCalls = 0;
let listenerCalls = 0;
let transformCalls = 0;

@Component({
  selector: 'private-14895',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real-private:{{ value }}',
})
class PrivateComponent {
  @Input() public value = '';
  @Output() public readonly changed = new EventEmitter<string>();

  public constructor() {
    privateConstructors.push('component');
  }
}

@Directive({
  selector: '[private14895]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class PrivateDirective {
  public constructor() {
    privateConstructors.push('directive');
  }

  @HostListener('click')
  public onClick(): void {
    listenerCalls += 1;
  }
}

@Pipe({
  name: 'private14895',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class PrivatePipe implements PipeTransform {
  public constructor() {
    privateConstructors.push('pipe');
  }

  public transform(value: string): string {
    transformCalls += 1;

    return `real-pipe:${value}`;
  }
}

@Component({
  selector: 'shared-14895',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real-shared:{{ value }}',
})
class SharedComponent {
  @Input() public value = '';

  public constructor() {
    sharedConstructorCalls += 1;
  }
}

@NgModule({
  declarations: [SharedComponent],
  exports: [SharedComponent],
  providers: [
    {
      provide: SHARED_VALUE,
      useFactory: () => {
        sharedFactoryCalls += 1;

        return sharedValue;
      },
    },
  ],
})
class SharedModule {}

@NgModule({
  declarations: [PrivateComponent, PrivateDirective, PrivatePipe],
  imports: [SharedModule],
  exports: [
    PrivateComponent,
    PrivateDirective,
    PrivatePipe,
    SharedModule,
  ],
  providers: [
    {
      provide: PRIVATE_VALUE,
      useFactory: () => {
        privateFactoryCalls += 1;

        return privateValue;
      },
    },
  ],
})
class NestedModule {
  public constructor() {
    privateConstructors.push('nested-module');
  }
}

@NgModule({
  imports: [NestedModule],
  exports: [NestedModule],
})
class BoundaryModule {
  public constructor() {
    privateConstructors.push('boundary-module');
  }
}

@Component({
  selector: 'host-14895',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <section>host:{{ value }}:{{ clicks }}</section>
    <button private14895 (click)="onClick()">toggle</button>
    <private-14895
      [value]="value"
      (changed)="value = $event"
    ></private-14895>
    <shared-14895 [value]="value"></shared-14895>
    <span>{{ value | private14895 }}</span>
  `,
})
class HostComponent {
  public value = 'initial';
  public clicks = 0;

  public constructor(
    @Inject(PRIVATE_VALUE) public readonly privateProvider: object,
    @Inject(SHARED_VALUE) public readonly sharedProvider: object,
  ) {}

  public onClick(): void {
    this.clicks += 1;
  }
}

@NgModule({
  declarations: [HostComponent],
  imports: [BoundaryModule],
})
class HostModule {}

@NgModule({
  imports: [SharedModule],
  exports: [SharedModule],
})
class IndependentModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14895
// The mixed TestBed bridge must stop inferred keeps at the explicit mock
// boundary, while a separate real import path can still keep shared children.
describe('issue-14895', () => {
  beforeEach(() => {
    privateConstructors = [];
    privateFactoryCalls = 0;
    sharedFactoryCalls = 0;
    sharedConstructorCalls = 0;
    listenerCalls = 0;
    transformCalls = 0;
  });

  it('mocks nested declarations and providers while preserving the real host', async () => {
    await TestBed.configureTestingModule({
      imports: [HostModule, MockModule(BoundaryModule)],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const component = ngMocks.findInstance(fixture, PrivateComponent);
    const directive = ngMocks.findInstance(fixture, PrivateDirective);
    const pipe = ngMocks.findInstance(fixture, PrivatePipe);
    const shared = ngMocks.findInstance(fixture, SharedComponent);

    expect(isMockOf(fixture.componentInstance, HostComponent)).toBe(
      false,
    );
    expect(isMockOf(component, PrivateComponent)).toBe(true);
    expect(isMockOf(directive, PrivateDirective)).toBe(true);
    expect(isMockOf(pipe, PrivatePipe)).toBe(true);
    expect(isMockOf(shared, SharedComponent)).toBe(true);
    expect(component.value).toEqual('initial');
    expect(fixture.componentInstance.privateProvider).not.toBe(
      privateValue,
    );
    expect(fixture.componentInstance.sharedProvider).not.toBe(
      sharedValue,
    );
    expect(privateFactoryCalls).toEqual(0);
    expect(sharedFactoryCalls).toEqual(0);
    expect(privateConstructors).toEqual([]);
    expect(sharedConstructorCalls).toEqual(0);
    expect(transformCalls).toEqual(0);
    expect(ngMocks.formatText(fixture)).toContain('host:initial:0');
    expect(ngMocks.formatText(fixture)).not.toContain(
      'real-private:',
    );
    expect(ngMocks.formatText(fixture)).not.toContain('real-shared:');
    expect(ngMocks.formatText(fixture)).not.toContain('real-pipe:');

    ngMocks.find(fixture, 'button').triggerEventHandler('click', {});
    component.changed.emit('updated');
    fixture.detectChanges();

    expect(fixture.componentInstance.clicks).toEqual(1);
    expect(fixture.componentInstance.value).toEqual('updated');
    expect(component.value).toEqual('updated');
    expect(listenerCalls).toEqual(0);
    expect(transformCalls).toEqual(0);
    expect(ngMocks.formatText(fixture)).toContain('host:updated:1');
  });

  it('keeps a shared descendant reached through an independent real module', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HostModule,
        MockModule(BoundaryModule),
        IndependentModule,
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const component = ngMocks.findInstance(fixture, PrivateComponent);
    const directive = ngMocks.findInstance(fixture, PrivateDirective);
    const pipe = ngMocks.findInstance(fixture, PrivatePipe);
    const shared = ngMocks.findInstance(fixture, SharedComponent);

    expect(isMockOf(fixture.componentInstance, HostComponent)).toBe(
      false,
    );
    expect(isMockOf(component, PrivateComponent)).toBe(true);
    expect(isMockOf(directive, PrivateDirective)).toBe(true);
    expect(isMockOf(pipe, PrivatePipe)).toBe(true);
    expect(isMockOf(shared, SharedComponent)).toBe(false);
    expect(shared.value).toEqual('initial');
    expect(fixture.componentInstance.privateProvider).not.toBe(
      privateValue,
    );
    expect(fixture.componentInstance.sharedProvider).toBe(
      sharedValue,
    );
    expect(privateFactoryCalls).toEqual(0);
    expect(sharedFactoryCalls).toEqual(1);
    expect(privateConstructors).toEqual([]);
    expect(sharedConstructorCalls).toEqual(1);
    expect(transformCalls).toEqual(0);
    expect(ngMocks.formatText(fixture)).toContain(
      'real-shared:initial',
    );
    expect(ngMocks.formatText(fixture)).not.toContain(
      'real-private:',
    );
    expect(ngMocks.formatText(fixture)).not.toContain('real-pipe:');

    ngMocks.find(fixture, 'button').triggerEventHandler('click', {});
    component.changed.emit('updated');
    fixture.detectChanges();

    expect(fixture.componentInstance.clicks).toEqual(1);
    expect(component.value).toEqual('updated');
    expect(shared.value).toEqual('updated');
    expect(listenerCalls).toEqual(0);
    expect(transformCalls).toEqual(0);
    expect(ngMocks.formatText(fixture)).toContain('host:updated:1');
    expect(ngMocks.formatText(fixture)).toContain(
      'real-shared:updated',
    );
  });

  it('preserves shared real dependencies when top-level imports are reversed', async () => {
    await TestBed.configureTestingModule({
      imports: [
        IndependentModule,
        MockModule(BoundaryModule),
        HostModule,
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const component = ngMocks.findInstance(fixture, PrivateComponent);
    const directive = ngMocks.findInstance(fixture, PrivateDirective);
    const pipe = ngMocks.findInstance(fixture, PrivatePipe);
    const shared = ngMocks.findInstance(fixture, SharedComponent);

    expect(isMockOf(fixture.componentInstance, HostComponent)).toBe(
      false,
    );
    expect(isMockOf(component, PrivateComponent)).toBe(true);
    expect(isMockOf(directive, PrivateDirective)).toBe(true);
    expect(isMockOf(pipe, PrivatePipe)).toBe(true);
    expect(isMockOf(shared, SharedComponent)).toBe(false);
    expect(shared.value).toEqual('initial');
    expect(fixture.componentInstance.privateProvider).not.toBe(
      privateValue,
    );
    expect(fixture.componentInstance.sharedProvider).toBe(
      sharedValue,
    );
    expect(privateFactoryCalls).toEqual(0);
    expect(sharedFactoryCalls).toEqual(1);
    expect(privateConstructors).toEqual([]);
    expect(sharedConstructorCalls).toEqual(1);
    expect(transformCalls).toEqual(0);
    expect(ngMocks.formatText(fixture)).toContain(
      'real-shared:initial',
    );
    expect(ngMocks.formatText(fixture)).not.toContain(
      'real-private:',
    );
    expect(ngMocks.formatText(fixture)).not.toContain('real-pipe:');

    ngMocks.find(fixture, 'button').triggerEventHandler('click', {});
    component.changed.emit('updated');
    fixture.detectChanges();

    expect(fixture.componentInstance.clicks).toEqual(1);
    expect(component.value).toEqual('updated');
    expect(shared.value).toEqual('updated');
    expect(listenerCalls).toEqual(0);
    expect(transformCalls).toEqual(0);
    expect(ngMocks.formatText(fixture)).toContain('host:updated:1');
    expect(ngMocks.formatText(fixture)).toContain(
      'real-shared:updated',
    );
  });
});
