import {
  Component,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
@Pipe({
  name: 'injectablePrecedence15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public static constructed = 0;

  public constructor() {
    TargetPipe.constructed += 1;
  }

  public transform(value: string): string {
    return `real:${value}`;
  }
}

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
  selector: 'host-injectable-precedence-15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class HostComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('issue-15340:injectable-precedence', () => {
  beforeEach(() => {
    ngMocks.reset();
    TargetPipe.constructed = 0;
  });
  afterEach(() => ngMocks.reset());

  it('preserves the active fixture pipe callback over an earlier cached mock', () => {
    // Module traversal caches a mock without the fixture's transform callback.
    MockModule(WarmPipeModule);

    TestBed.configureTestingModule(
      MockBuilder()
        .keep(HostComponent)
        .mock(TargetPipe, value => `fixture:${value}`)
        .build(),
    );
    TestBed.createComponent(HostComponent);

    // The injectable pipe's provider must not hide its configured mock declaration.
    const probeModule = MockModule(ProbePipeModule);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [probeModule] });

    const fixture = MockRender(
      "{{ 'value' | injectablePrecedence15340 }}",
    );
    expect(ngMocks.formatText(fixture)).toBe('fixture:value');
    expect(TargetPipe.constructed).toBe(0);
  });
});
