import { Component, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly name = 'target';
}

@Component({
  selector: 'target-726',
  template: '{{ service.name }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@Component({
  selector: 'view',
  template: '<ng-content></ng-content>',
  viewProviders: [TargetService],
})
class ViewComponent {}

@Component({
  providers: [TargetService],
  selector: 'provider',
  template: '<ng-content></ng-content>',
})
class ProviderComponent {}

@NgModule({
  declarations: [TargetComponent, ViewComponent, ProviderComponent],
  exports: [TargetComponent, ViewComponent, ProviderComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/726
describe('issue-726', () => {
  const view = MockRenderFactory(
    '<view><target-726></target-726></view>',
  );
  const provider = MockRenderFactory(
    '<provider><target-726></target-726></provider>',
  );
  const viewComponent = MockRenderFactory(ViewComponent);

  describe('TestBed', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );
    beforeEach(view.configureTestBed);
    beforeEach(provider.configureTestBed);
    beforeEach(viewComponent.configureTestBed);

    it('finds the view provider', () => {
      // TargetComponent doesn't have the access to TargetService.
      expect(view).toThrowError(/No provider for TargetService/);

      // Container knows how to provide TargetService for its views.
      expect(provider).not.toThrow();

      // TargetService is accessed directly view ViewComponent.
      const fixture = viewComponent();
      expect(() =>
        ngMocks.get(fixture.point, TargetService),
      ).not.toThrow();
    });
  });

  describe('MockBuilder', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));
    beforeEach(view.configureTestBed);
    beforeEach(provider.configureTestBed);
    beforeEach(viewComponent.configureTestBed);

    it('finds the view provider', () => {
      // TargetComponent doesn't have the access to TargetService.
      expect(view).toThrowError(/No provider for TargetService/);

      // Container knows how to provide TargetService for its views.
      expect(provider).not.toThrow();

      // TargetService is accessed directly view ViewComponent.
      const fixture = viewComponent();
      expect(() =>
        ngMocks.get(fixture.point, TargetService),
      ).not.toThrow();
    });
  });
});
