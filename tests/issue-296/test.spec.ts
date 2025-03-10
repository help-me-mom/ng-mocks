import {
  Component,
  ComponentFactoryResolver,
  Injectable,
  NgModule,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class ModalService {
  public constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
  ) {}

  public open(component: any) {
    this.componentFactoryResolver.resolveComponentFactory(component);
  }
}

@Component({
  selector: 'modal',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: 'modal',
})
class ModalComponent {}

@Component({
  selector: 'target-296',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: 'target',
})
class TargetComponent {
  public constructor(modalService: ModalService) {
    modalService.open(ModalComponent);
  }
}

@NgModule({
  declarations: [TargetComponent, ModalComponent],
  ['entryComponents' as never /* TODO remove entryComponents after A16+ support */]:
    [ModalComponent],
  providers: [ModalService],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/296
describe('issue-296:without-entry', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(ModalService)
      .keep(ModalComponent),
  );

  it('behaves correctly with and without ivy', () => {
    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/296
describe('issue-296:with-entry', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('behaves correctly with and without ivy', () => {
    // it should never throw
    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});
