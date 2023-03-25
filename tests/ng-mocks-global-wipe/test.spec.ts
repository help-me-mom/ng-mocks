import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockComponent,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-global-wipe',
  template: '{{ name }}',
})
class TargetComponent {
  public readonly name: string = 'target';
}

@Component({
  selector: 'target-ng-mocks-global-wipe',
  template: '{{ name }}',
})
class FakeComponent {
  public readonly name: string = 'fake';
}

@Component({
  selector: 'target-ng-mocks-global-wipe',
  template: '{{ name }}',
})
class ShadowComponent {
  public readonly name: string = 'shadow';
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

ngMocks.globalExclude(TargetComponent);
ngMocks.globalKeep(TargetComponent);
ngMocks.defaultMock(TargetComponent, () => ({ name: 'mock' }));
ngMocks.globalReplace(TargetComponent, FakeComponent);
ngMocks.globalWipe(TargetComponent);

describe('ng-mocks-global-replace', () => {
  ngMocks.throwOnConsole();

  describe('MockComponent', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [MockComponent(TargetComponent)],
      }),
    );

    it('works as usual', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-wipe></target-ng-mocks-global-wipe>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-wipe></target-ng-mocks-global-wipe>',
      );
    });
  });

  describe('MockModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }),
    );

    it('mocks as usual', () => {
      const fixture = MockRender<TargetComponent>(
        '<target-ng-mocks-global-wipe></target-ng-mocks-global-wipe>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-wipe></target-ng-mocks-global-wipe>',
      );
      expect(fixture.point.componentInstance.name).toEqual(
        undefined as any,
      );
    });
  });

  describe('MockBuilder:default', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('mocks as usual', () => {
      const fixture = MockRender<TargetComponent>(
        '<target-ng-mocks-global-wipe></target-ng-mocks-global-wipe>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-wipe></target-ng-mocks-global-wipe>',
      );
      expect(fixture.point.componentInstance.name).toEqual(
        undefined as any,
      );
    });
  });

  describe('MockBuilder:exclude', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).exclude(TargetComponent),
    );

    it('switches to exclude', () => {
      expect(() =>
        MockRender(
          '<target-ng-mocks-global-wipe></target-ng-mocks-global-wipe>',
        ),
      ).toThrow();
    });
  });

  describe('MockBuilder:mock', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).replace(
        TargetComponent,
        ShadowComponent,
      ),
    );

    it('switches to replace', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-wipe></target-ng-mocks-global-wipe>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-wipe>shadow</target-ng-mocks-global-wipe>',
      );
    });
  });

  describe('MockBuilder:keep', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).keep(TargetComponent),
    );

    it('switches to keep', () => {
      const fixture = MockRender(
        '<target-ng-mocks-global-wipe></target-ng-mocks-global-wipe>',
      );
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-ng-mocks-global-wipe>target</target-ng-mocks-global-wipe>',
      );
    });
  });
});
