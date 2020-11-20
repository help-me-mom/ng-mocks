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
  template: '',
})
export class ComponentContentChild<T> {
  @ContentChild('block', { ...staticFalse }) public readonly injectedBlock: TemplateRef<any>;
  @Input() public items?: T[];
}

@Component({
  selector: 'my-component',
  template: '',
})
export class MyComponent {
  public constructor(
    @Optional() @Inject(INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC) public readonly t1: string,
    @Optional() @Inject(INJECTION_TOKEN_WE_WANT_TO_MIMIC) public readonly t2: string,
    @Optional() @Inject(INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE) public readonly t3: string,
    @Optional() public readonly anythingWeWant1: AnythingWeWant1,
    @Optional() public readonly anythingWeWant2: AnythingWeWant2,
    @Optional() public readonly myCustomProvider1: MyCustomProvider1,
    @Optional() public readonly myCustomProvider2: MyCustomProvider2,
    @Optional() public readonly myCustomProvider3: MyCustomProvider3,
    @Optional() public readonly myService1: MyService1,
    @Optional() public readonly myService2: MyService2,
    @Optional() public readonly serviceWeDontWantToMimic: ServiceWeDontWantToMimic,
    @Optional() public readonly serviceWeWantToMimic: ServiceWeWantToMimic,
    @Optional() public readonly serviceWeWantToCustomize: ServiceWeWantToCustomize,
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
