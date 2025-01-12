import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
  {
    name: 'app',
    standalone: false,
  } as never /* TODO: remove after upgrade to a14 */,
)
export class AppPipe implements PipeTransform {
  transform(): string {
    return this.constructor.name;
  }

  public appPipe() {}
}
