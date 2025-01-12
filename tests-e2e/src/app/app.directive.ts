import { Directive } from '@angular/core';

@Directive(
  {
    selector: 'app-root',
    standalone: false,
  } as never /* TODO: remove after upgrade to a14 */,
)
export class AppDirective {
  public appDirective() {}
}
