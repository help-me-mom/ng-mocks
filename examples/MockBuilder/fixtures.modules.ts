// tslint:disable:max-classes-per-file

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import {
  ComponentContentChild,
  ComponentWeDontWantToMock,
  ComponentWeWantToMock,
  MyComponent,
  MyComponent1,
  MyComponent2,
  MyComponent3,
} from './fixtures.components';
import { DirectiveWeDontWantToMock, DirectiveWeWantToMock, MyDirective } from './fixtures.directives';
import {
  MyPipe,
  PipeWeDontWantToMock,
  PipeWeWantToCustomize,
  PipeWeWantToMock,
  PipeWeWantToRestore,
} from './fixtures.pipes';
import {
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
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    ComponentWeDontWantToMock,
    ComponentWeWantToMock,
    DirectiveWeDontWantToMock,
    DirectiveWeWantToMock,
    PipeWeDontWantToMock,
    PipeWeWantToMock,
    PipeWeWantToCustomize,
    PipeWeWantToRestore,
  ],
  exports: [
    ComponentWeDontWantToMock,
    ComponentWeWantToMock,
    DirectiveWeDontWantToMock,
    DirectiveWeWantToMock,
    PipeWeDontWantToMock,
    PipeWeWantToMock,
    PipeWeWantToCustomize,
    PipeWeWantToRestore,
  ],
  providers: [
    ServiceWeDontWantToMock,
    ServiceWeWantToMock,
    {
      provide: INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK,
      useValue: 'INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK',
    },
    {
      provide: INJECTION_TOKEN_WE_WANT_TO_MOCK,
      useValue: 'INJECTION_TOKEN_WE_WANT_TO_MOCK',
    },
    {
      provide: INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE,
      useValue: 'INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE',
    },
  ],
})
export class ModuleWeWantToMockBesidesMyModule {}

@NgModule({
  declarations: [MyComponent1, MyComponent2, MyComponent3, ComponentContentChild],
  exports: [MyComponent1, MyComponent2, MyComponent3, ComponentContentChild],
  imports: [CommonModule],
})
export class ModuleWeDontWantToMock {}

@NgModule({
  declarations: [MyComponent, MyDirective, MyPipe],
  exports: [MyComponent, MyDirective, MyPipe],
  imports: [HttpClientModule, ModuleWeWantToMockBesidesMyModule, ModuleWeDontWantToMock],
  providers: [MyService1, MyService2, ServiceWeWantToCustomize],
})
export class MyModule {}
