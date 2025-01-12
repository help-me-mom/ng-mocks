import { Directive } from '@angular/core';

@Directive({
  selector: 'd-my',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class MyDirective {}

@Directive({
  selector: 'd-keep',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class KeepDirective {}

@Directive({
  selector: '[d-mock]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class MockDirective {}
