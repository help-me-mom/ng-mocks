import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockComponent,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-mock-instance-member',
  template: '',
})
class TargetComponent {
  public beforeAll1 = '';
  public beforeAll2 = '';
  public beforeEach1 = '';
  public beforeEach2 = '';
  public beforeEach3 = '';
  public describe1 = '';
  public describe2 = '';
  public global = '';
  public it1 = '';
  public it2 = '';
}

MockInstance(TargetComponent, 'global', 'mock');

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('mock-instance-member', () => {
  MockInstance.scope('all');

  MockInstance(TargetComponent, 'describe1', 'mock');

  beforeAll(() => {
    ngMocks.reset();
    MockInstance(TargetComponent, 'beforeAll1', 'mock');
  });

  beforeEach(() =>
    MockInstance(TargetComponent, 'beforeEach1', 'mock'),
  );
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [MockComponent(TargetComponent)],
    }),
  );
  beforeEach(() =>
    MockInstance(TargetComponent, 'beforeEach2', 'mock'),
  );

  it('gets right stubs #1', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    expect(component).toEqual(
      assertion.objectContaining({
        beforeAll1: 'mock',
        beforeEach1: 'mock',
        beforeEach2: 'mock',
      }),
    );
    expect(component.beforeAll2).toBeUndefined();
    expect(component.beforeEach3).toBeUndefined();
    expect(component.it1).toBeUndefined();
    expect(component.it2).toBeUndefined();

    // caused by reset in beforeAll
    expect(component.describe1).toBeUndefined();
    expect(component.describe2).toBeUndefined();
    expect(component.global).toBeUndefined();
  });

  it('gets right stubs #2', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    expect(component).toEqual(
      assertion.objectContaining({
        beforeAll1: 'mock',
        beforeEach1: 'mock',
        beforeEach2: 'mock',
      }),
    );
    expect(component.beforeAll2).toBeUndefined();
    expect(component.beforeEach3).toBeUndefined();
    expect(component.it1).toBeUndefined();
    expect(component.it2).toBeUndefined();

    // caused by reset in beforeAll
    expect(component.describe1).toBeUndefined();
    expect(component.describe2).toBeUndefined();
    expect(component.global).toBeUndefined();
  });

  describe('nested w/ overrides', () => {
    MockInstance.scope('all');

    MockInstance(TargetComponent, 'describe2', 'mock');

    beforeAll(() =>
      MockInstance(TargetComponent, 'beforeAll2', 'mock'),
    );
    beforeEach(() =>
      MockInstance(TargetComponent, 'beforeEach3', 'mock'),
    );

    it('gets right stubs #1', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component).toEqual(
        assertion.objectContaining({
          beforeAll1: 'mock',
          beforeAll2: 'mock',
          beforeEach1: 'mock',
          beforeEach2: 'mock',
          beforeEach3: 'mock',
        }),
      );
      expect(component.it1).toBeUndefined();
      expect(component.it2).toBeUndefined();

      // caused by reset in beforeAll
      expect(component.describe1).toBeUndefined();
      expect(component.describe2).toBeUndefined();
      expect(component.global).toBeUndefined();
    });

    it('gets right stubs #2', () => {
      MockInstance(TargetComponent, 'it1', () => 'mock', 'get');
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component).toEqual(
        assertion.objectContaining({
          beforeAll1: 'mock',
          beforeAll2: 'mock',
          beforeEach1: 'mock',
          beforeEach2: 'mock',
          beforeEach3: 'mock',
          it1: 'mock',
        }),
      );
      expect(component.it2).toBeUndefined();

      // caused by reset in beforeAll
      expect(component.describe1).toBeUndefined();
      expect(component.describe2).toBeUndefined();
      expect(component.global).toBeUndefined();
    });
  });

  describe('nested w/o overrides', () => {
    MockInstance.scope();

    it('gets right stubs #1', () => {
      MockInstance(TargetComponent, 'it2', () => 'mock', 'get');
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component).toEqual(
        assertion.objectContaining({
          beforeAll1: 'mock',
          beforeEach1: 'mock',
          beforeEach2: 'mock',
          it2: 'mock',
        }),
      );
      expect(component.beforeAll2).toBeUndefined();
      expect(component.beforeEach3).toBeUndefined();
      expect(component.it1).toBeUndefined();

      // caused by reset in beforeAll
      expect(component.describe1).toBeUndefined();
      expect(component.describe2).toBeUndefined();
      expect(component.global).toBeUndefined();
    });

    it('gets right stubs #2', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component).toEqual(
        assertion.objectContaining({
          beforeAll1: 'mock',
          beforeEach1: 'mock',
          beforeEach2: 'mock',
        }),
      );
      expect(component.beforeAll2).toBeUndefined();
      expect(component.beforeEach3).toBeUndefined();
      expect(component.it1).toBeUndefined();
      expect(component.it2).toBeUndefined();

      // caused by reset in beforeAll
      expect(component.describe1).toBeUndefined();
      expect(component.describe2).toBeUndefined();
      expect(component.global).toBeUndefined();
    });
  });

  it('gets right stubs #3', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    expect(component).toEqual(
      assertion.objectContaining({
        beforeAll1: 'mock',
        beforeEach1: 'mock',
        beforeEach2: 'mock',
      }),
    );
    expect(component.beforeAll2).toBeUndefined();
    expect(component.beforeEach3).toBeUndefined();
    expect(component.it1).toBeUndefined();
    expect(component.it2).toBeUndefined();

    // caused by reset in beforeAll
    expect(component.describe1).toBeUndefined();
    expect(component.describe2).toBeUndefined();
    expect(component.global).toBeUndefined();
  });
});
