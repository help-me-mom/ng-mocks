/* tslint:disable:max-classes-per-file */

import { CommonModule } from '@angular/common';
import { Component, Directive, Injectable, ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

@Directive({selector: '[example-directive]'})
export class ExampleDirective {}

@Pipe({name: 'examplePipe'})
export class ExamplePipe implements PipeTransform {
  transform = (text: string) => `Example: ${text}`;
}

@Injectable()
export class ExampleService {
  get = (id: number) => `Got: ${id}`;
}

@Component({
  selector: 'example-private-component',
  template: '<span>Private thing</span>'
})
export class ExamplePrivateComponent { }

@Component({
  selector: 'example-component',
  template: '<span>My Example</span>'
})
export class ExampleComponent { }

@NgModule({
  declarations: [ ExamplePrivateComponent, ExampleComponent, ExamplePipe, ExampleDirective ],
  exports: [ ExampleComponent, ExamplePipe, ExampleDirective ],
  imports: [ CommonModule ],
  providers: [ ExampleService ]
})
export class ChildModule {}

@NgModule({
  imports: [ ChildModule ],
})
export class ParentModule {}

/* Assets for ModuleWithProviders BEGIN */

// Simple module, one of components requires some special provider.
@NgModule({
  imports: [
    CommonModule,
  ],
})
class RealModuleWithProvidersModule {}

// Factory to setup module with provider.
/* tslint:disable:no-unnecessary-class */
class ModuleProvider {
  static withFlag(flag: boolean): ModuleWithProviders {
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
  imports: [
    ModuleProvider.withFlag(false),
  ],
})
export class ModuleWithProvidersModule {}

/* Assets for ModuleWithProviders END */
