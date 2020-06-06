import { Component, ContentChild, Inject, Input, Optional, TemplateRef } from '@angular/core';

import { staticFalse } from '../../tests-jasmine';

import {
  AnythingWeWant1,
  AnythingWeWant2,
  MyCustomProvider1,
  MyCustomProvider2,
  MyCustomProvider3,
  MyService1,
  MyService2,
  ServiceWeDontWantToMock,
  ServiceWeWantToCustomize,
  ServiceWeWantToMock,
} from './fixtures.services';
import {
  INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK,
  INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE,
  INJECTION_TOKEN_WE_WANT_TO_MOCK,
} from './fixtures.tokens';

@Component({
  selector: 'component-structural',
  template: '',
})
export class ComponentContentChild<T> {
  @ContentChild('block', { ...staticFalse }) injectedBlock: TemplateRef<any>;
  @Input() items?: T[];
}

@Component({
  selector: 'my-component',
  template: '',
})
export class MyComponent {
  public readonly anythingWeWant1: AnythingWeWant1;
  public readonly anythingWeWant2: AnythingWeWant2;
  public readonly myCustomProvider1: MyCustomProvider1;
  public readonly myCustomProvider2: MyCustomProvider2;
  public readonly myCustomProvider3: MyCustomProvider3;
  public readonly myService1: MyService1;
  public readonly myService2: MyService2;
  public readonly serviceWeDontWantToMock: ServiceWeDontWantToMock;
  public readonly serviceWeWantToCustomize: ServiceWeWantToCustomize;
  public readonly serviceWeWantToMock: ServiceWeWantToMock;
  public readonly t1v: string;
  public readonly t2v: string;
  public readonly t3v: string;

  constructor(
    @Optional() @Inject(INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK) t1: string,
    @Optional() @Inject(INJECTION_TOKEN_WE_WANT_TO_MOCK) t2: string,
    @Optional() @Inject(INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE) t3: string,
    @Optional() anythingWeWant1: AnythingWeWant1,
    @Optional() anythingWeWant2: AnythingWeWant2,
    @Optional() myCustomProvider1: MyCustomProvider1,
    @Optional() myCustomProvider2: MyCustomProvider2,
    @Optional() myCustomProvider3: MyCustomProvider3,
    @Optional() myService1: MyService1,
    @Optional() myService2: MyService2,
    @Optional() serviceWeDontWantToMock: ServiceWeDontWantToMock,
    @Optional() serviceWeWantToMock: ServiceWeWantToMock,
    @Optional() serviceWeWantToCustomize: ServiceWeWantToCustomize
  ) {
    this.t1v = t1;
    this.t2v = t2;
    this.t3v = t3;
    this.anythingWeWant1 = anythingWeWant1;
    this.anythingWeWant2 = anythingWeWant2;
    this.myCustomProvider1 = myCustomProvider1;
    this.myCustomProvider2 = myCustomProvider2;
    this.myCustomProvider3 = myCustomProvider3;
    this.myService1 = myService1;
    this.myService2 = myService2;
    this.serviceWeDontWantToMock = serviceWeDontWantToMock;
    this.serviceWeWantToCustomize = serviceWeWantToCustomize;
    this.serviceWeWantToMock = serviceWeWantToMock;
  }
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
  template: 'ComponentWeDontWantToMock',
})
export class ComponentWeDontWantToMock {}

@Component({
  selector: 'do-want',
  template: 'ComponentWeWantToMock',
})
export class ComponentWeWantToMock {}
