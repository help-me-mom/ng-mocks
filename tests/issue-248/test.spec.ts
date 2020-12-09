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

describe('issue-248', () => {
  it('does not fail', () => {
    MockModule(Target1Module);
    MockModule(Target2Module);
    MockModule(Target3Module);
    MockModule(Target4Module);
    MockModule(Target5Module);
  });
});
