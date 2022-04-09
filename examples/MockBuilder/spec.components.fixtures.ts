import { Component, ContentChild, Inject, Input, Optional, TemplateRef } from '@angular/core';

import {
  AnythingKeep1,
  AnythingKeep2,
  MyCustomProvider1,
  MyCustomProvider2,
  MyCustomProvider3,
  MyService1,
  MyService2,
  ServiceCustomize,
  ServiceKeep,
  ServiceMock,
} from './spec.services.fixtures';
import { TOKEN_CUSTOMIZE, TOKEN_KEEP, TOKEN_MOCK } from './spec.tokens.fixtures';

@Component({
  selector: 'c-structural',
  template: `
    <div *ngIf="items && items.length">
      <ng-template ngFor [ngForOf]="items" [ngForTemplate]="injectedBlock"></ng-template>
    </div>
  `,
})
export class ContentChildComponent<T> {
  @ContentChild('block', {} as any) public readonly injectedBlock: TemplateRef<any> | undefined;
  @Input() public items: T[] | undefined;
}

@Component({
  selector: 'c-my',
  template: `
    <div>My Content</div>

    <div>MyComponent1: <c-1></c-1></div>
    <div>MyComponent2: <c-2></c-2></div>
    <div>MyComponent3: <c-3></c-3></div>
    <div>KeepComponent: <c-keep></c-keep></div>
    <div>MockComponent: <c-mock></c-mock></div>

    <div>MyDirective: <d-my></d-my></div>
    <div>KeepDirective: <d-keep></d-keep></div>
    <div>
      MockDirective 1: <span *d-mock="let z = a">render {{ z.b }}</span>
    </div>
    <div>
      MockDirective 2: <ng-template d-mock let-z>render {{ z.a }}</ng-template>
    </div>

    <div>MyPipe: {{ 'text' | my }}</div>
    <div>KeepPipe: {{ 'text' | keep }}</div>
    <div>MockPipe: {{ 'text' | mock }}</div>
    <div>CustomizePipe: {{ 'text' | customize }}</div>
    <div>RestorePipe: {{ 'text' | restore }}</div>

    <div>TOKEN_KEEP: {{ t1 }}</div>
    <div>TOKEN_MOCK: {{ t2 }}</div>
    <div>TOKEN_CUSTOMIZE: {{ t3 }}</div>

    <div>AnythingKeep1: {{ anythingKeep1?.getName() }}</div>
    <div>AnythingKeep2: {{ anythingKeep2?.getName() }}</div>
    <div>myCustomProvider1: {{ myCustomProvider1?.getName() }}</div>
    <div>myCustomProvider2: {{ myCustomProvider2?.getName() }}</div>
    <div>myCustomProvider3: {{ myCustomProvider3?.getName() }}</div>

    <div>myService1: {{ myService1?.getName() }}</div>
    <div>myService2: {{ myService2?.getName() }}</div>
    <div>serviceKeep: {{ serviceKeep?.getName() }}</div>
    <div>serviceCustomize: {{ serviceCustomize?.getName() }}</div>
    <div>serviceMock: {{ serviceMock?.getName() }}</div>

    <c-structural>
      <ng-template let-value let-b="a" #block>
        <div>ComponentStructural: {{ value }} {{ b.z }}</div>
      </ng-template>
    </c-structural>
  `,
})
export class MyComponent {
  public constructor(
    @Optional() @Inject(TOKEN_KEEP) public readonly t1: string,
    @Optional() @Inject(TOKEN_MOCK) public readonly t2: string,
    @Optional() @Inject(TOKEN_CUSTOMIZE) public readonly t3: string,
    @Optional() public readonly anythingKeep1: AnythingKeep1,
    @Optional() public readonly anythingKeep2: AnythingKeep2,
    @Optional() public readonly myCustomProvider1: MyCustomProvider1,
    @Optional() public readonly myCustomProvider2: MyCustomProvider2,
    @Optional() public readonly myCustomProvider3: MyCustomProvider3,
    @Optional() public readonly myService1: MyService1,
    @Optional() public readonly myService2: MyService2,
    @Optional() public readonly serviceKeep: ServiceKeep,
    @Optional() public readonly serviceMock: ServiceMock,
    @Optional() public readonly serviceCustomize: ServiceCustomize,
  ) {}
}

@Component({
  selector: 'c-1',
  template: 'MyComponent1',
})
export class My1Component {}

@Component({
  selector: 'c-2',
  template: 'MyComponent2',
})
export class My2Component {}

@Component({
  selector: 'c-3',
  template: 'MyComponent3',
})
export class My3Component {}

@Component({
  selector: 'c-keep',
  template: 'KeepComponent',
})
export class KeepComponent {}

@Component({
  selector: 'c-mock',
  template: 'MockComponent',
})
export class MockComponent {}
