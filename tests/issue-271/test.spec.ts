import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly name = 'target';
}

@NgModule()
class TargetModule {
  public static forRoot() {
    return {
      ngModule: TargetModule,
      providers: [TargetService],
    };
  }
}

@NgModule({
  imports: [TargetModule.forRoot()],
})
class AppModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/271
describe('issue-271', () => {
  beforeEach(() =>
    MockBuilder(null, AppModule).exclude(TargetModule),
  );

  it('excludes modules with providers', () => {
    expect(() => MockRender(TargetService)).toThrowError(
      new RegExp(`No provider for ${TargetService.name}`),
    );
  });
});
