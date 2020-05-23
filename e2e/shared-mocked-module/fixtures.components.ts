import { Component } from '@angular/core';

@Component({
  selector: 'my-component',
  template: 'real content',
})
export class MyComponent {}

@Component({
  selector: 'child-1-component',
  template: 'child:1 <my-component></my-component>',
})
export class Child1Component {}

@Component({
  selector: 'child-2-component',
  template: 'child:2 <my-component></my-component>',
})
export class Child2Component {}

@Component({
  selector: 'target-component',
  template: '<child-1-component></child-1-component> - <child-2-component></child-2-component>',
})
export class TargetComponent {}
