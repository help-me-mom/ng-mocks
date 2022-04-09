import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import {
  ContentChildComponent,
  KeepComponent,
  MockComponent,
  My1Component,
  My2Component,
  My3Component,
  MyComponent,
} from './spec.components.fixtures';
import { KeepDirective, MockDirective, MyDirective } from './spec.directives.fixtures';
import { CustomizePipe, KeepPipe, MockPipe, MyPipe, RestorePipe } from './spec.pipes.fixtures';
import { MyService1, MyService2, ServiceCustomize, ServiceKeep, ServiceMock } from './spec.services.fixtures';
import { TOKEN_CUSTOMIZE, TOKEN_KEEP, TOKEN_MOCK } from './spec.tokens.fixtures';

@NgModule({
  declarations: [
    KeepComponent,
    MockComponent,
    KeepDirective,
    MockDirective,
    KeepPipe,
    MockPipe,
    CustomizePipe,
    RestorePipe,
  ],
  exports: [KeepComponent, MockComponent, KeepDirective, MockDirective, KeepPipe, MockPipe, CustomizePipe, RestorePipe],
  providers: [
    ServiceKeep,
    ServiceMock,
    {
      provide: TOKEN_KEEP,
      useValue: 'TOKEN_KEEP',
    },
    {
      provide: TOKEN_MOCK,
      useValue: 'TOKEN_MOCK',
    },
    {
      provide: TOKEN_CUSTOMIZE,
      useValue: 'TOKEN_CUSTOMIZE',
    },
  ],
})
export class ModuleMock {}

@NgModule({
  declarations: [My1Component, My2Component, My3Component, ContentChildComponent],
  exports: [My1Component, My2Component, My3Component, ContentChildComponent],
  imports: [CommonModule],
})
export class ModuleKeep {}

@NgModule({
  declarations: [MyComponent, MyDirective, MyPipe],
  exports: [MyComponent, MyDirective, MyPipe],
  imports: [HttpClientModule, ModuleMock, ModuleKeep],
  providers: [MyService1, MyService2, ServiceCustomize],
})
export class MyModule {}
