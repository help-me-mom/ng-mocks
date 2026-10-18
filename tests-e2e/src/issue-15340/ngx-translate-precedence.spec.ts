import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from '@ngx-translate/core';
import {
  getMockedNgDefOf,
  isMockedNgDefOf,
  MockBuilder,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@NgModule({
  imports: [TranslatePipe],
  exports: [TranslatePipe],
})
class WarmPipeModule {}

@NgModule({
  imports: [TranslatePipe],
  exports: [TranslatePipe],
})
class ProbePipeModule {}

@Component({
  selector: 'host-translate-precedence-15340',
  standalone: false,
  template: `{{ 'active' | translate }}`,
})
class HostComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('issue-15340:ngx-translate-precedence', () => {
  beforeEach(() => ngMocks.reset());
  afterEach(() => ngMocks.reset());

  it('retains the fixture TranslatePipe mock when traversing another module', () => {
    // Module traversal caches a pipe without the fixture's transform callback.
    MockModule(WarmPipeModule);

    const metadata = MockBuilder()
      .keep(HostComponent)
      .mock(TranslatePipe, value => `fixture:${value}`)
      .build();
    const fixturePipes = metadata.imports!.filter(declaration =>
      isMockedNgDefOf(declaration, TranslatePipe, 'p'),
    );
    expect(fixturePipes.length).toBeGreaterThan(0);
    const fixturePipe = fixturePipes[0];
    expect(fixturePipe).toBeDefined();
    TestBed.configureTestingModule(metadata);
    const activeFixture = TestBed.createComponent(HostComponent);
    activeFixture.detectChanges();
    expect(ngMocks.formatText(activeFixture)).toBe('fixture:active');
    expect(fixturePipe).toBe(getMockedNgDefOf(TranslatePipe, 'p'));

    // TranslatePipe is injectable: its provider must not hide the active mock pipe.
    const probeModule = MockModule(ProbePipeModule);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [probeModule] });

    const fixture = MockRender("{{ 'value' | translate }}");
    expect(ngMocks.formatText(fixture)).toBe('fixture:value');
  });
});
