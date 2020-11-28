import { Component, Directive, Injectable, NgModule, Pipe, PipeTransform } from '@angular/core';

@Injectable()
export class Target1Service {}

@Injectable()
export class Target2Service {}

@Component({
  providers: [Target1Service],
  selector: 'com-1',
  template: 'com-1',
})
export class Target1Component {
  public constructor(public service: Target1Service) {}
}

@Component({
  selector: 'com-2',
  template: 'com-2',
})
export class Target2Component {
  public constructor(public service: Target2Service) {}
}

@Directive({
  providers: [Target1Service],
  selector: 'dir-1',
})
export class Target1Directive {
  public constructor(public service: Target1Service) {}
}

@Directive({
  selector: 'dir-2',
})
export class Target2Directive {
  public constructor(public service: Target2Service) {}
}

@Pipe({
  name: 'pip1',
})
export class Target1Pipe implements PipeTransform {
  protected name = 'pip1';

  public transform(): string {
    return this.name;
  }
}

@Pipe({
  name: 'pip2',
})
export class Target2Pipe implements PipeTransform {
  protected name = 'pip2';

  public transform(): string {
    return this.name;
  }
}

@NgModule({
  declarations: [Target1Component, Target1Directive, Target1Pipe],
  exports: [Target1Component, Target1Directive, Target1Pipe],
})
export class Target1Module {}

@NgModule({
  declarations: [Target2Component, Target2Directive, Target2Pipe],
  exports: [Target2Component, Target2Directive, Target2Pipe],
  providers: [Target2Service],
})
export class Target2Module {}

@NgModule({
  exports: [Target1Module, Target2Module],
  imports: [Target1Module, Target2Module],
})
export class TargetModule {}
