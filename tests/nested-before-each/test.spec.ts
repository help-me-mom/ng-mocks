import { Type, Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockComponent } from 'ng-mocks';

@Component({
  selector: 'internal-nested-before-each',
  template: 'internal',
})
export class InternalComponent {}

@NgModule({
  declarations: [InternalComponent],
  exports: [InternalComponent],
})
export class TargetModule {}

describe('nested-before-each', () => {
  let level = 0;
  let mock: Type<any>;

  beforeEach(() => {
    level = 0;
    mock = MockComponent(InternalComponent);

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
        expect(MockComponent(InternalComponent)).toBe(mock);
      });

      it('should have the same mock after the second run', () => {
        expect(level).toBeGreaterThan(0);
        expect(MockComponent(InternalComponent)).toBe(mock);
      });
    });
  });
});

describe('nested-before-all', () => {
  let level = 0;
  let mock: Type<any>;

  beforeAll(() => {
    level = 0;
    mock = MockComponent(InternalComponent);
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
        expect(MockComponent(InternalComponent)).toBe(mock);
      });

      it('should have the same mock after the second run', () => {
        expect(level).toBeGreaterThan(0);
        expect(MockComponent(InternalComponent)).toBe(mock);
      });
    });
  });
});
