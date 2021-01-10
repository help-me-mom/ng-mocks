import { Injectable, NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly name = 'target';

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
    const getSpy = jasmine.createSpy('get').and.returnValue('spy');
    const setSpy = jasmine.createSpy('set');
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

    // redefining the name
    Object.defineProperty(service, 'name', {
      configurable: false,
      enumerable: false,
      value: null,
      writable: false,
    });
    expect(service.name).toEqual(null as any);

    // restoring the name
    ngMocks.stubMember(service, 'name', 'target');
    expect(service.name).toEqual('target');

    // an empty object
    const test = {};
    ngMocks.stubMember(test as any, 'name', 'test');
    expect((test as any).name).toEqual('test');
  });
});
