import { Type, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockComponent } from 'ng-mocks';

@Component({
  selector: 'target-nested-before-each',
  template: 'target',
})
class TargetComponent {}

describe('nested-before-each', () => {
  let level = 0;
  let mock: Type<any>;

  beforeEach(() => {
    level = 0;
    mock = MockComponent(TargetComponent);

    return MockBuilder(mock);
  });

  describe('tested', () => {
    beforeEach(() => {
      level += 1;
    });

    describe('tested', () => {
      beforeEach(() => {
        level += 1;
      });

      it('should have the same mock after the first run', () => {
        expect(level).toBeGreaterThan(0);
        expect(MockComponent(TargetComponent)).toBe(mock);
      });

      it('should have the same mock after the second run', () => {
        expect(level).toBeGreaterThan(0);
        expect(MockComponent(TargetComponent)).toBe(mock);
      });
    });
  });
});

describe('nested-before-all', () => {
  let level = 0;
  let mock: Type<any>;

  beforeAll(() => {
    level = 0;
    mock = MockComponent(TargetComponent);
    TestBed.resetTestingModule();

    return MockBuilder(mock);
  });

  describe('tested', () => {
    beforeEach(() => {
      level += 1;
    });

    describe('tested', () => {
      beforeEach(() => {
        level += 1;
      });

      it('should have the same mock after the first run', () => {
        expect(level).toBeGreaterThan(0);
        expect(MockComponent(TargetComponent)).toBe(mock);
      });

      it('should have the same mock after the second run', () => {
        expect(level).toBeGreaterThan(0);
        expect(MockComponent(TargetComponent)).toBe(mock);
      });
    });
  });
});
