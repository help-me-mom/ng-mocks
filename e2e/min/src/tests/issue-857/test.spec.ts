// tslint:disable no-console

import { Component } from '@angular/core';
import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target',
  template: '{{ name }}',
})
class TargetComponent {
  public readonly name?: string = 'target';
}

describe('issue-857', () => {
  beforeEach(() => MockBuilder(null, TargetComponent));

  describe('throws on forgotten resets', () => {
    let consoleWarn: typeof console.warn;
    beforeAll(() => {
      consoleWarn = console.warn;
      console.warn =
        typeof jest === 'undefined'
          ? jasmine.createSpy('console.warn')
          : jest.fn().mockName('console.warn');

      ngMocks.config({
        onMockInstanceRestoreNeed: 'warn',
      });
    });
    afterAll(() => {
      MockInstance(TargetComponent);
      console.warn = consoleWarn;

      ngMocks.config({
        onMockInstanceRestoreNeed: null,
      });
    });

    it('internal override', () => {
      MockInstance(TargetComponent, 'name', 'mock');
      const instance =
        MockRender(TargetComponent).point.componentInstance;
      expect(instance.name).toEqual('mock');
    });

    it('default override', () => {
      expect(console.warn).toHaveBeenCalledWith(
        [
          'MockInstance: side effects have been detected (TargetComponent).',
          'Forgot to add MockInstance.scope() or to call MockInstance.restore()?',
        ].join(' '),
      );
    });
  });

  describe('respects valid resets', () => {
    MockInstance.scope();

    it('internal override', () => {
      MockInstance(TargetComponent, 'name', 'mock');
      const instance =
        MockRender(TargetComponent).point.componentInstance;
      expect(instance.name).toEqual('mock');
    });

    it('default override', () => {
      const instance =
        MockRender(TargetComponent).point.componentInstance;
      expect(instance.name).toEqual(undefined);
    });
  });
});
