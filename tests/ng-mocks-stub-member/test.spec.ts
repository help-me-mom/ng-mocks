import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly name = 'target';
  public norm = 'normal';

  public echo(): string {
    return this.name;
  }
}

@NgModule({
  providers: [TargetService],
})
class TargetModule {}

describe('ng-mocks-stub-member', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('stubs the prop', () => {
    const service = MockRender(TargetService).point.componentInstance;

    // default
    expect(service.name).toEqual('target');
    expect(service.echo()).toEqual('target');

    // stub of name
    ngMocks.stubMember(service, 'name', 'mockName' as any);
    expect(service.name).toEqual('mockName');
    expect(service.echo()).toEqual('mockName');

    // stub of echo
    ngMocks.stubMember(service, 'echo', () => 'mockEcho');
    expect(service.name).toEqual('mockName');
    expect(service.echo()).toEqual('mockEcho');

    // checking getters and setters
    const getSpy =
      typeof jest === 'undefined'
        ? jasmine.createSpy().and.returnValue('spy')
        : jest.fn().mockReturnValue('spy');
    const setSpy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    ngMocks.stubMember(service, 'name', getSpy, 'get');
    ngMocks.stubMember(service, 'name', setSpy, 'set');

    // asserting getter
    expect(service.name).toEqual('spy' as any);
    expect(getSpy).toHaveBeenCalledTimes(1);

    // asserting setter
    (service as any).name = 'test';
    expect(setSpy).toHaveBeenCalledWith('test');

    // redefining getter
    ngMocks.stubMember(service, 'name', () => 'new' as any, 'get');
    expect(service.name).toEqual('new' as any);

    // fake property
    ngMocks.stubMember(service as any, 'fake', 'fake');
    expect((service as any).fake).toEqual('fake');

    // an empty object
    const test = {};
    ngMocks.stubMember(test as any, 'name', 'test');
    expect((test as any).name).toEqual('test');
  });

  it('returns the passed value', () => {
    const service = MockRender(TargetService).point.componentInstance;

    // checking methods
    expect(service.echo()).toEqual('target');
    ngMocks.stubMember(
      service,
      'echo',
      typeof jest === 'undefined'
        ? jasmine.createSpy().and.returnValue('spy')
        : jest.fn().mockReturnValue('spy'),
    );
    expect(service.echo()).toEqual('spy');

    // checking getters
    expect(service.name).toEqual('target');
    ngMocks.stubMember(
      service,
      'name',
      typeof jest === 'undefined'
        ? jasmine.createSpy().and.returnValue('spy')
        : jest.fn().mockReturnValue('spy'),
      'get',
    );
    expect(service.name).toEqual('spy');

    // checking setters
    ngMocks.stubMember(
      service,
      'name',
      typeof jest === 'undefined'
        ? jasmine.createSpy().and.throwError('spy')
        : jest.fn(() => {
            throw 'spy';
          }),
      'set',
    );
    expect(() => ((service as any).name = 'target')).toThrowError(
      'spy',
    );

    // checking real prop
    expect(service.norm).toEqual('normal');
    ngMocks.stubMember(
      service,
      'norm',
      typeof jest === 'undefined'
        ? jasmine.createSpy().and.returnValue('spy')
        : jest.fn().mockReturnValue('spy'),
      'get',
    );
    expect(service.norm).toEqual('spy');
  });
});
