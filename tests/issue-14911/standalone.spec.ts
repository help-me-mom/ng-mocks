import { Component, forwardRef, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const constructionError = new Error('standalone import construction');
const TOKEN = new InjectionToken<unknown>('issue-14911-standalone');
let failConstruction = false;

@Component({
  selector: 'issue-14911-kept-import',
  standalone: true,
  template: 'kept import',
})
class KeptComponent {}

@Component({
  providers: [
    {
      provide: TOKEN,
      useExisting: forwardRef(() => {
        if (failConstruction) {
          throw constructionError;
        }

        return FailingComponent;
      }),
    },
  ],
  selector: 'issue-14911-failing-import',
  standalone: true,
  template: '',
})
class FailingComponent {}

@Component({
  imports: [KeptComponent, FailingComponent],
  selector: 'issue-14911-standalone',
  standalone: true,
  template: '<issue-14911-kept-import></issue-14911-kept-import>',
})
class TargetComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14911
describe('issue-14911:standalone', () => {
  beforeEach(() => ngMocks.reset());

  afterEach(() => {
    failConstruction = false;
    ngMocks.globalWipe(KeptComponent);
    ngMocks.reset();
  });

  it('retries failed imports with the current global keep policy', async () => {
    failConstruction = true;
    let actualError: unknown;
    try {
      MockComponent(TargetComponent);
    } catch (error) {
      actualError = error;
    }
    expect(actualError).toBe(constructionError);

    failConstruction = false;
    // A failed import must not retain the earlier mock resolution of KeptComponent.
    ngMocks.globalKeep(KeptComponent);
    const mock = MockComponent(TargetComponent);
    expect(mock).not.toBe(TargetComponent);
    expect(MockComponent(TargetComponent)).toBe(mock);

    await TestBed.configureTestingModule({
      imports: [mock],
    })
      .overrideComponent(mock, {
        set: {
          template:
            '<issue-14911-kept-import></issue-14911-kept-import>',
        },
      })
      .compileComponents();

    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('kept import');
    expect(
      isMockOf(ngMocks.findInstance(KeptComponent), KeptComponent),
    ).toBe(false);
  });
});
