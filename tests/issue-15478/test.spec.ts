import {
  Component,
  inject,
  Injectable,
  NgModule,
  Service,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Service()
class TargetService {
  public name(): string {
    return 'target';
  }
}

@NgModule({
  providers: [TargetService],
})
class TargetModule {}

@Component({
  selector: 'target-15478',
  standalone: true,
  template: '',
})
class TargetComponent {
  public readonly service = inject(TargetService);
}

@Injectable({ providedIn: 'root' })
class InjectableService {
  public name(): string {
    return 'injectable';
  }
}

@Component({
  selector: 'injectable-15478',
  standalone: true,
  template: '',
})
class InjectableComponent {
  public readonly service = inject(InjectableService);
}

// A Service is categorized as Injectable, but its metadata stays under Service.
// The recursive scan of the global helpers read the missing Injectable metadata and threw.
// @see https://github.com/help-me-mom/ng-mocks/issues/15478
describe('issue-15478', () => {
  describe('FormBuilder', () => {
    // The reported global setup: FormBuilder is a Service in Angular 22.
    beforeEach(() => ngMocks.globalKeep(FormBuilder, true));
    afterEach(() => ngMocks.globalWipe(FormBuilder));

    it('keeps FormBuilder recursively', () => {
      expect(
        TestBed.inject(FormBuilder).control('value').value,
      ).toEqual('value');
    });
  });

  describe('default', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('mocks the Service dependency', () => {
      const fixture = MockRender(TargetComponent);

      expect(
        fixture.point.componentInstance.service.name(),
      ).toBeUndefined();
    });
  });

  describe('globalKeep:service', () => {
    beforeEach(() => {
      ngMocks.globalKeep(TargetService, true);

      return MockBuilder(TargetComponent);
    });
    afterEach(() => ngMocks.globalWipe(TargetService));

    it('keeps the Service dependency', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.point.componentInstance.service.name()).toEqual(
        'target',
      );
    });
  });

  describe('globalKeep:module', () => {
    // The recursive scan reaches the Service through the module providers.
    beforeEach(() => {
      ngMocks.globalKeep(TargetModule, true);

      return MockBuilder(TargetComponent);
    });
    afterEach(() => {
      ngMocks.globalWipe(TargetModule);
      ngMocks.globalWipe(TargetService);
    });

    it('keeps the Service dependency', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.point.componentInstance.service.name()).toEqual(
        'target',
      );
    });
  });

  describe('globalKeep:injectable', () => {
    // Preserved behavior: Injectable metadata is still scanned as before.
    beforeEach(() => {
      ngMocks.globalKeep(InjectableService, true);

      return MockBuilder(InjectableComponent);
    });
    afterEach(() => ngMocks.globalWipe(InjectableService));

    it('keeps the Injectable dependency', () => {
      const fixture = MockRender(InjectableComponent);

      expect(fixture.point.componentInstance.service.name()).toEqual(
        'injectable',
      );
    });
  });

  describe('kept module', () => {
    beforeEach(() => MockBuilder(TargetModule));

    it('keeps the Service of a kept module', () => {
      expect(TestBed.inject(TargetService).name()).toEqual('target');
    });
  });

  describe('globalMock', () => {
    beforeEach(() => {
      ngMocks.globalMock(TargetService, true);

      return MockBuilder(TargetModule);
    });
    afterEach(() => ngMocks.globalWipe(TargetService));

    it('mocks the Service in a kept module', () => {
      expect(TestBed.inject(TargetService).name()).toBeUndefined();
    });
  });

  describe('mocked module', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('mocks the Service of a mocked module', () => {
      expect(TestBed.inject(TargetService).name()).toBeUndefined();
    });
  });

  describe('globalExclude', () => {
    beforeEach(() => {
      ngMocks.globalExclude(TargetService, true);

      return MockBuilder(null, TargetModule);
    });
    afterEach(() => ngMocks.globalWipe(TargetService, true));

    it('excludes the Service from a mocked module', () => {
      // The Service is provided in root, so the original is used instead of the excluded mock.
      expect(TestBed.inject(TargetService).name()).toEqual('target');
    });
  });
});
