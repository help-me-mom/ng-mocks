import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target1-ng-mocks-global-keep-modules',
  template: '{{ name }}',
})
export class Target1Component {
  public readonly name = 'target1';
}

@Component({
  selector: 'target1-ng-mocks-global-keep-modules',
  template: '{{ name }}',
})
export class Fake1Component {
  public readonly name = 'fake1';
}

@NgModule({
  declarations: [Target1Component],
  exports: [Target1Component],
})
export class Target1Module {}

@Component({
  selector: 'target2-ng-mocks-global-keep-modules',
  template: '{{ name }}',
})
export class Target2Component {
  public readonly name = 'target2';
}

@Component({
  selector: 'normal2-ng-mocks-global-keep-modules',
  template: '{{ name }}',
})
export class Normal2Component {
  public readonly name = 'normal2';
}

@NgModule({
  declarations: [Target2Component, Normal2Component],
  exports: [Target2Component, Normal2Component],
  imports: [Target1Module],
})
export class Target2Module {}

@NgModule({
  exports: [Target1Component, Target2Component, Normal2Component],
  imports: [Target1Module, Target2Module],
})
export class Target3Module {}

ngMocks.globalExclude(Target2Component);
ngMocks.globalKeep(Target2Module);
ngMocks.globalReplace(Target1Component, Fake1Component);

describe('ng-mocks-global-keep-modules', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [MockModule(Target3Module)],
    });
  });

  it('replaces Target1Component', () => {
    const fixture = MockRender(
      '<target1-ng-mocks-global-keep-modules></target1-ng-mocks-global-keep-modules>',
    );
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target1-ng-mocks-global-keep-modules>fake1</target1-ng-mocks-global-keep-modules>',
    );
  });

  it('excludes Target2Component', () => {
    expect(() =>
      MockRender(
        '<target2-ng-mocks-global-keep-modules></target2-ng-mocks-global-keep-modules>',
      ),
    ).toThrow();
  });

  it('keeps Normal2Component', () => {
    const fixture = MockRender(
      '<normal2-ng-mocks-global-keep-modules></normal2-ng-mocks-global-keep-modules>',
    );
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<normal2-ng-mocks-global-keep-modules>normal2</normal2-ng-mocks-global-keep-modules>',
    );
  });
});
