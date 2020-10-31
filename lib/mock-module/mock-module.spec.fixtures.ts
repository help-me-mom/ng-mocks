import { CommonModule } from '@angular/common';
import { Component, Directive, ElementRef, Injectable, NgModule, OnInit, Pipe, PipeTransform } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';

@Directive({ selector: '[example-directive]' })
export class ExampleDirective implements OnInit {
  protected node: ElementRef;

  constructor(node: ElementRef) {
    this.node = node;
  }

  ngOnInit(): void {
    this.node.nativeElement.innerText = 'ExampleDirective';
  }
}

@Pipe({ name: 'examplePipe' })
export class ExamplePipe implements PipeTransform {
  transform = (text: string) => `Example: ${text}`;
}

@Injectable()
export class ExampleService {
  get = (id: number) => `Got: ${id}`;
}

@Component({
  selector: 'example-private-component',
  template: '<span>Private thing</span>',
})
export class ExamplePrivateComponent {}

@Component({
  selector: 'example-component',
  template: '<span>My Example</span>',
})
export class ExampleComponent {}

@Component({
  selector: 'example-consumer-component',
  template: '<example-component></example-component>',
})
export class ExampleConsumerComponent {}

@NgModule({
  declarations: [ExamplePrivateComponent, ExampleComponent, ExamplePipe, ExampleDirective],
  exports: [ExampleComponent, ExamplePipe, ExampleDirective],
  imports: [CommonModule],
  providers: [ExampleService],
})
export class ChildModule {}

@NgModule({
  imports: [ChildModule],
})
export class ParentModule {}

@NgModule({
  imports: [ParentModule],
})
export class SameImports1Module {}

@NgModule({
  imports: [ParentModule],
})
export class SameImports2Module {}

@NgModule({
  imports: [ChildModule],
})
export class LogicNestedModule {}

@NgModule({
  imports: [ChildModule, LogicNestedModule],
})
export class LogicRootModule {}

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        component: ExampleComponent,
        path: '',
      },
    ]),
  ],
})
export class AppRoutingModule {}

/* Assets for ModuleWithProviders BEGIN */

// Simple module, one of components requires some special provider.
@NgModule({
  imports: [CommonModule],
})
class RealModuleWithProvidersModule {}

// Factory to setup module with provider.
/* tslint:disable:no-unnecessary-class */
class ModuleProvider {
  static withFlag(flag: boolean): NgModuleWithProviders {
    return {
      ngModule: RealModuleWithProvidersModule,
      providers: [
        {
          provide: 'MODULE_FLAG',
          useValue: flag,
        },
      ],
    };
  }
}
/* tslint:enable:no-unnecessary-class */

// Encapsulating module with provider in some random module.
@NgModule({
  imports: [ModuleProvider.withFlag(false)],
})
export class ModuleWithProvidersModule {}

// Checking services
@Injectable()
export class CustomService {
  protected readonly value = 'dummy';

  public getSomething(): string {
    return this.value;
  }
}
@Component({
  selector: 'custom-service',
  template: `same imports`,
})
export class CustomWithServiceComponent {
  public name: string;

  constructor(service: CustomService) {
    this.name = service.getSomething();
  }
}
@NgModule({
  providers: [CustomService],
})
export class WithServiceModule {}

/* Assets for ModuleWithProviders END */
