import {
  Component,
  input,
  isSignal,
  reflectComponentType,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-13671-kept',
  standalone: true,
  template: '{{ name() }}',
})
class KeptComponent {
  public readonly name = input('kept-default');
  public readonly label = input('kept-label', {
    alias: 'displayLabel',
  });
}

@Component({
  selector: 'target-13671-mocked',
  standalone: true,
  template: '{{ name() }}',
})
class MockedComponent {
  public readonly name = input('mocked-default');
  public readonly label = input('mocked-label', {
    alias: 'displayLabel',
  });
}

@Component({
  imports: [KeptComponent, MockedComponent],
  standalone: true,
  template: `
    <target-13671-kept [name]="'kept-bound'" />
    <target-13671-mocked
      [name]="'mocked-bound'"
      [displayLabel]="'mocked-alias'"
    />
  `,
})
class TargetComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/9684
// @see https://github.com/help-me-mom/ng-mocks/issues/13671
describe('issue-13671', () => {
  if (
    !reflectComponentType(MockedComponent)?.inputs.some(
      inputMetadata => inputMetadata.propName === 'name',
    )
  ) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(KeptComponent)
      .mock(MockedComponent),
  );

  it('keeps signal inputs callable on mocked components', () => {
    MockRender(TargetComponent);

    const kept = ngMocks.find(KeptComponent).componentInstance;
    const mocked = ngMocks.find(MockedComponent).componentInstance;

    expect(kept.name()).toEqual('kept-bound');
    expect(typeof mocked.name).toEqual('function');
    expect(isSignal(mocked.name)).toBe(true);
    expect(mocked.name()).toEqual('mocked-bound');
    expect(mocked.label()).toEqual('mocked-alias');
  });
});
