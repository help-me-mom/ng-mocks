import { Component, Injectable, NgModule } from '@angular/core';

@Injectable()
export class ServiceParent {
  protected value = 'parent';

  public echo() {
    return this.value;
  }
}

@Injectable()
export class ServiceReplacedParent extends ServiceParent {
  protected value = 'replaced';
}

@Injectable()
export class ServiceChild {
  public constructor(public readonly parent: ServiceParent) {}
}

@Component({
  selector: 'internal-component',
  template: '{{ child.parent.echo() }}',
})
export class InternalComponent {
  public constructor(public readonly child: ServiceChild) {}
}

@NgModule({
  declarations: [InternalComponent],
  exports: [InternalComponent],
  providers: [
    ServiceParent,
    ServiceReplacedParent,
    {
      deps: [ServiceReplacedParent],
      provide: ServiceChild,
      useFactory: (parent: ServiceParent) => new ServiceChild(parent),
    },
  ],
})
export class TargetModule {}
