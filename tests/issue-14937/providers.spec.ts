import {
  Component,
  Inject,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockModule, ngMocks } from 'ng-mocks';

class Value {
  public constructor(public readonly label: string) {}
}

const TOKEN = new InjectionToken<Value>('issue-14937-provider');
// Class instances preserve useValue identity in View Engine too.
const configuredValue = new Value('explicit replacement provider');
let boundaryConstructions = 0;

@NgModule({})
class OriginalModule {}

@NgModule({})
class ReplacementModule {}

@Component({
  selector: 'boundary-14937-providers',
  ['standalone' as never]: false,
  template: 'real boundary',
})
class BoundaryComponent {
  public constructor() {
    boundaryConstructions += 1;
  }
}

@NgModule({
  declarations: [BoundaryComponent],
  exports: [BoundaryComponent],
})
class BoundaryModule {}

@Component({
  selector: 'host-14937-providers',
  ['standalone' as never]: false,
  template:
    '<span>{{ value.label }}</span><boundary-14937-providers></boundary-14937-providers>',
})
class HostComponent {
  public constructor(@Inject(TOKEN) public readonly value: Value) {}
}

@NgModule({
  declarations: [HostComponent],
  imports: [OriginalModule, BoundaryModule],
})
class HostModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14937
// An inferred bare replacement must not discard its explicit provider-bearing import.
describe('issue-14937:providers', () => {
  beforeEach(() => {
    boundaryConstructions = 0;
    ngMocks.globalReplace(OriginalModule, ReplacementModule);
  });
  afterEach(() => ngMocks.globalWipe(OriginalModule));

  it('preserves providers on an explicitly imported replacement module', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HostModule,
        {
          ngModule: ReplacementModule,
          providers: [{ provide: TOKEN, useValue: configuredValue }],
        },
        MockModule(BoundaryModule),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const boundary = ngMocks.find(fixture, BoundaryComponent);

    expect(isMockOf(fixture.componentInstance, HostComponent)).toBe(
      false,
    );
    expect(fixture.componentInstance.value).toBe(configuredValue);
    expect(ngMocks.get(TOKEN)).toBe(configuredValue);
    expect(ngMocks.findInstance(fixture, TOKEN)).toBe(
      configuredValue,
    );
    expect(ngMocks.formatText(fixture)).toBe(
      'explicit replacement provider',
    );
    expect(
      isMockOf(boundary.componentInstance, BoundaryComponent),
    ).toBe(true);
    expect(boundaryConstructions).toBe(0);
    expect(ngMocks.formatText(boundary)).toBe('');
  });
});
