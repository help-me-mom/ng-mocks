import { Injectable } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  protected readonly name = 'target';

  public echo(): string {
    return this.name;
  }
}

describe('auto-spy', () => {
  describe('predefined', () => {
    beforeEach(() => MockBuilder().mock(TargetService));

    it('returns mock', () => {
      const service = ngMocks.findInstance(TargetService);
      expect(service.echo).not.toHaveBeenCalled();

      service.echo();
      expect(service.echo).toHaveBeenCalled();
    });
  });

  describe('default', () => {
    beforeAll(() => ngMocks.autoSpy('default'));
    afterAll(() => ngMocks.autoSpy('reset'));

    beforeEach(() => MockBuilder().mock(TargetService));

    it('returns mock', () => {
      const service = ngMocks.findInstance(TargetService);
      expect(() =>
        expect(service.echo).not.toHaveBeenCalled(),
      ).toThrow();

      expect(() => service.echo()).not.toThrow();
    });
  });

  describe('custom', () => {
    let called: any;

    beforeAll(() =>
      ngMocks.autoSpy(label => () => {
        called = label;
      }),
    );
    afterAll(() => ngMocks.autoSpy('reset'));

    beforeEach(() => MockBuilder().mock(TargetService));

    it('returns mock', () => {
      const service = ngMocks.findInstance(TargetService);
      expect(called).toBeUndefined();

      service.echo();
      expect(called).toEqual('TargetService.echo');
    });
  });
});
