import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Input,
  input,
  isSignal,
  NgModule,
} from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

let constructorCalls = 0;
let initializerCalls = 0;
let transformations = 0;

@Directive({
  exportAs: 'dependency14897Builder',
  selector: '[dependency-14897-builder]',
  standalone: false,
})
class DependencyDirective {
  public readonly initialized = ++initializerCalls;
  public readonly plain = input('original plain');
  public readonly label = input('original label', {
    alias: 'publicLabel',
  });
  public readonly requiredName = input.required<string>({
    alias: 'requiredLabel',
  });
  public readonly amount = input(0, {
    alias: 'publicAmount',
    transform: (value: string | number) => {
      transformations += 1;

      return Number(value) * 2;
    },
  });
  @Input() public legacy = 'original legacy';

  public constructor() {
    constructorCalls += 1;
  }
}

@NgModule({
  declarations: [DependencyDirective],
  exports: [DependencyDirective],
})
class DependencyModule {}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'host-14897-builder',
  standalone: false,
  template: `
    <span
      dependency-14897-builder
      [plain]="plain"
      [publicLabel]="label"
      [requiredLabel]="requiredName"
      [publicAmount]="amount"
      [legacy]="legacy"
      #dependency="dependency14897Builder"
      >{{ dependency.plain() }}:{{ dependency.label() }}:{{
        dependency.requiredName()
      }}:{{ dependency.amount() }}:{{ dependency.legacy }}</span
    >
  `,
})
class HostComponent {
  public plain = 'first';
  public label = 'label-first';
  public requiredName = 'required-first';
  public amount: string | number = '2';
  public legacy = 'legacy-first';
}

