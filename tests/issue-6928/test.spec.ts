import { CommonModule } from '@angular/common';
import { Component, NgModule, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockComponent,
  MockModule,
  ngMocks,
} from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/6928
describe('issue-6928', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs >=a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  ngMocks.throwOnConsole();

  @Component({
    selector: 'app-shared1',
    template: '',
  })
  class Shared1Component {}

  @Component({
    selector: 'app-shared2',
    template: '',
  })
  class Shared2Component {}

  @NgModule({
    imports: [CommonModule],
    declarations: [Shared1Component, Shared2Component],
    exports: [Shared1Component, Shared2Component],
  })
  class SharedModule {}

  @Component({
    selector: 'app-standalone',
    template: '<app-shared1></app-shared1>',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]:
      true,
    ['imports' as never /* TODO: remove after upgrade to a14 */]: [
      CommonModule,
      SharedModule,
    ],
  })
  class StandaloneComponent {}

  @Component({
    selector: 'app-my-component',
    template:
      '<app-shared2></app-shared2><app-standalone></app-standalone>',
  })
  class MyComponent {}

  @NgModule({
    imports: [
      CommonModule,
      StandaloneComponent as never /* TODO: remove after upgrade to a14 */,
      SharedModule,
    ],
    declarations: [MyComponent],
  })
  class AppModule {}

  describe('missing module import', () => {
    it('throws on 2 declarations w/o ng-mocks', () =>
      expect(() => {
        TestBed.configureTestingModule({
          imports: [
            StandaloneComponent as never /* TODO: remove after upgrade to a14 */,
          ],
          declarations: [MyComponent, Shared2Component],
        }).compileComponents();
        TestBed.createComponent(MyComponent).detectChanges();
      }).toThrowError(
        /is part of the declarations of 2 modules: DynamicTestModule/,
      ));

    it('handles TestBed correctly w/ ng-mocks', () => {
      expect(() => {
        TestBed.configureTestingModule({
          imports: [
            MockComponent(
              StandaloneComponent,
            ) as never /* TODO: remove after upgrade to a14 */,
          ],
          declarations: [
            MyComponent,
            MockComponent(Shared2Component),
          ],
        }).compileComponents();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow();
    });

    it('handles TestBed correctly w/ MockBuilder', () => {
      expect(() => {
        MockBuilder(MyComponent, [
          StandaloneComponent,
          Shared2Component,
        ]).then();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow();
    });
  });

  describe('correct module import', () => {
    it('passes w/o ng-mocks', () =>
      expect(() => {
        TestBed.configureTestingModule({
          imports: [
            StandaloneComponent as never /* TODO: remove after upgrade to a14 */,
            SharedModule,
          ],
          declarations: [MyComponent],
        }).compileComponents();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow());

    it('passes w/ ng-mocks', () =>
      expect(() => {
        TestBed.configureTestingModule({
          imports: [
            MockComponent(
              StandaloneComponent,
            ) as never /* TODO: remove after upgrade to a14 */,
            MockModule(SharedModule),
          ],
          declarations: [MyComponent],
        }).compileComponents();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow());

    it('passes w/ MockBuilder', () =>
      expect(() => {
        MockBuilder(MyComponent, [
          StandaloneComponent,
          SharedModule,
        ]).then();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow());

    it('passes w/ MockBuilder and AppModule', () =>
      expect(() => {
        MockBuilder(MyComponent, [
          AppModule,
          Shared2Component,
        ]).then();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow());
  });
});
