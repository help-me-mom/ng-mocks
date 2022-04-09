import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MockModule } from 'ng-mocks';

@NgModule({
  declarations: [[undefined, null]],
})
class Target1Module {}

@NgModule({
  exports: [[undefined, null]],
})
class Target2Module {}

@NgModule({
  imports: [
    [undefined, null],
    {
      ngModule: CommonModule,
      providers: [[undefined, null]],
    },
  ],
})
class Target3Module {}

@NgModule({
  providers: [[undefined, null]],
})
class Target4Module {}

@NgModule({
  declarations: [[undefined, null]],
  exports: [[undefined, null]],
  imports: [
    [undefined, null],
    {
      ngModule: CommonModule,
      providers: [[undefined, null]],
    },
  ],
  providers: [[undefined, null]],
})
class Target5Module {}

// @see https://github.com/ike18t/ng-mocks/issues/248
describe('issue-248', () => {
  it('does not fail', () => {
    expect(() => MockModule(Target1Module)).not.toThrow();
    expect(() => MockModule(Target2Module)).not.toThrow();
    expect(() => MockModule(Target3Module)).not.toThrow();
    expect(() => MockModule(Target4Module)).not.toThrow();
    expect(() => MockModule(Target5Module)).not.toThrow();
  });
});
