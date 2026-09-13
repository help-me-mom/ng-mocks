import { Component, Input, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockModule, ngMocks } from 'ng-mocks';

let originalConstructions = 0;
let boundaryConstructions = 0;

@Component({
  selector: 'replace-14937',
  ['standalone' as never]: false,
  template: 'original:{{ marker }}',
})
class OriginalComponent {
  @Input() public marker = '';

  public constructor() {
    originalConstructions += 1;
  }
}

@NgModule({
  declarations: [OriginalComponent],
  exports: [OriginalComponent],
})
class ReplaceModule {}

@Component({
  selector: 'replace-14937',
  ['standalone' as never]: false,
  template: 'replacement:{{ marker }}',
  host: { 'data-replacement': '' },
})
class ReplacementComponent {
  @Input() public marker = '';
}

@Component({
  selector: 'nested-14937',
  ['standalone' as never]: false,
  template: '<replace-14937 marker="nested"></replace-14937>',
})
class NestedComponent {}

@NgModule({
  declarations: [NestedComponent],
  exports: [NestedComponent],
  imports: [ReplaceModule],
})
class NestedModule {}

@Component({
  selector: 'boundary-14937',
  ['standalone' as never]: false,
  template: '<replace-14937 marker="boundary"></replace-14937>',
})
class BoundaryComponent {
  public constructor() {
    boundaryConstructions += 1;
  }
}

@NgModule({
  declarations: [BoundaryComponent],
  exports: [BoundaryComponent],
  imports: [ReplaceModule],
})
class BoundaryModule {}

@Component({
  selector: 'target-14937',
  ['standalone' as never]: false,
  template: `
    <section class="root">
      <replace-14937 marker="root"></replace-14937>
    </section>
    <nested-14937></nested-14937>
    <boundary-14937></boundary-14937>
  `,
})
class TargetComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14937
// Keep this graph separate from the real baseline: Angular caches ancestor scopes.
describe('issue-14937', () => {
  beforeEach(() => {
    ngMocks.flushTestBed();
    originalConstructions = 0;
    boundaryConstructions = 0;
  });

  it('preserves a nested-first override before the explicit mocked module', async () => {
    await TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [
        NestedModule,
        MockModule(BoundaryModule),
        ReplaceModule,
      ],
    })
      .overrideModule(ReplaceModule, {
        remove: {
          declarations: [OriginalComponent],
          exports: [OriginalComponent],
        },
        add: {
          declarations: [ReplacementComponent],
          exports: [ReplacementComponent],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    const root = ngMocks.find(fixture, '.root');
    const nested = ngMocks.find(fixture, NestedComponent);
    const boundary = ngMocks.find(fixture, BoundaryComponent);
    const rootReplacement = ngMocks.find(root, 'replace-14937');
    const nestedReplacement = ngMocks.find(nested, 'replace-14937');

    expect(isMockOf(fixture.componentInstance, TargetComponent)).toBe(
      false,
    );
    expect(isMockOf(nested.componentInstance, NestedComponent)).toBe(
      false,
    );
    expect(originalConstructions).toBe(0);
    expect(ngMocks.formatText(root)).toBe('replacement:root');
    expect(ngMocks.formatText(nested)).toBe('replacement:nested');
    expect(rootReplacement.componentInstance.marker).toBe('root');
    expect(nestedReplacement.componentInstance.marker).toBe('nested');
    expect(
      ngMocks.findInstance(
        rootReplacement,
        ReplacementComponent,
        null,
      ),
    ).toBe(rootReplacement.componentInstance);
    expect(
      ngMocks.findInstance(
        nestedReplacement,
        ReplacementComponent,
        null,
      ),
    ).toBe(nestedReplacement.componentInstance);
    expect(rootReplacement.componentInstance).not.toBe(
      nestedReplacement.componentInstance,
    );
    expect(
      isMockOf(
        rootReplacement.componentInstance,
        ReplacementComponent,
      ),
    ).toBe(false);
    expect(
      isMockOf(
        nestedReplacement.componentInstance,
        ReplacementComponent,
      ),
    ).toBe(false);
    expect(
      isMockOf(boundary.componentInstance, BoundaryComponent),
    ).toBe(true);
    expect(boundaryConstructions).toBe(0);
    expect(ngMocks.formatText(boundary)).toBe('');
    expect(ngMocks.find(boundary, 'replace-14937', null)).toBeNull();
  });
});
