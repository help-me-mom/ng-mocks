import {
  Component,
  Directive,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getMockedNgDefOf,
  MockBuilder,
  MockComponent,
  MockDirective,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-cache-issue-15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TargetComponent {}

@Directive({
  selector: '[targetCacheIssue15340]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {}

@Pipe({
  name: 'cached15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return `real:${value}`;
  }
}

@NgModule({})
class TargetModule {}

@NgModule({
  declarations: [TargetPipe],
  exports: [TargetPipe],
})
class WarmPipeModule {}

@NgModule({
  declarations: [TargetPipe],
  exports: [TargetPipe],
})
class ProbePipeModule {}

@Component({
  selector: 'host-cache-issue-15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class HostComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('issue-15340:cached-declarations', () => {
  beforeEach(() => ngMocks.reset());
  afterEach(() => ngMocks.reset());

  it('prefers mocks from the active fixture over earlier cached declarations', () => {
    const cachedComponent = MockComponent(TargetComponent);
    const cachedDirective = MockDirective(TargetDirective);
    const cachedModule = MockModule(TargetModule);
    // Module traversal caches pipes without changing independent MockPipe calls.
    MockModule(WarmPipeModule);

    TestBed.configureTestingModule(
      MockBuilder()
        .keep(HostComponent)
        .mock(TargetComponent)
        .mock(TargetDirective)
        .mock(TargetModule)
        .mock(TargetPipe, value => `fixture:${value}`)
        .build(),
    );
    TestBed.createComponent(HostComponent);

    const fixtureComponent = getMockedNgDefOf(TargetComponent, 'c');
    const fixtureDirective = getMockedNgDefOf(TargetDirective, 'd');
    const fixtureModule = getMockedNgDefOf(TargetModule, 'm');

    expect(fixtureComponent).not.toBe(cachedComponent);
    expect(fixtureDirective).not.toBe(cachedDirective);
    expect(fixtureModule).not.toBe(cachedModule);
    expect(MockComponent(TargetComponent)).toBe(fixtureComponent);
    expect(MockDirective(TargetDirective)).toBe(fixtureDirective);
    expect(MockModule(TargetModule)).toBe(fixtureModule);

    // A fresh module resolves the cached pipe while the first fixture is active.
    const probeModule = MockModule(ProbePipeModule);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [probeModule] });

    const fixture = MockRender("{{ 'value' | cached15340 }}");
    expect(ngMocks.formatText(fixture)).toBe('fixture:value');
  });

  it('returns cached mocks when the active fixture keeps their declarations real', () => {
    const cachedComponent = MockComponent(TargetComponent);
    const cachedDirective = MockDirective(TargetDirective);
    const cachedModule = MockModule(TargetModule);
    MockModule(WarmPipeModule);

    TestBed.configureTestingModule(
      MockBuilder()
        .keep(HostComponent)
        .keep(TargetComponent)
        .keep(TargetDirective)
        .keep(TargetModule)
        .keep(TargetPipe)
        .build(),
    );
    TestBed.createComponent(HostComponent);

    expect(MockComponent(TargetComponent)).toBe(cachedComponent);
    expect(MockDirective(TargetDirective)).toBe(cachedDirective);
    expect(MockModule(TargetModule)).toBe(cachedModule);

    const probeModule = MockModule(ProbePipeModule);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [probeModule] });

    const fixture = MockRender("{{ 'value' | cached15340 }}");
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});
