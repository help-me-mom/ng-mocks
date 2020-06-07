import { inject } from '@angular/core/testing';
import { MockBuilder, MockRender, MockService, ngMocks } from 'ng-mocks';

import { TargetComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';
import { TargetService } from './fixtures.providers';

// fix to support both jasmine and jest in the test
declare const jest: any;
declare const jasmine: any;

describe('spies:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.find(fixture.debugElement, TargetComponent).componentInstance;
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

    return MockBuilder(TargetComponent, TargetModule).mock(TargetService, spy);
  });

  it('should get manually mocked service', inject([TargetService], (targetService: TargetService) => {
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.find(fixture.debugElement, TargetComponent).componentInstance;
    expect(component).toBeDefined();
    expect(targetService.echo).toHaveBeenCalledTimes(1);
    expect(targetService.echo).toHaveBeenCalledWith('constructor');
    expect(component.echo()).toEqual('fake');
    expect(targetService.echo).toHaveBeenCalledTimes(2);
  }));
});

describe('spies:auto-mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('should get already mocked service', inject([TargetService], (targetService: TargetService) => {
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.find(fixture.debugElement, TargetComponent).componentInstance;
    expect(component).toBeDefined();
    expect(targetService.echo).toHaveBeenCalledTimes(1);
    expect(targetService.echo).toHaveBeenCalledWith('constructor');
    if (typeof jest !== 'undefined') {
      ngMocks.stub<any>(targetService, 'echo').mockReturnValue('faked');
    } else if (typeof jasmine !== 'undefined') {
      ngMocks.stub<any>(targetService, 'echo').and.returnValue('faked');
    }
    expect(component.echo()).toEqual('faked');
    expect(targetService.echo).toHaveBeenCalledTimes(2);
  }));
});
