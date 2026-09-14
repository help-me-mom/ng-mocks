import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

let constructions = 0;

@Component({
  selector: 'portable-issue-15004',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'recovered',
})
class TargetComponent {
  public constructor() {
    constructions += 1;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15004
describe('issue-15004', () => {
  it('forwards compilation failure and permits a fresh successful builder', async () => {
    constructions = 0;
    const failure = new Error('issue-15004 compilation');
    let compilations = 0;
    const builder = MockBuilder()
      .keep(TargetComponent)
      .beforeCompileComponents(testBed => {
        const compileComponents = testBed.compileComponents;
        ngMocks.stubMember(testBed, 'compileComponents', () => {
          ngMocks.stubMember(
            testBed,
            'compileComponents',
            compileComponents,
          );
          compilations += 1;
          return Promise.reject(failure);
        });
      });

    let rejected = false;
    try {
      await builder;
    } catch (error) {
      rejected = true;
      expect(error === failure).toBe(true);
    }

    expect(rejected).toBe(true);
    expect(compilations).toBe(1);
    expect(constructions).toBe(0);

    TestBed.resetTestingModule();
    await MockBuilder().keep(TargetComponent);
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain('recovered');
    expect(constructions).toBe(1);
  });
});
