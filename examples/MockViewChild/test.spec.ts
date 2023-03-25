import { Component, NgModule, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

// A component we want to mock.
@Component({
  selector: 'child-mock-view-child',
  template: 'child',
})
class ChildComponent {
  public readonly form = {
    valid: true,
  };
}

// A component we want to test.
@Component({
  selector: 'parent-mock-view-child',
  template: `
    <child-mock-view-child #child></child-mock-view-child>
    "Issue: {{ child.form.valid }}"
  `,
})
class ParentComponent {
  @ViewChild('child', {} as any)
  public readonly child?: ChildComponent;
}

@NgModule({
  declarations: [ChildComponent, ParentComponent],
})
class TargetModule {}

describe('MockViewChild', () => {
  // It failed instantly, because the mock instance of ChildComponent
  // does not have form and form.valid would cause
  // "Cannot read property 'valid' of undefined".
  // Therefore we need to customize the mock instance before it has
  // been rendered.
  // For that ng-mocks has MockInstance, if you want to customize it
  // globally for all tests, then consider ngMocks.defaultMock.
  beforeAll(() =>
    MockInstance(ChildComponent, () => ({
      form: {
        valid: false,
      },
    })),
  );

  // Do not forget to clean up the customization.
  afterAll(MockReset);

  // Normal test setup
  beforeEach(() => MockBuilder(ParentComponent, TargetModule));

  it('renders and finds the mock child component', () => {
    // does not fail anymore.
    const fixture = MockRender(ParentComponent);

    // profit, now we can verify the template.
    expect(fixture.nativeElement.innerHTML).toContain(
      '"Issue: false"',
    );
  });
});

describe('MockViewChild:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [ParentComponent, ChildComponent],
    }).compileComponents(),
  );

  it('renders and finds the child component', () => {
    const fixture = MockRender(ParentComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      '"Issue: true"',
    );
  });
});
