import {
  Component,
  Directive,
  Injectable,
  Self,
  VERSION,
} from '@angular/core';

import {
  MockBuilder,
  MockProvider,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {
  echo() {
    return this.constructor.name;
  }
}

@Directive({
  selector: 'target-3053',
})
class TargetDirective {
  constructor(@Self() public service: TargetService) {}
}

@Component({
  selector: 'target-3053',
  template: ``,
})
class TargetComponent {
  constructor(@Self() public service: TargetService) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3053
// MockRender should create a directive which provides the desired services on @Self level.
describe('issue-3053', () => {
  describe('Directive:default', () => {
    beforeEach(() => MockBuilder(TargetDirective, TargetService));

    it('throws because of missing service', () => {
      expect(() => MockRender(TargetDirective)).toThrowError(
        /No provider for TargetService|NOT_FOUND \[TargetService]/,
      );
    });
  });

  describe('Directive:providers', () => {
    beforeEach(() => MockBuilder(TargetDirective, TargetService));

    it('renders with self provider', () => {
      expect(() =>
        MockRender(TargetDirective, null, {
          providers: [MockProvider(TargetService)],
        }),
      ).not.toThrow();

      const target = ngMocks.findInstance(TargetDirective);
      expect(target.service).toBeDefined();
    });
  });

  if (Number.parseInt(VERSION.major, 10) <= 12) {
    // Before Angular 13, directives are injected after components.
    // This breaks dependency tree, therefore we should skip those tests.
    return;
  }

  describe('Component:default', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetService));

    it('throws because of missing service', () => {
      expect(() => MockRender(TargetComponent)).toThrowError(
        /No provider for TargetService|NOT_FOUND \[TargetService]/,
      );
    });
  });

  describe('Component:providers', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetService));

    it('renders with self provider', () => {
      expect(() =>
        MockRender(TargetComponent, null, {
          providers: [MockProvider(TargetService)],
        }),
      ).not.toThrow();

      const target = ngMocks.findInstance(TargetComponent);
      expect(target.service).toBeDefined();
    });
  });
});
