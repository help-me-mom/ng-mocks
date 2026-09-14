import { Component, Directive, Input, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRender, ngMocks } from 'ng-mocks';

let factoryCalls = 0;

@Directive({
  selector: '[providedControl]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ProvidedControlDirective {
  @Input() public formField = 'unrelated';
}

@Directive({
  selector: '[nativeHint]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  providers: [
    {
      provide: ProvidedControlDirective,
      useFactory: () => {
        factoryCalls += 1;

        return new ProvidedControlDirective();
      },
    },
  ],
})
class HintDirective {}

@Component({
  selector: 'target-ng-mocks-change-native-provider',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<input nativeHint value="initial" />',
})
class TargetComponent {}

@NgModule({
  declarations: [
    TargetComponent,
    HintDirective,
    ProvidedControlDirective,
  ],
  exports: [TargetComponent],
})
class TargetModule {}

describe('ng-mocks-change:native-provider', () => {
  beforeEach(() => {
    factoryCalls = 0;

    return TestBed.configureTestingModule({
      imports: [TargetModule],
    });
  });

  it('changes an unbound input without constructing an unrelated decorated provider', () => {
    MockRender(TargetComponent);
    const input = ngMocks.find('input');

    expect(factoryCalls).toBe(0);
    expect(input.nativeElement.value).toBe('initial');

    // The formField input belongs to a DI provider, not a directive on this host.
    expect(() => ngMocks.change(input, 'updated')).not.toThrow();

    expect(input.nativeElement.value).toBe('updated');
    expect(factoryCalls).toBe(0);

    // Explicit injection still constructs the provider once and preserves its identity.
    const dependency = input.injector.get(ProvidedControlDirective);
    expect(dependency.formField).toBe('unrelated');
    expect(factoryCalls).toBe(1);
    expect(input.injector.get(ProvidedControlDirective)).toBe(
      dependency,
    );
    expect(factoryCalls).toBe(1);
  });
});
