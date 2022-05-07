import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'target',
})
export class TargetPipe implements PipeTransform {
  public readonly name = 'target';

  public transform(): string {
    return this.name;
  }
}
