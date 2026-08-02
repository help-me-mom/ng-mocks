import { Component, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'issue-8649-my-comp-2',
  template: 'real MyComp2',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
})
class MyComp2 {}

@Component({
  selector: 'issue-8649-my-comp-1',
  template: '<issue-8649-my-comp-2></issue-8649-my-comp-2>',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    MyComp2,
  ],
})
class MyComp1 {}

@Component({
  selector: 'issue-8649-target',
  template: `
    <issue-8649-my-comp-1></issue-8649-my-comp-1>
    <issue-8649-my-comp-2></issue-8649-my-comp-2>
  `,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    MyComp1,
    MyComp2,
  ],
})
class TargetComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/8649
// The failure needs a shared standalone import: TargetComponent and MyComp1
// both import MyComp2. MockComponent(MyComp1) creates a mock of that nested
// import before the mixed-TestBed bridge resolves TargetComponent's real graph,
// so the cached mock leaks into TargetComponent's own MyComp2 import.
// Real TestBed roots and their dependencies should stay real unless the user
// explicitly mocks them, while MockBuilder's shallow behavior stays unchanged.
describe('issue-8649', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs >=a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  it('keeps an unrequested shared import real with declarations', async () => {
    await TestBed.configureTestingModule({
      declarations: [MockComponent(MyComp1)],
      imports: [TargetComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();

    const myComp1 = ngMocks.findInstance(fixture, MyComp1);
    const myComp2 = ngMocks.findInstance(fixture, MyComp2);

    // The author explicitly requested a mock of MyComp1 only.
    expect(isMockOf(myComp1, MyComp1)).toBe(true);

    // MyComp2 is also rendered directly by the real TargetComponent, so the
    // author's untouched TestBed import graph should keep it real.
    expect(isMockOf(myComp2, MyComp2)).toBe(false);
    expect(ngMocks.formatText(fixture)).toContain('real MyComp2');
  });

  it('keeps an unrequested shared import real with imports', async () => {
    await TestBed.configureTestingModule({
      imports: [TargetComponent, MockComponent(MyComp1)],
    }).compileComponents();

    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();

    const myComp1 = ngMocks.findInstance(fixture, MyComp1);
    const myComp2 = ngMocks.findInstance(fixture, MyComp2);

    // Moving a standalone mock to imports must not widen the requested scope.
    expect(isMockOf(myComp1, MyComp1)).toBe(true);
    expect(isMockOf(myComp2, MyComp2)).toBe(false);
    expect(ngMocks.formatText(fixture)).toContain('real MyComp2');
  });

  it('mocks the shared import when explicitly requested', async () => {
    await TestBed.configureTestingModule({
      imports: [
        TargetComponent,
        MockComponent(MyComp1),
        MockComponent(MyComp2),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();

    const myComp1 = ngMocks.findInstance(fixture, MyComp1);
    const myComp2 = ngMocks.findInstance(fixture, MyComp2);

    // Explicit mocks take precedence over the real root's dependency graph.
    expect(isMockOf(myComp1, MyComp1)).toBe(true);
    expect(isMockOf(myComp2, MyComp2)).toBe(true);
  });

  describe('with a global resolution', () => {
    beforeAll(() => ngMocks.globalMock(MyComp2));
    afterAll(() => ngMocks.globalWipe(MyComp2));

    it('mocks the shared import when globally requested', async () => {
      await TestBed.configureTestingModule({
        imports: [TargetComponent, MockComponent(MyComp1)],
      }).compileComponents();

      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      const myComp2 = ngMocks.findInstance(fixture, MyComp2);

      // Global resolutions also take precedence over inferred real imports.
      expect(isMockOf(myComp2, MyComp2)).toBe(true);
    });
  });

  it('still mocks standalone imports with MockBuilder shallow rendering', async () => {
    await MockBuilder(TargetComponent);

    const fixture = MockRender(TargetComponent);
    const myComp1 = ngMocks.findInstance(fixture, MyComp1);
    const myComp2 = ngMocks.findInstance(fixture, MyComp2);

    // MockBuilder(TargetComponent) explicitly requests shallow rendering.
    expect(isMockOf(myComp1, MyComp1)).toBe(true);
    expect(isMockOf(myComp2, MyComp2)).toBe(true);
  });
});
