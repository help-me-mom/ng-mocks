import { Component, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, MockModule, ngMocks } from 'ng-mocks';

@Component({
  selector: 'module-override-import-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original import',
})
class ImportedComponent {}

@NgModule({
  declarations: [ImportedComponent],
  exports: [ImportedComponent],
})
class ImportedModule {}

@Component({
  selector: 'module-override-import-child',
  host: { 'data-module-replacement': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'replacement import',
})
class ReplacementComponent {}

@NgModule({
  declarations: [ReplacementComponent],
  exports: [ReplacementComponent],
})
class ReplacementModule {}

@Component({
  selector: 'module-override-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '<module-override-import-child></module-override-import-child>',
})
class HostComponent {}

@NgModule({
  imports: [ImportedModule],
  declarations: [HostComponent],
})
class HostModule {}

@Component({
  selector: 'module-override-declaration-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original declaration',
})
class DeclaredComponent {}

@Component({
  selector: 'module-override-declaration-child',
  host: { 'data-declaration-replacement': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'replacement declaration',
})
class DeclaredReplacementComponent {}

@Component({
  selector: 'module-override-declaration-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '<module-override-declaration-child></module-override-declaration-child>',
})
class DeclarationHostComponent {}

@NgModule({
  declarations: [DeclarationHostComponent, DeclaredComponent],
  exports: [DeclaredComponent],
})
class DeclarationModule {}

const VALUE = new InjectionToken<number>('module-override-value');

describe('MockModule:native overrides', () => {
  it('keeps removals of absent classes and provider recipes harmless', async () => {
    const provider = { provide: VALUE, useValue: 0 };
    await TestBed.configureTestingModule({
      imports: [HostModule, MockModule(ImportedModule)],
      providers: [provider],
    })
      .overrideModule(HostModule, {
        remove: {
          imports: [ReplacementModule],
          providers: [provider],
          bootstrap: [ImportedComponent],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('');
    expect(ngMocks.find(fixture, ImportedComponent)).toBeDefined();
    expect(fixture.debugElement.injector.get(VALUE)).toBe(0);
    expect(provider.useValue).toBe(0);
  });

  it('removes a mocked module before adding a distinct native import', async () => {
    await TestBed.configureTestingModule({
      imports: [HostModule, MockModule(ImportedModule)],
    })
      .overrideModule(HostModule, {
        remove: { imports: [ImportedModule] },
        add: { imports: [ReplacementModule] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement import');
    expect(ngMocks.find(fixture, ImportedComponent, null)).toBeNull();
    expect(ngMocks.find(fixture, ReplacementComponent)).toBeDefined();
  });

  it('retains a native import replacement made before mixed configuration', async () => {
    const mock = MockModule(ImportedModule);
    TestBed.overrideModule(HostModule, {
      remove: { imports: [ImportedModule] },
      add: { imports: [ReplacementModule] },
    });
    await TestBed.configureTestingModule({
      imports: [HostModule, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement import');
    expect(ngMocks.find(fixture, ImportedComponent, null)).toBeNull();
    expect(ngMocks.find(fixture, ReplacementComponent)).toBeDefined();
  });

  it('removes resolved declarations and exports before adding their replacement', async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarationModule],
      declarations: [MockComponent(DeclaredComponent)],
    })
      .overrideModule(DeclarationModule, {
        remove: {
          declarations: [DeclaredComponent],
          exports: [DeclaredComponent],
        },
        add: {
          declarations: [DeclaredReplacementComponent],
          exports: [DeclaredReplacementComponent],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(DeclarationHostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe(
      'replacement declaration',
    );
    expect(ngMocks.find(fixture, DeclaredComponent, null)).toBeNull();
    expect(
      ngMocks.find(fixture, DeclaredReplacementComponent),
    ).toBeDefined();
  });

  it('retains native declaration changes made before a kept module is cloned', async () => {
    const mock = MockComponent(DeclaredComponent);
    TestBed.overrideModule(DeclarationModule, {
      remove: {
        declarations: [DeclaredComponent],
        exports: [DeclaredComponent],
      },
      add: {
        declarations: [DeclaredReplacementComponent],
        exports: [DeclaredReplacementComponent],
      },
    });
    await TestBed.configureTestingModule({
      imports: [DeclarationModule],
      declarations: [mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(DeclarationHostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe(
      'replacement declaration',
    );
    expect(ngMocks.find(fixture, DeclaredComponent, null)).toBeNull();
    expect(
      ngMocks.find(fixture, DeclaredReplacementComponent),
    ).toBeDefined();
  });
});