@NgModule({
  declarations: [HostComponent],
  imports: [DependencyModule],
})
class HostModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14897
describe('issue-14897:builder', () => {
  // The root TypeScript-only runner does not compile directive signal inputs.
  if (!(DependencyDirective as any).ɵdir?.inputs?.plain) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => {
    constructorCalls = 0;
    initializerCalls = 0;
    transformations = 0;
  });

  describe('mocked through a dependency module', () => {
    beforeEach(() => MockBuilder(HostComponent, HostModule));

    it('updates callable signal inputs without running initializer transform logic', () => {
      const fixture = MockRender(HostComponent);
      const host = fixture.point.componentInstance;
      const element = ngMocks.find('span');
      const directive = ngMocks.get(element, DependencyDirective);
      const plain = directive.plain;
      const label = directive.label;
      const requiredName = directive.requiredName;
      const amount = directive.amount;

      expect(isMockOf(directive, DependencyDirective)).toBe(true);
      expect(isSignal(plain)).toBe(true);
      expect(isSignal(label)).toBe(true);
      expect(isSignal(requiredName)).toBe(true);
      expect(isSignal(amount)).toBe(true);
      expect(isSignal(directive.legacy)).toBe(false);
      // Mock directives retain raw bindings without running input initializer transforms.
      expect([
        plain(),
        label(),
        requiredName(),
        amount(),
        directive.legacy,
      ]).toEqual([
        'first',
        'label-first',
        'required-first',
        '2',
        'legacy-first',
      ]);
      expect([
        ngMocks.input(element, 'plain'),
        ngMocks.input(element, 'publicLabel'),
        ngMocks.input(element, 'requiredLabel'),
        ngMocks.input(element, 'publicAmount'),
        ngMocks.input(element, 'legacy'),
      ]).toEqual([
        'first',
        'label-first',
        'required-first',
        '2',
        'legacy-first',
      ]);
      expect(ngMocks.formatText(fixture)).toEqual(
        'first:label-first:required-first:2:legacy-first',
      );
      expect(directive.initialized).toBeUndefined();
      expect(constructorCalls).toBe(0);
      expect(initializerCalls).toBe(0);
      expect(transformations).toBe(0);

      host.plain = 'second';
      host.label = 'label-second';
      host.requiredName = 'required-second';
      host.amount = 3;
      host.legacy = 'legacy-second';
      fixture.detectChanges();

      expect(directive.plain).toBe(plain);
      expect(directive.label).toBe(label);
      expect(directive.requiredName).toBe(requiredName);
      expect(directive.amount).toBe(amount);
      expect([
        plain(),
        label(),
        requiredName(),
        amount(),
        directive.legacy,
      ]).toEqual([
        'second',
        'label-second',
        'required-second',
        3,
        'legacy-second',
      ]);
      expect([
        ngMocks.input(element, 'plain'),
        ngMocks.input(element, 'publicLabel'),
        ngMocks.input(element, 'requiredLabel'),
        ngMocks.input(element, 'publicAmount'),
        ngMocks.input(element, 'legacy'),
      ]).toEqual([
        'second',
        'label-second',
        'required-second',
        3,
        'legacy-second',
      ]);
      expect(ngMocks.formatText(fixture)).toEqual(
        'second:label-second:required-second:3:legacy-second',
      );
      expect(constructorCalls).toBe(0);
      expect(initializerCalls).toBe(0);
      expect(transformations).toBe(0);

      host.plain = 'third';
      host.label = 'label-third';
      host.requiredName = 'required-third';
      host.amount = '4';
      host.legacy = 'legacy-third';
      fixture.detectChanges();

      expect(directive.plain).toBe(plain);
      expect(directive.label).toBe(label);
      expect(directive.requiredName).toBe(requiredName);
      expect(directive.amount).toBe(amount);
      expect([
        plain(),
        label(),
        requiredName(),
        amount(),
        directive.legacy,
      ]).toEqual([
        'third',
        'label-third',
        'required-third',
        '4',
        'legacy-third',
      ]);
      expect([
        ngMocks.input(element, 'plain'),
        ngMocks.input(element, 'publicLabel'),
        ngMocks.input(element, 'requiredLabel'),
        ngMocks.input(element, 'publicAmount'),
        ngMocks.input(element, 'legacy'),
      ]).toEqual([
        'third',
        'label-third',
        'required-third',
        '4',
        'legacy-third',
      ]);
      expect(ngMocks.formatText(fixture)).toEqual(
        'third:label-third:required-third:4:legacy-third',
      );
      expect(constructorCalls).toBe(0);
      expect(initializerCalls).toBe(0);
      expect(transformations).toBe(0);
    });
  });

  describe('kept through a dependency module', () => {
    beforeEach(() =>
      MockBuilder(HostComponent, HostModule).keep(
        DependencyDirective,
      ),
    );

    it('preserves real signal inputs and initialization when the directive is kept', () => {
      const fixture = MockRender(HostComponent);
      const host = fixture.point.componentInstance;
      const element = ngMocks.find('span');
      const directive = ngMocks.get(element, DependencyDirective);
      const plain = directive.plain;
      const label = directive.label;
      const requiredName = directive.requiredName;
      const amount = directive.amount;

      expect(isMockOf(directive, DependencyDirective)).toBe(false);
      expect(isSignal(plain)).toBe(true);
      expect(isSignal(label)).toBe(true);
      expect(isSignal(requiredName)).toBe(true);
      expect(isSignal(amount)).toBe(true);
      expect(isSignal(directive.legacy)).toBe(false);
      expect([
        plain(),
        label(),
        requiredName(),
        amount(),
        directive.legacy,
      ]).toEqual([
        'first',
        'label-first',
        'required-first',
        4,
        'legacy-first',
      ]);
      expect(ngMocks.input(element, 'plain')).toEqual('first');
      expect(ngMocks.input(element, 'publicLabel')).toEqual(
        'label-first',
      );
      expect(ngMocks.input(element, 'requiredLabel')).toEqual(
        'required-first',
      );
      expect(ngMocks.input(element, 'publicAmount')).toEqual(4);
      expect(ngMocks.input(element, 'legacy')).toEqual(
        'legacy-first',
      );
      expect(ngMocks.formatText(fixture)).toEqual(
        'first:label-first:required-first:4:legacy-first',
      );
      expect(directive.initialized).toBe(1);
      expect(constructorCalls).toBe(1);
      expect(initializerCalls).toBe(1);
      expect(transformations).toBe(1);

      host.plain = 'second';
      host.label = 'label-second';
      host.requiredName = 'required-second';
      host.amount = 3;
      host.legacy = 'legacy-second';
      fixture.detectChanges();

      expect(directive.plain).toBe(plain);
      expect(directive.label).toBe(label);
      expect(directive.requiredName).toBe(requiredName);
      expect(directive.amount).toBe(amount);
      expect([
        plain(),
        label(),
        requiredName(),
        amount(),
        directive.legacy,
      ]).toEqual([
        'second',
        'label-second',
        'required-second',
        6,
        'legacy-second',
      ]);
      expect(ngMocks.formatText(fixture)).toEqual(
        'second:label-second:required-second:6:legacy-second',
      );
      expect(transformations).toBe(2);

      host.plain = 'third';
      host.label = 'label-third';
      host.requiredName = 'required-third';
      host.amount = '4';
      host.legacy = 'legacy-third';
      fixture.detectChanges();

      expect(directive.plain).toBe(plain);
      expect(directive.label).toBe(label);
      expect(directive.requiredName).toBe(requiredName);
      expect(directive.amount).toBe(amount);
      expect([
        plain(),
        label(),
        requiredName(),
        amount(),
        directive.legacy,
      ]).toEqual([
        'third',
        'label-third',
        'required-third',
        8,
        'legacy-third',
      ]);
      expect(ngMocks.input(element, 'plain')).toEqual('third');
      expect(ngMocks.input(element, 'publicLabel')).toEqual(
        'label-third',
      );
      expect(ngMocks.input(element, 'requiredLabel')).toEqual(
        'required-third',
      );
      expect(ngMocks.input(element, 'publicAmount')).toEqual(8);
      expect(ngMocks.input(element, 'legacy')).toEqual(
        'legacy-third',
      );
      expect(ngMocks.formatText(fixture)).toEqual(
        'third:label-third:required-third:8:legacy-third',
      );
      expect(directive.initialized).toBe(1);
      expect(constructorCalls).toBe(1);
      expect(initializerCalls).toBe(1);
      expect(transformations).toBe(3);
    });
  });
});
