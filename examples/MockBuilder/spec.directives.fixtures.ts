import { Directive } from '@angular/core';

@Directive({
  selector: 'd-my',
})
export class MyDirective {}

@Directive({
  selector: 'd-keep',
})
export class KeepDirective {}

@Directive({
  selector: '[d-mock]',
})
export class MockDirective {}
