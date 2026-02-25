import { Component, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'target',
  standalone: false,
})
export class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return `${value.length}`;
  }
}

@NgModule({
  declarations: [TargetPipe],
  exports: [TargetPipe],
})
export class PipeModule {}

@NgModule({
  exports: [TargetPipe],
  imports: [PipeModule],
})
export class TargetModule {}

@Component({
  selector: 'target-241',
  standalone: false,
  template: "{{ 'target' | target }}",
})
export class TargetComponent {}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [TargetModule],
})
export class AppModule {}
