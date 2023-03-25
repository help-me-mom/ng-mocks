import { Component, Inject, NgModule, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-root-provider-with-string-dep',
  template: ' "name:{{ name }}" ',
})
class TargetComponent {
  public constructor(@Inject('name') public readonly name: string) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

describe('root-provider-with-string-dep', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('finds tokens', () => {
      expect(() =>
        TestBed.createComponent(TargetComponent),
      ).toThrowError(/No provider for name!/);
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('mocks service', () => {
      expect(() => MockRender(TargetComponent)).toThrowError(
        /No provider for name!/,
      );
    });
  });
});
