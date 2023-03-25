import { Component, Injectable, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockRender,
  MockService,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {
  protected value = 'TargetService';

  public echo(value?: string): string {
    return value ? value : this.value;
  }
}

@Component({
  selector: 'target-spies',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  public constructor(protected service: TargetService) {
    this.service.echo('constructor');
  }

  public echo(): string {
    return this.service.echo('TargetComponent');
  }
}

@NgModule({
  declarations: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {}

describe('spies:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.find(
      fixture.debugElement,
      TargetComponent,
    ).componentInstance;
    expect(component).toBeDefined();
    expect(component.echo()).toEqual('TargetComponent');
  });
});

describe('spies:manual-mock', () => {
  beforeEach(() => {
    const spy = MockService(TargetService);
    if (typeof jest !== 'undefined') {
      ngMocks.stub<any>(spy, 'echo').mockReturnValue('fake');
    } else if (typeof jasmine !== 'undefined') {
      ngMocks.stub<any>(spy, 'echo').and.returnValue('fake');
    }
    // in case of jest
    // ngMocks.stub<any>(spy, 'echo').mockReturnValue('fake');
    (spy as any).manual = true;

    return MockBuilder(TargetComponent, TargetModule).mock(
      TargetService,
      spy,
    );
  });

  it('should get manually mock service', () => {
    const fixture = MockRender(TargetComponent);

    const targetService = ngMocks.findInstance(TargetService);
    expect((targetService as any).manual).toBe(true);

    const component = ngMocks.find(
      fixture.debugElement,
      TargetComponent,
    ).componentInstance;
    expect(component).toBeDefined();
    expect(targetService.echo).toHaveBeenCalledTimes(1);
    expect(targetService.echo).toHaveBeenCalledWith('constructor');
    expect(component.echo()).toEqual('fake');
    expect(targetService.echo).toHaveBeenCalledTimes(2);
  });
});

describe('spies:auto-mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('should get an existing mock service', () => {
    const fixture = MockRender(TargetComponent);
    const targetService = fixture.point.injector.get(TargetService);
    const component = ngMocks.find(
      fixture.debugElement,
      TargetComponent,
    ).componentInstance;
    expect(component).toBeDefined();
    expect(targetService.echo).toHaveBeenCalledTimes(1);
    expect(targetService.echo).toHaveBeenCalledWith('constructor');
    if (typeof jest !== 'undefined') {
      ngMocks
        .stub<any>(targetService, 'echo')
        .mockReturnValue('faked');
    } else if (typeof jasmine !== 'undefined') {
      ngMocks
        .stub<any>(targetService, 'echo')
        .and.returnValue('faked');
    }
    // in case of jest
    // ngMocks
    //   .stub<any>(targetService, 'echo')
    //   .mockReturnValue('faked');
    expect(component.echo()).toEqual('faked');
    expect(targetService.echo).toHaveBeenCalledTimes(2);
  });
});
