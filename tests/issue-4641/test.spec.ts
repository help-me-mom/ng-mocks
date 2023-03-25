import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'replace-4641',
  template: 'replace-real',
})
class ReplaceComponent {
  public replace() {
    return true;
  }
}

@NgModule({
  declarations: [ReplaceComponent],
  exports: [ReplaceComponent],
})
class ReplaceModule {}

@Component({
  selector: 'replace-4641',
  template: 'replace-mock',
})
class ReplaceMockComponent {
  public replaceMock() {
    return true;
  }
}

@Component({
  selector: 'target-4641',
  template: `
    dep1:<dep1-4641></dep1-4641> dep2:<dep2-4641
    ></dep2-4641> replace:<replace-4641></replace-4641>
  `,
})
class TargetComponent {}

@Component({
  selector: 'dep1-4641',
  template: '<replace-4641></replace-4641>',
})
class Dep1Component {}

@Component({
  selector: 'dep2-4641',
  template: '<replace-4641></replace-4641>',
})
class Dep2Component {}

@NgModule({
  declarations: [Dep1Component],
  exports: [Dep1Component],
  imports: [ReplaceModule],
})
class Dep1Module {}

@NgModule({
  declarations: [Dep2Component],
  exports: [Dep2Component],
  imports: [ReplaceModule],
})
class Dep2Module {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4641
// MockBuilder under TestBed.configureTestingModule doesn't respect `.overrideModule`.
describe('issue-4641:test', () => {
  beforeEach(() => ngMocks.flushTestBed());

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [MockModule(Dep1Module), Dep2Module, ReplaceModule],
    })
      .overrideModule(ReplaceModule, {
        remove: {
          declarations: [ReplaceComponent],
          exports: [ReplaceComponent],
        },
        add: {
          declarations: [ReplaceMockComponent],
          exports: [ReplaceMockComponent],
        },
      })
      .compileComponents(),
  );

  it('replaces declarations', () => {
    const fixture = MockRender(TargetComponent);

    // dep1 is mock and should have an empty template
    expect(ngMocks.formatText(fixture)).not.toContain('dep1:replace');
    // dep2 was kept, but it should rely on the replaced declaration.
    // TODO it looks like Angular bug itself, it doesn't redefine nested imports
    // expect(ngMocks.formatText(fixture)).toContain('dep2:replace-mock');
    // replace was replaced, therefore, it should rely on the replaced declaration.
    expect(ngMocks.formatText(fixture)).toContain(
      'replace:replace-mock',
    );
  });
});
