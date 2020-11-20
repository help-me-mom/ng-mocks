import { Component, ContentChild, Inject, Input, Optional, TemplateRef } from '@angular/core';

import { staticFalse } from '../../tests';

import {
  AnythingWeWant1,
  AnythingWeWant2,
  MyCustomProvider1,
  MyCustomProvider2,
  MyCustomProvider3,
  MyService1,
  MyService2,
  ServiceWeDontWantToMimic,
  ServiceWeWantToCustomize,
  ServiceWeWantToMimic,
} from './fixtures.services';
import {
  INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC,
  INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE,
  INJECTION_TOKEN_WE_WANT_TO_MIMIC,
} from './fixtures.tokens';

@Component({
  selector: 'component-structural',
  template: `
    <div *ngIf="items && items.length">
      <ng-template ngFor [ngForOf]="items" [ngForTemplate]="injectedBlock"></ng-template>
    </div>
  `,
})
export class ComponentContentChild<T> {
  @ContentChild('block', { ...staticFalse }) public injectedBlock: TemplateRef<any>;
  @Input() public items?: T[];
}

@Component({
  selector: 'my-component',
  template: `
    <div>My Content</div>

    <div>MyComponent1: <component-1></component-1></div>
    <div>MyComponent2: <component-2></component-2></div>
    <div>MyComponent3: <component-3></component-3></div>
    <div>ComponentWeDontWantToMimic: <dont-want></dont-want></div>
    <div>ComponentWeWantToMimic: <do-want></do-want></div>

    <div>MyDirective: <MyDirective></MyDirective></div>
    <div>DirectiveWeDontWantToMimic: <WeDontWantToMimic></WeDontWantToMimic></div>
    <div>
      DirectiveWeWantToMimic 1: <span *WeWantToMimic="let z = a">render {{ z.b }}</span>
    </div>
    <div>
      DirectiveWeWantToMimic 2: <ng-template WeWantToMimic let-z>render {{ z.a }}</ng-template>
    </div>

    <div>MyPipe: {{ 'text' | MyPipe }}</div>
    <div>PipeWeDontWantToMimic: {{ 'text' | PipeWeDontWantToMimic }}</div>
    <div>PipeWeWantToMimic: {{ 'text' | PipeWeWantToMimic }}</div>
    <div>PipeWeWantToCustomize: {{ 'text' | PipeWeWantToCustomize }}</div>
    <div>PipeWeWantToRestore: {{ 'text' | PipeWeWantToRestore }}</div>

    <div>INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC: {{ t1 }}</div>
    <div>INJECTION_TOKEN_WE_WANT_TO_MIMIC: {{ t2 }}</div>
    <div>INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE: {{ t3 }}</div>

    <div>anythingWeWant1: {{ anythingWeWant1?.getName() }}</div>
    <div>anythingWeWant2: {{ anythingWeWant2?.getName() }}</div>
    <div>myCustomProvider1: {{ myCustomProvider1?.getName() }}</div>
    <div>myCustomProvider2: {{ myCustomProvider2?.getName() }}</div>
    <div>myCustomProvider3: {{ myCustomProvider3?.getName() }}</div>

    <div>myService1: {{ myService1?.getName() }}</div>
    <div>myService2: {{ myService2?.getName() }}</div>
    <div>serviceWeDontWantToMimic: {{ serviceWeDontWantToMimic?.getName() }}</div>
    <div>serviceWeWantToCustomize: {{ serviceWeWantToCustomize?.getName() }}</div>
    <div>serviceWeWantToMimic: {{ serviceWeWantToMimic?.getName() }}</div>

    <component-structural>
      <ng-template let-value let-b="a" #block>
        <div>ComponentStructural: {{ value }} {{ b.z }}</div>
      </ng-template>
    </component-structural>
  `,
})
export class MyComponent {
  public constructor(
    @Optional() @Inject(INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC) public t1: string,
    @Optional() @Inject(INJECTION_TOKEN_WE_WANT_TO_MIMIC) public t2: string,
    @Optional() @Inject(INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE) public t3: string,
    @Optional() public anythingWeWant1: AnythingWeWant1,
    @Optional() public anythingWeWant2: AnythingWeWant2,
    @Optional() public myCustomProvider1: MyCustomProvider1,
    @Optional() public myCustomProvider2: MyCustomProvider2,
    @Optional() public myCustomProvider3: MyCustomProvider3,
    @Optional() public myService1: MyService1,
    @Optional() public myService2: MyService2,
    @Optional() public serviceWeDontWantToMimic: ServiceWeDontWantToMimic,
    @Optional() public serviceWeWantToMimic: ServiceWeWantToMimic,
    @Optional() public serviceWeWantToCustomize: ServiceWeWantToCustomize,
  ) {}
}

@Component({
  selector: 'component-1',
  template: 'MyComponent1',
})
export class MyComponent1 {}

@Component({
  selector: 'component-2',
  template: 'MyComponent2',
})
export class MyComponent2 {}

@Component({
  selector: 'component-3',
  template: 'MyComponent3',
})
export class MyComponent3 {}

@Component({
  selector: 'dont-want',
  template: 'ComponentWeDontWantToMimic',
})
export class ComponentWeDontWantToMimic {}

@Component({
  selector: 'do-want',
  template: 'ComponentWeWantToMimic',
})
export class ComponentWeWantToMimic {}
