import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Component({
  selector: 'native-subclass-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original',
})
class ChildComponent {}

@NgModule({
  declarations: [ChildComponent],
  exports: [ChildComponent],
})
class DependencyModule {}

@Component({
  selector: 'native-subclass-child',
  host: { 'data-native-subclass': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'replacement',
})
class ReplacementComponent {}

@NgModule({
  declarations: [ReplacementComponent],
  exports: [ReplacementComponent],
})
class ReplacementModule {}

@NgModule({
  imports: [DependencyModule],
  exports: [DependencyModule],
})
class BaseModule {}

@NgModule({
  imports: [DependencyModule],
  exports: [DependencyModule],
})
class SubModule extends BaseModule {}

@Component({
  selector: 'native-subclass-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<native-subclass-child></native-subclass-child>',
})
class HostComponent {}

@NgModule({ imports: [BaseModule], declarations: [HostComponent] })
class HostModule {}

describe('MockModule:real subclass replacements', () => {
  it('allows native changes directly on the real subclass replacement', async () => {
    // View Engine consumes overrides when compiling its module factory.
    const module = MockBuilder()
      .keep(HostModule)
      .replace(BaseModule, SubModule)
      .build();
    await TestBed.configureTestingModule(module)
      .overrideModule(SubModule, {
        remove: {
          imports: [DependencyModule],
          exports: [DependencyModule],
        },
        add: {
          imports: [ReplacementModule],
          exports: [ReplacementModule],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
  });

  it('does not forward base overrides into a real replacement with its own module metadata', async () => {
    const module = MockBuilder()
      .keep(HostModule)
      .replace(BaseModule, SubModule)
      .build();
    await TestBed.configureTestingModule(module)
      .overrideModule(BaseModule, {
        remove: {
          imports: [DependencyModule],
          exports: [DependencyModule],
        },
        add: {
          imports: [ReplacementModule],
          exports: [ReplacementModule],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('original');
    expect(
      ngMocks.find(fixture, ReplacementComponent, null),
    ).toBeNull();
  });
});
