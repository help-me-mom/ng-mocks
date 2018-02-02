import { NgModule, Component, Injectable, Directive, Pipe, PipeTransform } from '@angular/core';

@Directive({selector: 'example-directive'})
export class ExampleDirective {}

@Pipe({name: 'examplePipe'})
export class ExamplePipe implements PipeTransform {
  transform(text: string) {
    return `Example: ${text}`;
  }
}

@Injectable()
export class ExampleService {
  get(id: number) {
    return `Got: ${id}`;
  }
}

@Component({
  selector: 'example-component',
  template: '<span>My Example</span>'
})
export class ExampleComponent { }

@NgModule({
  declarations: [ ExampleComponent, ExamplePipe, ExampleDirective ],
  exports: [ ExampleComponent, ExamplePipe, ExampleDirective ],
  providers: [ ExampleService ]
})
export class ChildModule {}

@NgModule({
  imports: [ ChildModule ],
})
export class ParentModule {}
