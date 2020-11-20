import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import {
  ComponentContentChild,
  ComponentWeDontWantToMimic,
  ComponentWeWantToMimic,
  MyComponent,
  MyComponent1,
  MyComponent2,
  MyComponent3,
} from './fixtures.components';
import { DirectiveWeDontWantToMimic, DirectiveWeWantToMimic, MyDirective } from './fixtures.directives';
import {
  MyPipe,
  PipeWeDontWantToMimicPipe,
  PipeWeWantToCustomize,
  PipeWeWantToMimicPipe,
  PipeWeWantToRestore,
} from './fixtures.pipes';
import {
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

@NgModule({
  declarations: [
    ComponentWeDontWantToMimic,
    ComponentWeWantToMimic,
    DirectiveWeDontWantToMimic,
    DirectiveWeWantToMimic,
    PipeWeDontWantToMimicPipe,
    PipeWeWantToMimicPipe,
    PipeWeWantToCustomize,
    PipeWeWantToRestore,
  ],
  exports: [
    ComponentWeDontWantToMimic,
    ComponentWeWantToMimic,
    DirectiveWeDontWantToMimic,
    DirectiveWeWantToMimic,
    PipeWeDontWantToMimicPipe,
    PipeWeWantToMimicPipe,
    PipeWeWantToCustomize,
    PipeWeWantToRestore,
  ],
  providers: [
    ServiceWeDontWantToMimic,
    ServiceWeWantToMimic,
    {
      provide: INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC,
      useValue: 'INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC',
    },
    {
      provide: INJECTION_TOKEN_WE_WANT_TO_MIMIC,
      useValue: 'INJECTION_TOKEN_WE_WANT_TO_MIMIC',
    },
    {
      provide: INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE,
      useValue: 'INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE',
    },
  ],
})
export class ModuleWeWantToMimicBesidesMyModule {}

@NgModule({
  declarations: [MyComponent1, MyComponent2, MyComponent3, ComponentContentChild],
  exports: [MyComponent1, MyComponent2, MyComponent3, ComponentContentChild],
  imports: [CommonModule],
})
export class ModuleWeDontWantToMimic {}

@NgModule({
  declarations: [MyComponent, MyDirective, MyPipe],
  exports: [MyComponent, MyDirective, MyPipe],
  imports: [HttpClientModule, ModuleWeWantToMimicBesidesMyModule, ModuleWeDontWantToMimic],
  providers: [MyService1, MyService2, ServiceWeWantToCustomize],
})
export class MyModule {}
