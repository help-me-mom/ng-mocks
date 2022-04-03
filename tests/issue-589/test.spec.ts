import { InjectionToken, NgModule } from '@angular/core';
import {
  MockBuilder,
  MockRender,
  ngMocks,
  NgModuleWithProviders,
} from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@NgModule()
class TargetModule {
  public static forRoot(): NgModuleWithProviders<TargetModule> {
    return {
      ngModule: TargetModule,
      providers: [
        {
          provide: TOKEN,
          useValue: 1,
        },
      ],
    };
  }
}

@NgModule({
  imports: [TargetModule.forRoot()],
})
class MyModule {}

ngMocks.globalExclude(TargetModule);

// Looks like a module with providers has some issues with excluding it globally
// and then mocking in a mock builder setup.
// @see https://github.com/ike18t/ng-mocks/issues/589
describe('issue-589', () => {
  describe('default exclude', () => {
    beforeEach(() => MockBuilder(null, MyModule));

    it('excludes StoreDevtoolsModule', () => {
      expect(() => MockRender(TOKEN)).toThrowError(
        /No provider for InjectionToken TOKEN/,
      );
    });
  });

  describe('explicit keep', () => {
    beforeEach(() => MockBuilder(null, MyModule).keep(TargetModule));

    it('excludes StoreDevtoolsModule', () => {
      expect(MockRender(TOKEN).point.componentInstance).toEqual(1);
    });
  });

  describe('explicit mock', () => {
    beforeEach(() => MockBuilder(null, MyModule).mock(TargetModule));

    it('excludes StoreDevtoolsModule', () => {
      expect(MockRender(TOKEN).point.componentInstance).toEqual(0);
    });
  });
});
