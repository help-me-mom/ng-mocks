import { Component, Injectable } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
export class TargetService {
  public method() {
    return 'inside method';
  }
}

@Component({
  selector: 'target',
  template: '',
})
export class TargetComponent {
  public constructor(private readonly service: TargetService) {
    this.service.method();
  }
}

describe('issue-488', () => {
  ngMocks.throwOnConsole();

  beforeEach(() =>
    MockBuilder(TargetComponent).provide(TargetService),
  );

  let service: TargetService;

  describe('classic', () => {
    beforeEach(() => {
      service = TestBed.get(TargetService);
      spyOn(service, 'method');

      TestBed.createComponent(TargetComponent);
    });

    it('expect service.method to have been called', () => {
      expect(service.method).toHaveBeenCalled();
    });
  });

  describe('mock-render', () => {
    it('throws an error about usage of the injector', () => {
      const testBed: any = getTestBed();

      service = TestBed.get(TargetService);
      spyOn(service, 'method');

      if (testBed._instantiated || testBed._testModuleRef) {
        expect(() => MockRender(TargetComponent)).toThrowError(
          /Forgot to flush TestBed/,
        );
      } else {
        MockRender(TargetComponent);
        expect(service.method).toHaveBeenCalled();
      }
    });
  });
});
