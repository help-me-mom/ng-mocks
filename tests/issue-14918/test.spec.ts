import {
  booleanAttribute,
  Component,
  Directive,
  Input,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MockDirective } from 'ng-mocks';

const baseInputs = [{ name: 'foo', alias: 'appBaseHeader' }];
const baseBar = {
  alias: 'appBaseHeaderBar',
  transform: booleanAttribute,
};
const derivedInputs = [
  { name: 'foo', alias: 'appSomeHeader' },
  {
    name: 'bar',
    alias: 'appSomeHeaderBar',
    transform: booleanAttribute,
  },
];

@Directive({
  selector: '[appBaseHeader]',
  standalone: true,
  inputs: baseInputs,
})
class BaseHeaderDirective {
  public foo = '';
  @Input(baseBar) public bar = false;
}

@Directive({
  selector: '[appSomeHeader]',
  standalone: true,
  inputs: derivedInputs,
})
class SomeHeaderDirective extends BaseHeaderDirective {}

@Component({
  standalone: true,
  imports: [SomeHeaderDirective],
  template: `
    <div *appSomeHeader="'foo'; bar: true"></div>
    <div *appSomeHeader="'other'; bar: 'false'"></div>
  `,
})
class DerivedHostComponent {}

@Component({
  standalone: true,
  imports: [BaseHeaderDirective],
  template: `
    <div *appBaseHeader="'base'; bar: true"></div>
    <div *appBaseHeader="'original'; bar: 'false'"></div>
  `,
})
class BaseHostComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14918
// @see https://github.com/help-me-mom/ng-mocks/issues/9655
// Importing ng-mocks installs TestBed interception. The derived class-array
// alias must not replace the base property's decorated alias during reflection.
// Input transforms require Angular 16.1 or newer.
describe('issue-14918', () => {
  for (const reflect of [false, true]) {
    it(
      reflect
        ? 'preserves structural aliases and transforms after reflecting a derived directive'
        : 'preserves structural aliases and transforms in ordinary TestBed',
      async () => {
        if (reflect) {
          MockDirective(SomeHeaderDirective);
        }

        for (let cycle = 0; cycle < 2; cycle += 1) {
          await TestBed.configureTestingModule({
            imports: [DerivedHostComponent],
          }).compileComponents();
          const derivedFixture = TestBed.createComponent(
            DerivedHostComponent,
          );
          derivedFixture.detectChanges();
          const derivedNodes =
            derivedFixture.debugElement.queryAllNodes(
              By.directive(SomeHeaderDirective),
            );

          expect(derivedNodes.length).toBe(2);
          const derived = derivedNodes[0].injector.get(
            SomeHeaderDirective,
          );
          const transformedDerived = derivedNodes[1].injector.get(
            SomeHeaderDirective,
          );
          expect(derived.foo).toBe('foo');
          expect(derived.bar).toBe(true);
          expect(transformedDerived.foo).toBe('other');
          expect(transformedDerived.bar).toBe(false);

          derivedFixture.destroy();
          TestBed.resetTestingModule();

          await TestBed.configureTestingModule({
            imports: [BaseHostComponent],
          }).compileComponents();
          const baseFixture =
            TestBed.createComponent(BaseHostComponent);
          baseFixture.detectChanges();
          const baseNodes = baseFixture.debugElement.queryAllNodes(
            By.directive(BaseHeaderDirective),
          );

          expect(baseNodes.length).toBe(2);
          const base = baseNodes[0].injector.get(BaseHeaderDirective);
          const transformedBase = baseNodes[1].injector.get(
            BaseHeaderDirective,
          );
          expect(base.foo).toBe('base');
          expect(base.bar).toBe(true);
          expect(transformedBase.foo).toBe('original');
          expect(transformedBase.bar).toBe(false);
          expect(baseInputs).toEqual([
            { name: 'foo', alias: 'appBaseHeader' },
          ]);
          expect(baseBar).toEqual({
            alias: 'appBaseHeaderBar',
            transform: booleanAttribute,
          });
          expect(derivedInputs).toEqual([
            { name: 'foo', alias: 'appSomeHeader' },
            {
              name: 'bar',
              alias: 'appSomeHeaderBar',
              transform: booleanAttribute,
            },
          ]);

          baseFixture.destroy();
          TestBed.resetTestingModule();
        }
      },
    );
  }
});
