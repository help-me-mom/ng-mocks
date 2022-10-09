import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'app',
})
export class AppPipe implements PipeTransform {
  transform(): string {
    return this.constructor.name;
  }
}
