import { Component, Injectable, NgModule } from '@angular/core';

@Injectable()
export class TargetService {
  public called = 0;

  public call(): void {
    this.called += 1;
  }
}

@Component({
  selector: 'root',
  template: '<internal></internal>{{ service.called }}',
})
export class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@Component({
  selector: 'internal',
  template: 'real',
})
export class RealComponent {}

@Component({
  selector: 'internal',
  template: 'fake',
})
export class FakeComponent {}

@NgModule({
  declarations: [TargetComponent, RealComponent],
  exports: [TargetComponent],
  providers: [TargetService],
})
export class TargetModule {
  public constructor(protected service: TargetService) {
    this.service.call();
  }
}
