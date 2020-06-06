import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dependency' })
export class DependencyPipe implements PipeTransform {
  transform = (name: string): string => `hi ${name}`;
}
