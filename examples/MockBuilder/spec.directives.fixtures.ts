import { Directive } from '@angular/core';

@Directive({
  selector: 'd-my',
  standalone: false,
})
export class MyDirective {}

@Directive({
  selector: 'd-keep',
  standalone: false,
})
export class KeepDirective {}

@Directive({
  selector: '[d-mock]',
  standalone: false,
})
export class MockDirective {}
