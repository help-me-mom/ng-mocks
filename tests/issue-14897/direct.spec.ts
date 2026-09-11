import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Input,
  input,
  isSignal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockDirective, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[dependency14897]',
  standalone: true,
})
class DependencyDirective {
  public static constructed = 0;
  public static transformed = 0;

  public readonly plain = input('plain-default');
  public readonly label = input('label-default', {
    alias: 'publicLabel',
  });
  public readonly requiredName = input.required<string>({
    alias: 'requiredLabel',
  });
  public readonly amount = input(0, {
    alias: 'publicAmount',
    transform: (value: string | number) => {
      DependencyDirective.transformed += 1;

      return Number(value);
    },
  });
  @Input() public legacy = 'legacy-default';

  public constructor() {
    DependencyDirective.constructed += 1;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'host-14897-direct',
  standalone: false,
  template: `
    <span
      dependency14897
      [plain]="plain"
      [publicLabel]="label"
      [requiredLabel]="requiredName"
      [publicAmount]="amount"
      [legacy]="legacy"
      >{{ plain }}:{{ label }}:{{ requiredName }}:{{ amount }}:{{
        legacy
      }}</span
    >
  `,
})
class HostComponent {
  public plain = 'plain-1';
  public label = 'label-1';
  public requiredName = 'required-1';
  public amount: string | number = '1';
  public legacy = 'legacy-1';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14897
describe('issue-14897:direct', () => {
  // The root TypeScript-only runner does not transform signal declarations.
  // Directives expose their compiled inputs through ɵdir, not reflectComponentType.
  if (!(DependencyDirective as any).ɵdir?.inputs?.plain) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => {
    DependencyDirective.constructed = 0;
    DependencyDirective.transformed = 0;

    return TestBed.configureTestingModule({
      declarations: [HostComponent],
      imports: [MockDirective(DependencyDirective)],
    }).compileComponents();
  });

  it('updates signal inputs and aliases without executing original transforms', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const element = ngMocks.find(fixture, 'span');
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
    expect(plain()).toEqual('plain-1');
    expect(label()).toEqual('label-1');
    expect(requiredName()).toEqual('required-1');
    // Angular does not expose the signal transform in compiled input metadata.
    // MockDirective skips original field initializers, so this signal receives
    // raw bound values without executing the original transform.
    expect(amount() as unknown).toEqual('1');
    expect(directive.legacy).toEqual('legacy-1');
    expect(ngMocks.input(element, 'plain')).toEqual('plain-1');
    expect(ngMocks.input(element, 'publicLabel')).toEqual('label-1');
    expect(ngMocks.input(element, 'requiredLabel')).toEqual(
      'required-1',
    );
    expect(ngMocks.input(element, 'publicAmount')).toEqual('1');
    expect(ngMocks.input(element, 'legacy')).toEqual('legacy-1');
    expect(DependencyDirective.constructed).toEqual(0);
    expect(DependencyDirective.transformed).toEqual(0);

    host.plain = 'plain-2';
    host.label = 'label-2';
    host.requiredName = 'required-2';
    host.amount = 2;
    host.legacy = 'legacy-2';
    // Direct TestBed fixtures need notification after plain property updates in zoneless mode.
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(directive.plain).toBe(plain);
    expect(directive.label).toBe(label);
    expect(directive.requiredName).toBe(requiredName);
    expect(directive.amount).toBe(amount);
    expect(plain()).toEqual('plain-2');
    expect(label()).toEqual('label-2');
    expect(requiredName()).toEqual('required-2');
    expect(amount()).toEqual(2);
    expect(directive.legacy).toEqual('legacy-2');
    expect(ngMocks.input(element, 'plain')).toEqual('plain-2');
    expect(ngMocks.input(element, 'publicLabel')).toEqual('label-2');
    expect(ngMocks.input(element, 'requiredLabel')).toEqual(
      'required-2',
    );
    expect(ngMocks.input(element, 'publicAmount')).toEqual(2);
    expect(ngMocks.input(element, 'legacy')).toEqual('legacy-2');
    expect(DependencyDirective.constructed).toEqual(0);
    expect(DependencyDirective.transformed).toEqual(0);

    host.plain = 'plain-3';
    host.label = 'label-3';
    host.requiredName = 'required-3';
    host.amount = '3';
    host.legacy = 'legacy-3';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(directive.plain).toBe(plain);
    expect(directive.label).toBe(label);
    expect(directive.requiredName).toBe(requiredName);
    expect(directive.amount).toBe(amount);
    expect(plain()).toEqual('plain-3');
    expect(label()).toEqual('label-3');
    expect(requiredName()).toEqual('required-3');
    expect(amount() as unknown).toEqual('3');
    expect(directive.legacy).toEqual('legacy-3');
    expect(ngMocks.input(element, 'plain')).toEqual('plain-3');
    expect(ngMocks.input(element, 'publicLabel')).toEqual('label-3');
    expect(ngMocks.input(element, 'requiredLabel')).toEqual(
      'required-3',
    );
    expect(ngMocks.input(element, 'publicAmount')).toEqual('3');
    expect(ngMocks.input(element, 'legacy')).toEqual('legacy-3');
    expect(DependencyDirective.constructed).toEqual(0);
    expect(DependencyDirective.transformed).toEqual(0);
    expect(ngMocks.formatText(fixture)).toEqual(
      'plain-3:label-3:required-3:3:legacy-3',
    );
  });
});
