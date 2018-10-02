/* tslint:disable:max-classes-per-file */

import { CommonModule } from '@angular/common';
import { Component, Directive, Injectable, NgModule, Pipe, PipeTransform } from '@angular/core';

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
